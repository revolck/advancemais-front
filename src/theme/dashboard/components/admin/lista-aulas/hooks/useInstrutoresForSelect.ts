"use client";

import { useQuery } from "@tanstack/react-query";
import { listInstrutores, type Instrutor } from "@/api/usuarios";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Hook para buscar instrutores para o select
 * Usado por Admin/Moderador/Pedagógico para selecionar instrutor da aula
 */
export function useInstrutoresForSelect(enabled = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["instrutores-select"],
    queryFn: async () => {
      // Busca todos os instrutores ativos
      const response = await listInstrutores({
        limit: 100,
        status: "ATIVO",
      });
      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const instrutores: SelectOption[] = (data?.data || []).map(
    (instrutor: Instrutor) => ({
      value: instrutor.id,
      label: instrutor.nomeCompleto,
    })
  );

  return {
    instrutores,
    isLoading,
    error,
  };
}
