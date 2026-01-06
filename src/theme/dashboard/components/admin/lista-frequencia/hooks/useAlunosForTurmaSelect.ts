"use client";

import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";

function buildAlunoOption(inscricao: TurmaInscricao): SelectOption {
  const nome =
    inscricao.aluno?.nomeCompleto ||
    inscricao.aluno?.nome ||
    inscricao.alunoId ||
    "—";
  const label = inscricao.alunoId ? `${nome} • ${inscricao.alunoId}` : nome;
  return { value: inscricao.alunoId, label };
}

export function useAlunosForTurmaSelect(params: {
  cursoId: string | null;
  turmaId: string | null;
}) {
  const { cursoId, turmaId } = params;

  const query = useQuery<SelectOption[], Error>({
    queryKey: ["frequencia", "alunos-for-select", cursoId, turmaId],
    queryFn: async () => {
      const inscricoes =
        (await listInscricoes(cursoId as string, turmaId as string)) ?? [];
      return (inscricoes ?? [])
        .filter((i) => Boolean(i?.alunoId))
        .map(buildAlunoOption)
        .sort((a, b) =>
          a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
        );
    },
    enabled: Boolean(cursoId && turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    alunos: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
