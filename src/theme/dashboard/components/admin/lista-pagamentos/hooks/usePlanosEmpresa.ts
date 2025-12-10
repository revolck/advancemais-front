"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlanosEmpresa } from "@/api/empresas/pagamentos";

export function usePlanosEmpresa() {
  return useQuery({
    queryKey: ["empresa", "pagamentos", "planos"],
    queryFn: () => getPlanosEmpresa(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}


