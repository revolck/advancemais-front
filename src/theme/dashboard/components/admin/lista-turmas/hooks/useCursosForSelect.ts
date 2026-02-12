"use client";

import { useQuery } from "@tanstack/react-query";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { listCursos } from "@/api/cursos";

export function useCursosForSelect() {
  const query = useQuery<SelectOption[], Error>({
    queryKey: ["cursos", "for-select", "all"],
    queryFn: async () => {
      const res = await listCursos({ page: 1, pageSize: 200 });
      const data = res?.data || [];
      return data
        .map((c) => ({ value: String(c.id), label: c.nome }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  return {
    cursos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
