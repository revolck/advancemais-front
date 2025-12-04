"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getAdminCompanyById } from "@/api/empresas";
import type { AdminCompanyDetail } from "@/api/empresas";

interface UseTenantCompanyResult {
  company: AdminCompanyDetail | null;
  isLoading: boolean;
  error: string | null;
  tenantId: string | null;
  refetch: () => Promise<void>;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!cookie) return null;
  return cookie.split("=")[1] || null;
}

export function useTenantCompany(enabled = true): UseTenantCompanyResult {
  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar chamadas duplicadas
  const hasFetched = useRef(false);

  const fetchCompany = useCallback(async () => {
    // Se não está habilitado ou já buscou, não faz nada
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const id = getCookieValue("tenant_id");
    setTenantId(id);

    // Se não tem tenant_id, não é empresa - não é erro, apenas não tem dados
    if (!id) {
      setCompany(null);
      setError(null); // Não é erro, apenas não é empresa
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdminCompanyById(id);

      if (response && "empresa" in response) {
        setCompany(response.empresa);
      } else {
        setCompany(null);
      }
    } catch (err: any) {
      // Erros silenciados (403/404) não são erros reais - apenas falta de permissão
      const isSilenced = err?.silenced === true;
      
      if (isSilenced) {
        // Não é erro, apenas não tem permissão - comportamento esperado
        setCompany(null);
        setError(null);
      } else {
        // Erro real - logar e mostrar para o usuário
        const message = err instanceof Error ? err.message : "";
        setCompany(null);
        setError(message || "Erro ao carregar dados da empresa.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    // Evita chamadas duplicadas em StrictMode
    if (hasFetched.current) return;

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    hasFetched.current = true;
    fetchCompany().catch(() => {
      // Erro já tratado em fetchCompany
    });
  }, [enabled, fetchCompany]);

  const refetch = useCallback(async () => {
    hasFetched.current = false;
    await fetchCompany();
  }, [fetchCompany]);

  return useMemo(
    () => ({
      company,
      isLoading,
      error,
      tenantId,
      refetch,
    }),
    [company, isLoading, error, tenantId, refetch]
  );
}
