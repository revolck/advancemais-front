import { apiFetch } from "@/api/client";
import type {
  PagamentosResponse,
  PagamentosParams,
  PlanosEmpresaResponse,
} from "./types";
import { pagamentosRoutes } from "./routes";

/**
 * Busca histórico de pagamentos da empresa
 * @param params - Parâmetros de filtro e paginação
 */
export async function getPagamentosEmpresa(
  params?: PagamentosParams
): Promise<PagamentosResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set("page", String(params.page));
  }
  if (params?.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.metodo) {
    searchParams.set("metodo", params.metodo);
  }
  if (params?.planoId) {
    searchParams.set("planoId", params.planoId);
  }
  if (params?.valorMin !== undefined) {
    searchParams.set("valorMin", String(params.valorMin));
  }
  if (params?.valorMax !== undefined) {
    searchParams.set("valorMax", String(params.valorMax));
  }
  if (params?.dataInicio) {
    searchParams.set("dataInicio", params.dataInicio);
  }
  if (params?.dataFim) {
    searchParams.set("dataFim", params.dataFim);
  }
  if (params?.empresaId) {
    searchParams.set("empresaId", params.empresaId);
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${pagamentosRoutes.list()}?${queryString}`
    : pagamentosRoutes.list();

  return apiFetch<PagamentosResponse>(url, {
    cache: "no-cache",
    retries: 2,
    timeout: 15000,
  });
}

/**
 * Busca lista de planos da empresa para filtros
 */
export async function getPlanosEmpresa(): Promise<PlanosEmpresaResponse> {
  return apiFetch<PlanosEmpresaResponse>(pagamentosRoutes.planos(), {
    cache: "short",
    retries: 2,
    timeout: 10000,
  });
}

export * from "./types";
