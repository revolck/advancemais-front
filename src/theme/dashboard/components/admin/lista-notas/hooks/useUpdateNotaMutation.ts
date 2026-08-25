"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNota,
  deleteNota,
  deleteNotas,
  updateNota,
  type NotaLancamento,
  type NotaOrigem,
} from "@/api/cursos";

export type UpdateNotaVariables =
  | {
      action?: "create";
      cursoId: string;
      turmaId: string;
      alunoId: string;
      nota: number;
      motivo?: string | null;
      origem?: NotaOrigem | null;
    }
  | {
      action: "update";
      cursoId: string;
      turmaId: string;
      notaId: string;
      nota: number;
      motivo?: string | null;
    }
  | {
      action: "delete";
      cursoId: string;
      turmaId: string;
      notaId: string;
    }
  | {
      action?: "delete-bulk";
      cursoId: string;
      turmaId: string;
      alunoId: string;
      nota: null;
    };

interface NotaMutationContext {
  cursoId: string;
  turmaId?: string;
}

type ApiErrorLike = Error & {
  status?: number;
  code?: string;
  details?: Array<{ message?: string }>;
  data?: unknown;
};

type BackendErrorPayload = {
  message?: string;
  code?: string;
  data?: unknown;
  details?: Array<{ message?: string }>;
};

type NormalizedApiError = Error & {
  status?: number;
  code?: string;
  data?: unknown;
};

function normalizeNotaMutationError(
  error: unknown,
  action: "create" | "update" | "delete",
): Error {
  const err = error as ApiErrorLike;
  const payload =
    err.details && typeof err.details === "object"
      ? (err.details as unknown as BackendErrorPayload)
      : undefined;
  const backendCode = err.code ?? payload?.code;
  const detailMessage =
    payload?.details?.[0]?.message ??
    (Array.isArray(err.details) ? err.details[0]?.message : undefined);
  const backendMessage = payload?.message || err.message;
  const backendData = payload?.data ?? err.data;

  const normalized = new Error(
    backendMessage ||
      (action === "delete"
        ? "Não foi possível remover a nota."
        : action === "update"
          ? "Não foi possível atualizar a nota."
        : "Não foi possível salvar a nota."),
  ) as NormalizedApiError;
  normalized.status = err.status;
  normalized.code = backendCode;
  normalized.data = backendData;

  if (detailMessage) {
    normalized.message = detailMessage;
    return normalized;
  }
  if (backendCode === "NOTA_SYSTEM_LOCKED") {
    normalized.message =
      "Não é possível alterar/remover notas geradas automaticamente pelo sistema.";
    return normalized;
  }
  if (backendCode === "NOTA_MAXIMA_ATINGIDA") {
    normalized.message =
      backendMessage || "Este aluno já atingiu a nota máxima permitida (10).";
    return normalized;
  }
  if (backendCode === "NOTA_EXCEDE_LIMITE") {
    const data = backendData as
      | {
          disponivelParaAdicionar?: number;
        }
      | undefined;
    normalized.message =
      backendMessage ||
      (typeof data?.disponivelParaAdicionar === "number"
        ? `A nota excede o limite permitido. Disponível para adicionar: ${data.disponivelParaAdicionar}.`
        : "A nota excede o limite permitido para este aluno.");
    return normalized;
  }
  if (err.status === 409) {
    normalized.message = backendMessage || normalized.message;
    return normalized;
  }
  if (err.status === 403) {
    normalized.message = "Você não tem permissão para realizar esta ação.";
    return normalized;
  }
  if (err.status === 404) {
    normalized.message = "Nota, inscrição ou origem não encontrada.";
    return normalized;
  }
  if (backendMessage) {
    normalized.message = backendMessage;
  }
  return normalized;
}

export function useUpdateNotaMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    NotaLancamento | null,
    Error,
    UpdateNotaVariables,
    NotaMutationContext
  >({
    mutationFn: async (variables) => {
      try {
        if (variables.action === "update") {
          return updateNota(
            variables.cursoId,
            variables.turmaId,
            variables.notaId,
            {
              nota: variables.nota,
              titulo: variables.motivo?.trim() || "Lançamento manual",
            },
          );
        }

        if (variables.action === "delete") {
          await deleteNota(
            variables.cursoId,
            variables.turmaId,
            variables.notaId,
          );
          return null;
        }

        // Compatibilidade com o fluxo antigo: remove todos os lançamentos manuais do aluno.
        if (variables.nota === null) {
          await deleteNotas(variables.cursoId, variables.turmaId, {
            alunoId: variables.alunoId,
          });
          return null;
        }

        // Cria lançamento de nota manual (incremental)
        return createNota(variables.cursoId, variables.turmaId, {
          alunoId: variables.alunoId,
          nota: variables.nota,
          motivo: variables.motivo ?? "Lançamento manual",
          origem: variables.origem,
        });
      } catch (error) {
        const actionForError =
          variables.action === "update"
            ? "update"
            : variables.action === "delete" ||
                ("nota" in variables && variables.nota === null)
              ? "delete"
              : "create";
        throw normalizeNotaMutationError(
          error,
          actionForError,
        );
      }
    },
    onMutate: (variables) => ({
      cursoId: variables.cursoId,
      turmaId: variables.turmaId,
    }),
    onSuccess: (_data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["notas", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["aluno-notas"] });
      queryClient.invalidateQueries({
        queryKey: ["notas", "atuais-por-aluno"],
      });
      queryClient.invalidateQueries({ queryKey: ["cursos", "notas"] });
      if (context?.cursoId) {
        queryClient.invalidateQueries({
          queryKey: ["cursos", context.cursoId, "notas"],
        });
      }
      if (context?.turmaId) {
        queryClient.invalidateQueries({
          queryKey: ["notas", "historico"],
        });
      }
    },
  });
}
