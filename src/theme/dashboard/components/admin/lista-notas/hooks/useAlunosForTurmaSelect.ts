"use client";

import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";

function formatCpf(cpf?: string): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function buildAlunoOption(inscricao: TurmaInscricao): SelectOption {
  const nome =
    inscricao.aluno?.nomeCompleto ||
    inscricao.aluno?.nome ||
    inscricao.alunoId ||
    "—";
  const cpfFormatado = formatCpf(inscricao.aluno?.cpf);
  const cpfDigits = inscricao.aluno?.cpf?.replace(/\D/g, "") || "";
  const matricula =
    inscricao.aluno?.codigo?.trim() || inscricao.aluno?.codUsuario?.trim() || "";
  const label = nome;
  return {
    value: inscricao.alunoId,
    label,
    searchKeywords: [nome, cpfFormatado || "", cpfDigits, matricula].filter(Boolean),
  };
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

      return fromApi;
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
