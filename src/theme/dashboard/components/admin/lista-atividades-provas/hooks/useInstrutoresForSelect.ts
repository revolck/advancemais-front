"use client";

import { useQuery } from "@tanstack/react-query";
import { listAvaliacoesInstrutores } from "@/api/cursos";

interface SelectOption {
  value: string;
  label: string;
}

interface UseInstrutoresForSelectOptions {
  enabled?: boolean;
}

/**
 * Hook para buscar instrutores para o select de avaliações
 * Usa o endpoint específico para avaliações que retorna apenas instrutores ativos
 */
export function useInstrutoresForSelect(
  options: UseInstrutoresForSelectOptions = {}
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["avaliacoes-instrutores"],
    queryFn: async () => {
      const response = await listAvaliacoesInstrutores();
      return response.instrutores || [];
    },
    enabled: options.enabled ?? true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const instrutores: SelectOption[] = (data || []).map((instrutor) => ({
    value: instrutor.id,
    label: instrutor.nomeCompleto,
  }));

  return {
    instrutores,
    isLoading,
    error,
  };
}
