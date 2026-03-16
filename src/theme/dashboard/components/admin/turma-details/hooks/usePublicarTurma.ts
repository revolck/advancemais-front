"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicarTurma, type CursoTurma } from "@/api/cursos";
import { toastCustom } from "@/components/ui/custom";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface UsePublicarTurmaParams {
  cursoId: number | string;
  turma: CursoTurma;
  /** Callback opcional (ex.: fechar modal de confirmação) */
  onSettled?: () => void;
}

/**
 * Hook do domínio turma-details: publicar/despublicar turma.
 * Isola a lógica de mutação e derivação de isPublished.
 */
export function usePublicarTurma({
  cursoId,
  turma,
  onSettled,
}: UsePublicarTurmaParams) {
  const queryClient = useQueryClient();
  const detailQueryKey = queryKeys.turmas.detail(cursoId, String(turma.id));

  const isPublished = useMemo(() => {
    const rawStatus =
      (turma as { publicacaoStatus?: string; statusPublicacao?: string })?.publicacaoStatus ??
      (turma as { statusPublicacao?: string })?.statusPublicacao;
    if (typeof (turma as { publicado?: boolean })?.publicado === "boolean") {
      return Boolean((turma as { publicado: boolean }).publicado);
    }
    if (typeof rawStatus === "string") {
      return rawStatus.toUpperCase() === "PUBLICADO";
    }
    const statusNormalized = turma.status?.toUpperCase?.();
    if (statusNormalized === "RASCUNHO") return false;
    if (statusNormalized === "PUBLICADO") return true;
    return true;
  }, [turma]);

  const mergeTurmaPatch = (
    current: CursoTurma | undefined,
    patch: Partial<CursoTurma> | undefined
  ): CursoTurma => {
    const base = current ?? turma;
    const next = {
      ...base,
      ...(patch ?? {}),
    } as CursoTurma & {
      statusPublicacao?: string;
    };

    const publicationStatus =
      (patch as { publicacaoStatus?: string; statusPublicacao?: string } | undefined)
        ?.publicacaoStatus ??
      (patch as { statusPublicacao?: string } | undefined)?.statusPublicacao ??
      (typeof (patch as { publicado?: boolean } | undefined)?.publicado === "boolean"
        ? (patch as { publicado?: boolean }).publicado
          ? "PUBLICADO"
          : "RASCUNHO"
        : undefined);

    if (publicationStatus) {
      next.publicacaoStatus = publicationStatus as CursoTurma["publicacaoStatus"];
    }

    return next;
  };

  const mutation = useMutation({
    mutationFn: (publicar: boolean) =>
      publicarTurma(cursoId, String(turma.id), publicar),
    onSuccess: async (data, publicar) => {
      const acao = publicar ? "publicada" : "despublicada";
      toastCustom.success(`Turma ${acao} com sucesso!`);
      queryClient.setQueryData(
        detailQueryKey,
        (current?: CursoTurma) => mergeTurmaPatch(current, data)
      );

      await queryClient.invalidateQueries({
        queryKey: detailQueryKey,
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-turmas-list"],
        exact: false,
      });
      onSettled?.();
    },
    onError: (error: {
      status?: number;
      message?: string;
      details?: { code?: string; message?: string };
      code?: string;
    }) => {
      const code = error?.details?.code || error?.code;
      const message = error?.details?.message || error?.message;

      if (error?.status === 403 || code === "FORBIDDEN") {
        toastCustom.error("Você não tem permissão para alterar esta turma.");
      } else if (code === "TURMA_PREREQUISITOS_NAO_ATENDIDOS") {
        toastCustom.error(
          message ||
            "A turma ainda não atende os pré-requisitos para publicação."
        );
      } else if (
        code === "TURMA_DESPUBLICACAO_BLOQUEADA_EM_ANDAMENTO" ||
        code === "TURMA_DESPUBLICACAO_BLOQUEADA_COM_INSCRITOS"
      ) {
        toastCustom.error(
          message || "Não foi possível despublicar a turma no estado atual."
        );
      } else {
        toastCustom.error(
          message ||
            (isPublished
              ? "Erro ao despublicar turma."
              : "Erro ao publicar turma.")
        );
      }
      onSettled?.();
    },
  });

  return {
    mutate: (publicar: boolean) => mutation.mutate(publicar),
    isPending: mutation.isPending,
    isPublished,
  };
}
