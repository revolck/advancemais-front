"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getAdminCompanyById, getMyCompany } from "@/api/empresas";
import type { AdminCompanyDetail } from "@/api/empresas";
import { useUserRole } from "./useUserRole";
import { UserRole } from "@/config/roles";

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
  const role = useUserRole();

  // Ref para evitar chamadas duplicadas
  const hasFetched = useRef(false);

  const fetchCompany = useCallback(async () => {
    // Se não está habilitado ou já buscou, não faz nada
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Se for EMPRESA, usa a nova rota /empresas/minha
      if (role === UserRole.EMPRESA) {
        const response = await getMyCompany();
        
        if (response && "empresa" in response) {
          setCompany(response.empresa);
          setTenantId(response.empresa.id);
        } else {
          setCompany(null);
          setTenantId(null);
        }
      } else {
        // Para outras roles, usa o tenant_id do cookie (comportamento antigo)
        const id = getCookieValue("tenant_id");
        setTenantId(id);

        // Se não tem tenant_id, não é empresa - não é erro, apenas não tem dados
        if (!id) {
          setCompany(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        const response = await getAdminCompanyById(id);

        if (response && "empresa" in response) {
          setCompany(response.empresa);
        } else {
          setCompany(null);
        }
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
  }, [enabled, role]);

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
