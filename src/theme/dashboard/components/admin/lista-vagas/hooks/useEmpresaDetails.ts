"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminCompanyById, type AdminCompanyDetail } from "@/api/empresas";

export function useEmpresaDetails(empresaId: string | null) {
  const [empresaDetails, setEmpresaDetails] =
    useState<AdminCompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresaDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdminCompanyById(id);

      if ("empresa" in response) {
        setEmpresaDetails(response.empresa);
      } else {
        throw new Error(
          response.message || "Erro ao carregar detalhes da empresa."
        );
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes da empresa:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar detalhes da empresa. Tente novamente."
      );
      setEmpresaDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (empresaId) {
      fetchEmpresaDetails(empresaId);
    } else {
      setEmpresaDetails(null);
      setError(null);
    }
  }, [empresaId, fetchEmpresaDetails]);

  return {
    empresaDetails,
    isLoading,
    error,
    refetch: () =>
      empresaId ? fetchEmpresaDetails(empresaId) : Promise.resolve(),
  };
}
