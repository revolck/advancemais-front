"use client";

import { useQuery } from "@tanstack/react-query";
import { listTurmas } from "@/api/cursos";
import type { CursoTurma } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

function getTimestamp(value?: string): number | null {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : null;
}

function sortTurmasByInicioMaisRecente(turmas: CursoTurma[]): CursoTurma[] {
  return [...turmas].sort((a, b) => {
    const aTs = getTimestamp(a.dataInicio);
    const bTs = getTimestamp(b.dataInicio);

    if (aTs !== null && bTs !== null && aTs !== bTs) {
      return bTs - aTs;
    }

    if (aTs !== null && bTs === null) return -1;
    if (aTs === null && bTs !== null) return 1;

    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

async function fetchTurmasForSelect(cursoId: string): Promise<SelectOption[]> {
  const turmas = await listTurmas(cursoId);
  return sortTurmasByInicioMaisRecente(turmas ?? []).map((t) => ({
    value: String(t.id),
    label: t.nome,
  }));
}

export function useTurmasForSelect(cursoId: string | null) {
  const query = useQuery({
    queryKey: ["turmas", "for-select", cursoId],
    queryFn: () => fetchTurmasForSelect(cursoId as string),
    enabled: Boolean(cursoId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    turmas: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
