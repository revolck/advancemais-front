"use client";

import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";
import { formatReadableText } from "@/lib/display-text";

/** Mesma regra da API: certificado só para quem concluiu ou ainda está cursando */
const SEM_CERTIFICADO = new Set(["CANCELADO", "REPROVADO", "TRANCADO", "AGUARDANDO_PAGAMENTO"]);

export const podeReceberCertificado = (inscricao: TurmaInscricao) =>
  !SEM_CERTIFICADO.has(String(inscricao.statusInscricao ?? inscricao.status ?? "").toUpperCase());

function buildAlunoOption(inscricao: TurmaInscricao): SelectOption {
  const nome =
    inscricao.aluno?.nomeCompleto ||
    inscricao.aluno?.nome ||
    inscricao.alunoId ||
    "—";
  const nomeDisplay = formatReadableText(nome);
  const label = inscricao.alunoId
    ? `${nomeDisplay} • ${inscricao.alunoId}`
    : nomeDisplay;
  return { value: inscricao.alunoId, label };
}

export function useAlunosForTurmaSelect(params: {
  cursoId: string | null;
  turmaId: string | null;
}) {
  const { cursoId, turmaId } = params;

  const query = useQuery<SelectOption[], Error>({
    queryKey: ["certificados", "alunos-for-select", cursoId, turmaId],
    queryFn: async () => {
      const inscricoes = await listInscricoes(
        cursoId as string,
        turmaId as string
      );
      return (inscricoes ?? [])
        .filter((i) => Boolean(i?.alunoId) && podeReceberCertificado(i))
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
