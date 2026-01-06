"use client";

import { useQuery } from "@tanstack/react-query";
import { listAvaliacoesInstrutores } from "@/api/cursos";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Hook para buscar instrutores para o select de avaliações
 * Usa o endpoint específico para avaliações que retorna apenas instrutores ativos
 */
export function useInstrutoresForSelect() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["avaliacoes-instrutores"],
    queryFn: async () => {
      const response = await listAvaliacoesInstrutores();
      return response.instrutores || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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
