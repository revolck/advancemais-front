"use client";

import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";
import { getMockAlunosForTurma } from "@/mockData/notas";

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
    queryKey: ["notas", "alunos-for-select", cursoId, turmaId],
    queryFn: async () => {
      const inscricoes = await listInscricoes(cursoId as string, turmaId as string);
      const fromApi = (inscricoes ?? [])
        .filter((i) => Boolean(i?.alunoId))
        .map(buildAlunoOption)
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));

      if (fromApi.length > 0) return fromApi;

      const mock = getMockAlunosForTurma({
        cursoId: cursoId as string,
        turmaId: turmaId as string,
        count: 12,
      });
      return mock
        .map((a) => ({
          value: a.alunoId,
          label: `${a.alunoNome} • ${a.alunoId}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));
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

