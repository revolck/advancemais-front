"use client";

import { useQuery } from "@tanstack/react-query";
import { listCursos } from "@/api/cursos";
import type { SelectOption } from "@/components/ui/custom/select/types";

async function fetchCursosForSelect(): Promise<SelectOption[]> {
  try {
    // Busca enxuta para first load de selects.
    const res = await listCursos({ 
      pageSize: 200, 
      statusPadrao: "PUBLICADO" 
    });
    
    const data = res?.data || [];
    
    return data
      .map((c) => ({ value: String(c.id), label: c.nome }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  } catch (error) {
    console.error("Erro ao buscar cursos para select:", error);
    return [];
  }
}

export function useCursosForSelect() {
  const query = useQuery({
    queryKey: ["cursos", "for-select", "publicado"],
    queryFn: fetchCursosForSelect,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // Não retentar em caso de erro
    refetchOnWindowFocus: false, // Não buscar novamente ao focar janela
    refetchOnReconnect: false,
  });

  return {
    cursos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
