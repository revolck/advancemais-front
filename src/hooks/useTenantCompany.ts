"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [tenantId, setTenantId] = useState<string | null>(() =>
    enabled ? getCookieValue("tenant_id") : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const id = getCookieValue("tenant_id");
    setTenantId(id);

    if (!id) {
      setCompany(null);
      setError(
        "Não foi possível identificar a empresa atual. Entre em contato com o suporte."
      );
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
        setError("Resposta inesperada ao carregar dados da empresa.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados da empresa.";
      setCompany(null);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchCompany().catch(() => {
      // Erro já tratado em fetchCompany
    });
  }, [enabled, fetchCompany]);

  const refetch = useCallback(async () => {
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
