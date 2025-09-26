"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";

interface EmpresaOption extends SelectOption {
  plano: string;
}

export function useEmpresasForSelect() {
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Dados mockados temporariamente para resolver o problema da API
      const mockEmpresas: EmpresaOption[] = [
        {
          value: "1",
          label: "TechCorp Solutions",
          plano: "Plano Premium",
        },
        {
          value: "2",
          label: "Inovação Digital Ltda",
          plano: "Plano Básico",
        },
        {
          value: "3",
          label: "StartupXYZ",
          plano: "Sem plano de assinatura",
        },
        {
          value: "4",
          label: "Empresa ABC",
          plano: "Plano Empresarial",
        },
        {
          value: "5",
          label: "TechStart Inc",
          plano: "Plano Avançado",
        },
      ];

      setEmpresas(mockEmpresas);
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
      setError("Erro ao carregar empresas. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  return {
    empresas,
    isLoading,
    error,
    refetch: fetchEmpresas,
  };
}
