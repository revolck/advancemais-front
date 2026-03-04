"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNota,
  deleteNotas,
  type NotaLancamento,
  type NotaOrigem,
} from "@/api/cursos";

export interface UpdateNotaVariables {
  cursoId: string;
  turmaId: string;
  alunoId: string;
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigem | null;
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
  action: "create" | "delete"
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
        : "Não foi possível salvar a nota.")
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
      "Não é possível alterar/remover notas geradas automaticamente pelo sistema."
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

  return useMutation<NotaLancamento | null, Error, UpdateNotaVariables>({
    mutationFn: async ({ cursoId, turmaId, alunoId, nota, motivo, origem }) => {
      try {
        // Se nota for null, remove os lançamentos manuais do aluno
        if (nota === null) {
          await deleteNotas(cursoId, turmaId, { alunoId });
          return null;
        }

        // Cria lançamento de nota manual (incremental)
        return createNota(cursoId, turmaId, {
          alunoId,
          nota,
          motivo: motivo ?? "Lançamento manual",
          origem,
        });
      } catch (error) {
        throw normalizeNotaMutationError(error, nota === null ? "delete" : "create");
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notas", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notas", "atuais-por-aluno"] });
      queryClient.invalidateQueries({ queryKey: ["cursos", "notas"] });
      queryClient.invalidateQueries({
        queryKey: ["cursos", variables.cursoId, "notas"],
      });
    },
  });
}
