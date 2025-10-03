"use client";

import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  listAdminCompanies,
  type AdminCompanyListItem,
  type AdminCompanyListResponse,
  type AdminCompanyListApiResponse,
} from "@/api/empresas";

interface EmpresaOption extends SelectOption {
  planoNome?: string;
  planoModo?: string;
}

function isErrorResponse(
  response: AdminCompanyListApiResponse
): response is Extract<AdminCompanyListApiResponse, { success?: false }> {
  return "success" in response && response.success === false;
}

function isEmpresaElegivel(empresa: AdminCompanyListItem): boolean {
  const plano = empresa.plano;

  if (!plano || !plano.id) {
    return false;
  }

  const modosValidos = new Set(["CLIENTE", "PARCEIRO", "TESTE"]);
  const modoValido = modosValidos.has(plano.modo);
  const planoAtivo = plano.status === "ATIVO";

  const empresaParceira = Boolean(empresa.parceira);
  const empresaEmTeste =
    plano.modo === "TESTE" || empresa.diasTesteDisponibilizados > 0;

  return (
    modoValido &&
    planoAtivo &&
    (plano.modo === "CLIENTE" || empresaParceira || empresaEmTeste)
  );
}

function mapEmpresaToOption(empresa: AdminCompanyListItem): EmpresaOption {
  const plano = empresa.plano;

  return {
    value: empresa.id,
    label: empresa.nome,
    planoNome: plano?.nome,
    planoModo: plano?.modo,
  };
}

export function useEmpresasForSelect() {
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [empresasData, setEmpresasData] = useState<AdminCompanyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pageSize = 100;
      const collected: AdminCompanyListItem[] = [];

      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const response = await listAdminCompanies({
          page: currentPage,
          pageSize,
        });

        if (isErrorResponse(response)) {
          throw new Error(response.message || "Erro ao carregar empresas.");
        }

        const data = response.data ?? [];
        const pagination = response.pagination;

        collected.push(...data);

        totalPages = pagination?.totalPages ?? currentPage;
        currentPage += 1;
        if (!pagination) {
          break;
        }

        if (currentPage > (pagination.totalPages ?? 1)) {
          break;
        }
      }

      const elegiveis = collected.filter(isEmpresaElegivel);

      const options = elegiveis
        .map(mapEmpresaToOption)
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

      setEmpresas(options);
      setEmpresasData(elegiveis);
    } catch (err) {
      console.error("Erro ao buscar empresas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar empresas. Tente novamente."
      );
      setEmpresas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  return {
    empresas,
    empresasData,
    isLoading,
    error,
    refetch: fetchEmpresas,
  };
}
