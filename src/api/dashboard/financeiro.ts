import { apiFetch } from "@/api/client";
import type {
  DashboardFinanceiroFiltrosResponse,
  DashboardFinanceiroParams,
  DashboardFinanceiroResponse,
} from "./types";

const FINANCEIRO_BASE = "/api/v1/dashboard/financeiro" as const;

function buildQuery(params?: DashboardFinanceiroParams) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getDashboardFinanceiro(
  params?: DashboardFinanceiroParams,
): Promise<DashboardFinanceiroResponse> {
  return apiFetch<DashboardFinanceiroResponse>(
    `${FINANCEIRO_BASE}${buildQuery(params)}`,
    {
      init: { method: "GET" },
      cache: "no-cache",
      silence403: true,
    },
  );
}

export async function getDashboardFinanceiroFiltros(): Promise<DashboardFinanceiroFiltrosResponse> {
  return apiFetch<DashboardFinanceiroFiltrosResponse>(`${FINANCEIRO_BASE}/filtros`, {
    init: { method: "GET" },
    cache: "no-cache",
    silence403: true,
  });
}
