import { apiFetch } from "@/api/client";
import type { VisaoGeralResponse, VisaoGeralParams } from "./types";

const DASHBOARD_ROUTES = {
  VISAO_GERAL: "/api/v1/empresas/visao-geral",
};

/**
 * Busca dados da visão geral da empresa
 * @param params - Parâmetros opcionais (empresaId para ADMIN/MODERADOR)
 */
export async function getVisaoGeralEmpresa(
  params?: VisaoGeralParams
): Promise<VisaoGeralResponse> {
  const searchParams = new URLSearchParams();

  if (params?.empresaId) {
    searchParams.set("empresaId", params.empresaId);
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${DASHBOARD_ROUTES.VISAO_GERAL}?${queryString}`
    : DASHBOARD_ROUTES.VISAO_GERAL;

  return apiFetch<VisaoGeralResponse>(url, {
    cache: "no-cache",
    retries: 2,
    timeout: 15000,
  });
}

export * from "./types";
