"use client";

import { useQuery } from "@tanstack/react-query";
import { listTurmas } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

async function fetchTurmasForSelect(cursoId: string): Promise<SelectOption[]> {
  const turmas = await listTurmas(cursoId);
  return (turmas ?? [])
    .map((t) => ({ value: String(t.id), label: t.nome }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function useTurmasForSelect(cursoId: string | null) {
  const query = useQuery({
    queryKey: ["notas", "turmas-for-select", cursoId],
    queryFn: () => fetchTurmasForSelect(cursoId as string),
    enabled: Boolean(cursoId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    turmas: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

