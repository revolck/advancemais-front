"use client";

import { useQuery } from "@tanstack/react-query";
import { listCursos } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

async function fetchCursosForSelect(): Promise<SelectOption[]> {
  const res = await listCursos({ page: 1, pageSize: 100 });
  const data = res?.data || [];
  return data
    .map((c) => ({ value: String(c.id), label: c.nome }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

export function useCursosForSelect() {
  const query = useQuery({
    queryKey: ["frequencia", "cursos-for-select"],
    queryFn: fetchCursosForSelect,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    cursos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
