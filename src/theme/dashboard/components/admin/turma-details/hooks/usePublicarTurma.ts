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

  const mutation = useMutation({
    mutationFn: (publicar: boolean) =>
      publicarTurma(cursoId, String(turma.id), publicar),
    onSuccess: (data) => {
      const acao = isPublished ? "despublicada" : "publicada";
      toastCustom.success(`Turma ${acao} com sucesso!`);
      queryClient.setQueryData(
        queryKeys.turmas.detail(cursoId, String(turma.id)),
        data
      );
      queryClient.invalidateQueries({
        queryKey: ["admin-turmas-list"],
        exact: false,
      });
      onSettled?.();
    },
    onError: (error: { message?: string }) => {
      const msg =
        error?.message ||
        (isPublished
          ? "Erro ao colocar turma em rascunho."
          : "Erro ao publicar turma.");
      toastCustom.error(msg);
      onSettled?.();
    },
  });

  return {
    mutate: (publicar: boolean) => mutation.mutate(publicar),
    isPending: mutation.isPending,
    isPublished,
  };
}
