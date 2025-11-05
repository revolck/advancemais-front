import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { auditoriaRoutes } from "./routes";
import type {
  AuditoriaLog,
  AuditoriaLogsListParams,
  AuditoriaLogsListResponse,
  AuditoriaScript,
  AuditoriaScriptsListParams,
  AuditoriaScriptsListResponse,
  CreateAuditoriaScriptPayload,
  UpdateAuditoriaScriptPayload,
  AuditoriaTransacao,
  AuditoriaTransacoesListParams,
  AuditoriaTransacoesListResponse,
  CreateAuditoriaTransacaoPayload,
  UpdateAuditoriaTransacaoPayload,
  UpdateAuditoriaTransacaoStatusPayload,
  AuditoriaEstatisticasLogs,
} from "./types";

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers as Record<string, string>;
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildHeaders(additional?: HeadersInit): Record<string, string> {
  return {
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
    ...normalizeHeaders(additional),
  };
}

function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------
// Logs
// ---------------------------------------------
export async function listAuditoriaLogs(
  params?: AuditoriaLogsListParams,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.logs.list()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaLogById(id: string): Promise<AuditoriaLog> {
  return apiFetch<AuditoriaLog>(auditoriaRoutes.logs.get(id), {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaLogsByEntidade(
  entidadeId: string,
  params?: { entidadeTipo?: string; page?: number; pageSize?: number },
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.logs.byEntidade(entidadeId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaLogsByUsuario(
  usuarioId: string,
  params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string },
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.logs.byUsuario(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAccessLogs(params?: AuditoriaLogsListParams) {
  const url = `${auditoriaRoutes.logs.acesso()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listChangeLogs(params?: AuditoriaLogsListParams) {
  const url = `${auditoriaRoutes.logs.alteracao()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listErrorLogs(
  params?: AuditoriaLogsListParams & { nivel?: string },
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.logs.erro()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getLogsEstatisticas(
  params?: { startDate?: string; endDate?: string },
): Promise<AuditoriaEstatisticasLogs> {
  const url = `${auditoriaRoutes.logs.estatisticas()}${buildQuery(params)}`;
  return apiFetch<AuditoriaEstatisticasLogs>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function exportLogsCsv(
  params?: AuditoriaLogsListParams,
): Promise<string> {
  const url = `${auditoriaRoutes.logs.exportar()}${buildQuery(params)}`;
  // apiFetch retornará texto quando não for JSON
  return apiFetch<string>(url, {
    init: { method: "GET", headers: buildHeaders({ Accept: 'text/csv' }) },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Scripts
// ---------------------------------------------
export async function listAuditoriaScripts(
  params?: AuditoriaScriptsListParams,
): Promise<AuditoriaScriptsListResponse> {
  const url = `${auditoriaRoutes.scripts.list()}${buildQuery(params)}`;
  return apiFetch<AuditoriaScriptsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function createAuditoriaScript(
  payload: CreateAuditoriaScriptPayload,
): Promise<AuditoriaScript> {
  return apiFetch<AuditoriaScript>(auditoriaRoutes.scripts.create(), {
    init: {
      method: "POST",
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function getAuditoriaScriptById(id: string): Promise<AuditoriaScript> {
  return apiFetch<AuditoriaScript>(auditoriaRoutes.scripts.get(id), {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function updateAuditoriaScript(
  id: string,
  payload: UpdateAuditoriaScriptPayload,
): Promise<AuditoriaScript> {
  return apiFetch<AuditoriaScript>(auditoriaRoutes.scripts.update(id), {
    init: {
      method: "PATCH",
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function getAuditoriaScriptsEstatisticas(
  params?: { startDate?: string; endDate?: string },
): Promise<Record<string, any>> {
  const url = `${auditoriaRoutes.scripts.estatisticas()}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function executarAuditoriaScript(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(auditoriaRoutes.scripts.executar(id), {
    init: { method: "POST", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function cancelarAuditoriaScript(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(auditoriaRoutes.scripts.cancelar(id), {
    init: { method: "POST", headers: buildHeaders() },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Transações
// ---------------------------------------------
export async function listAuditoriaTransacoes(
  params?: AuditoriaTransacoesListParams,
): Promise<AuditoriaTransacoesListResponse> {
  const url = `${auditoriaRoutes.transacoes.list()}${buildQuery(params)}`;
  return apiFetch<AuditoriaTransacoesListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function createAuditoriaTransacao(
  payload: CreateAuditoriaTransacaoPayload,
): Promise<AuditoriaTransacao> {
  return apiFetch<AuditoriaTransacao>(auditoriaRoutes.transacoes.create(), {
    init: {
      method: "POST",
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function getAuditoriaTransacaoById(id: string): Promise<AuditoriaTransacao> {
  return apiFetch<AuditoriaTransacao>(auditoriaRoutes.transacoes.get(id), {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function updateAuditoriaTransacao(
  id: string,
  payload: UpdateAuditoriaTransacaoPayload,
): Promise<AuditoriaTransacao> {
  return apiFetch<AuditoriaTransacao>(auditoriaRoutes.transacoes.update(id), {
    init: {
      method: "PATCH",
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function listAuditoriaTransacoesByEmpresa(
  empresaId: string,
  params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string },
): Promise<AuditoriaTransacoesListResponse> {
  const url = `${auditoriaRoutes.transacoes.byEmpresa(empresaId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaTransacoesListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaTransacoesByUsuario(
  usuarioId: string,
  params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string },
): Promise<AuditoriaTransacoesListResponse> {
  const url = `${auditoriaRoutes.transacoes.byUsuario(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaTransacoesListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaTransacoesEstatisticas(
  params?: { startDate?: string; endDate?: string },
): Promise<Record<string, any>> {
  const url = `${auditoriaRoutes.transacoes.estatisticas()}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaTransacoesResumo(
  params?: { startDate?: string; endDate?: string },
): Promise<Record<string, any>> {
  const url = `${auditoriaRoutes.transacoes.resumo()}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function updateAuditoriaTransacaoStatus(
  id: string,
  payload: UpdateAuditoriaTransacaoStatusPayload,
): Promise<AuditoriaTransacao> {
  return apiFetch<AuditoriaTransacao>(auditoriaRoutes.transacoes.status(id), {
    init: {
      method: "PATCH",
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Assinaturas (auditoria)
// ---------------------------------------------
export async function listAuditoriaAssinaturas(
  params?: Record<string, any>,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.assinaturas.list()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaAssinaturaById(id: string): Promise<Record<string, any>> {
  return apiFetch<Record<string, any>>(auditoriaRoutes.assinaturas.get(id), {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaAssinaturasEstatisticas(
  params?: { startDate?: string; endDate?: string },
): Promise<Record<string, any>> {
  const url = `${auditoriaRoutes.assinaturas.estatisticas()}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaAssinaturasLogs(
  params?: Record<string, any>,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.assinaturas.logs()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaAssinaturasPagamentos(
  params?: Record<string, any>,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.assinaturas.pagamentos()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function listAuditoriaAssinaturasPlanos(
  params?: Record<string, any>,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.assinaturas.planos()}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaAssinaturasResumo(
  params?: { startDate?: string; endDate?: string },
): Promise<Record<string, any>> {
  const url = `${auditoriaRoutes.assinaturas.resumo()}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

// ---------------------------------------------
// Usuários (auditoria)
// ---------------------------------------------
export async function getAuditoriaUsuarioHistorico(
  usuarioId: string,
  params?: Record<string, any>,
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.usuarios.historico(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioLogin(usuarioId: string, params?: Record<string, any>) {
  const url = `${auditoriaRoutes.usuarios.login(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioPerfil(usuarioId: string, params?: Record<string, any>) {
  const url = `${auditoriaRoutes.usuarios.perfil(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioAcoes(usuarioId: string, params?: Record<string, any>) {
  const url = `${auditoriaRoutes.usuarios.acoes(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioAcessos(usuarioId: string, params?: Record<string, any>) {
  const url = `${auditoriaRoutes.usuarios.acessos(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioPermissoes(
  usuarioId: string,
  params?: Record<string, any>,
) {
  const url = `${auditoriaRoutes.usuarios.permissoes(usuarioId)}${buildQuery(params)}`;
  return apiFetch<AuditoriaLogsListResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioEstatisticas(
  usuarioId: string,
  params?: { startDate?: string; endDate?: string },
) {
  const url = `${auditoriaRoutes.usuarios.estatisticas(usuarioId)}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export async function getAuditoriaUsuarioResumo(
  usuarioId: string,
  params?: { startDate?: string; endDate?: string },
) {
  const url = `${auditoriaRoutes.usuarios.resumo(usuarioId)}${buildQuery(params)}`;
  return apiFetch<Record<string, any>>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });
}

export * from './types';

