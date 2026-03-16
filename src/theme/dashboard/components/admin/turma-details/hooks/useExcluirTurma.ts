"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTurma, type CursoTurma } from "@/api/cursos";
import { toastCustom } from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";

interface TurmaApiError extends Error {
  status?: number;
  details?: {
    code?: string;
    message?: string;
  };
  code?: string;
}

export interface UseExcluirTurmaParams {
  cursoId: number | string;
  turma: CursoTurma;
  onSuccess?: () => void;
  onSettled?: () => void;
}

export function useExcluirTurma({
  cursoId,
  turma,
  onSuccess,
  onSettled,
}: UseExcluirTurmaParams) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteTurma(cursoId, String(turma.id)),
    onSuccess: async () => {
      toastCustom.success({
        title: "Turma excluída",
        description: "A turma foi removida da listagem ativa.",
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-turmas-list"],
        exact: false,
      });
      await queryClient.removeQueries({
        queryKey: queryKeys.turmas.detail(cursoId, String(turma.id)),
        exact: true,
      });

      onSuccess?.();
    },
    onError: (error) => {
      const err = error as TurmaApiError;
      const code = err?.details?.code || err?.code;
      const message =
        err?.details?.message || err?.message || "Não foi possível excluir a turma.";

      if (code === "TURMA_EXCLUSAO_BLOQUEADA_JA_INICIADA") {
        toastCustom.error({
          title: "Exclusão bloqueada",
          description:
            message ||
            "Não é possível excluir uma turma que já foi iniciada.",
        });
        return;
      }

      if (code === "TURMA_EXCLUSAO_BLOQUEADA_COM_INSCRITOS") {
        toastCustom.error({
          title: "Exclusão bloqueada",
          description:
            message ||
            "Não é possível excluir uma turma com alunos inscritos.",
        });
        return;
      }

      if (err?.status === 403 || code === "FORBIDDEN") {
        toastCustom.error({
          title: "Sem permissão",
          description: "Você não tem permissão para excluir esta turma.",
        });
        return;
      }

      toastCustom.error({
        title: "Erro ao excluir turma",
        description: message,
      });
    },
    onSettled: () => {
      onSettled?.();
    },
  });

  return {
    mutate: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
