import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { auditoriaRoutes } from "./routes";
import type {
  AuditoriaLog,
  AuditoriaLogsListParams,
  AuditoriaLogsListResponse,
  AuditoriaActor,
  AuditoriaEntidade,
  AuditoriaContexto,
  AuditoriaFiltrosDisponiveis,
  AuditoriaResumo,
  AuditoriaScript,
  AuditoriaScriptsListParams,
  AuditoriaScriptsListResponse,
  CreateAuditoriaScriptPayload,
  UpdateAuditoriaScriptPayload,
  AuditoriaTransacao,
  AuditoriaTransacaoContexto,
  AuditoriaTransacaoEmpresa,
  AuditoriaTransacaoUsuario,
  AuditoriaTransacoesFiltrosDisponiveis,
  AuditoriaTransacoesListParams,
  AuditoriaTransacoesListResponse,
  AuditoriaTransacoesResumo,
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
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      if (v.length > 0) {
        sp.set(k, v.join(","));
      }
      return;
    }
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

type AuditoriaLogsApiPayload = {
  items?: unknown[];
  pagination?: Partial<AuditoriaLogsListResponse["pagination"]>;
  resumo?: AuditoriaResumo;
  filtrosDisponiveis?: AuditoriaFiltrosDisponiveis;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

type AuditoriaLogsApiResponse =
  | AuditoriaLogsListResponse
  | {
      success?: boolean;
      data?: AuditoriaLogsApiPayload;
    };

function normalizeAuditoriaActor(actor: any): AuditoriaActor | null {
  if (!actor && actor !== 0) return null;

  return {
    id: actor?.id ?? null,
    nome: actor?.nome ?? "Sistema",
    role: actor?.role ?? "SISTEMA",
    roleLabel: actor?.roleLabel ?? "Sistema interno",
    avatarUrl: actor?.avatarUrl ?? null,
  };
}

function normalizeAuditoriaEntidade(entity: any): AuditoriaEntidade | null {
  if (!entity && entity !== 0) return null;

  return {
    id: entity?.id ?? null,
    tipo: entity?.tipo ?? null,
    codigo: entity?.codigo ?? null,
    nomeExibicao: entity?.nomeExibicao ?? null,
  };
}

function normalizeAuditoriaContexto(context: any, log: any): AuditoriaContexto | null {
  const ip = context?.ip ?? log?.ip ?? null;
  const userAgent = context?.userAgent ?? log?.userAgent ?? null;
  const origem = context?.origem ?? null;

  if (!ip && !userAgent && !origem) {
    return null;
  }

  return {
    ip,
    userAgent,
    origem,
  };
}

function normalizeAuditoriaLog(log: any): AuditoriaLog {
  const ator = normalizeAuditoriaActor(log?.ator);
  const entidade = normalizeAuditoriaEntidade(log?.entidade);
  const contexto = normalizeAuditoriaContexto(log?.contexto, log);
  const dadosAnteriores = log?.dadosAnteriores ?? log?.dadosAntes ?? null;
  const dadosNovos = log?.dadosNovos ?? log?.dadosDepois ?? null;
  const dataHora = log?.dataHora ?? log?.criadoEm ?? null;

  return {
    id: String(log?.id ?? ""),
    categoria: log?.categoria ?? "SISTEMA",
    tipo: log?.tipo ?? "",
    acao: log?.acao ?? "",
    descricao: log?.descricao ?? log?.acao ?? "",
    dataHora,
    ator,
    entidade,
    contexto,
    dadosAnteriores,
    dadosNovos,
    meta: log?.meta ?? null,
    // Compatibilidade com consumidores antigos
    usuarioId: log?.usuarioId ?? ator?.id ?? null,
    entidadeId: log?.entidadeId ?? entidade?.id ?? null,
    entidadeTipo: log?.entidadeTipo ?? entidade?.tipo ?? null,
    dadosAntes: dadosAnteriores,
    dadosDepois: dadosNovos,
    ip: log?.ip ?? contexto?.ip ?? null,
    userAgent: log?.userAgent ?? contexto?.userAgent ?? null,
    criadoEm: log?.criadoEm ?? dataHora ?? undefined,
  };
}

function normalizeAuditoriaLogsListResponse(
  response: AuditoriaLogsApiResponse,
  fallback?: { page?: number; pageSize?: number },
): AuditoriaLogsListResponse {
  const payload: AuditoriaLogsApiPayload =
    "data" in response && response.data
      ? response.data
      : (response as AuditoriaLogsApiPayload);
  const items = (payload.items ?? []).map(normalizeAuditoriaLog);

  const page = payload.pagination?.page ?? payload.page ?? fallback?.page ?? 1;
  const pageSize =
    payload.pagination?.pageSize ?? payload.pageSize ?? fallback?.pageSize ?? 10;
  const total = payload.pagination?.total ?? payload.total ?? items.length;
  const totalPages =
    payload.pagination?.totalPages ??
    payload.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    total,
    page,
    pageSize,
    totalPages,
    resumo: payload.resumo,
    filtrosDisponiveis: payload.filtrosDisponiveis,
  };
}

function normalizeAuditoriaLogsParams(
  params?: AuditoriaLogsListParams,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const normalized: Record<string, unknown> = {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    entidadeTipo: params.entidadeTipo,
    entidadeId: params.entidadeId,
    atorRole: params.atorRole,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  };

  normalized.categorias = params.categorias ?? params.categoria;
  normalized.tipos = params.tipos ?? params.tipo;
  normalized.atorId = params.atorId ?? params.usuarioId;
  normalized.dataInicio = params.dataInicio ?? params.startDate;
  normalized.dataFim = params.dataFim ?? params.endDate;

  return normalized;
}

type AuditoriaTransacoesApiPayload = {
  items?: unknown[];
  pagination?: Partial<AuditoriaTransacoesListResponse["pagination"]>;
  resumo?: AuditoriaTransacoesResumo;
  filtrosDisponiveis?: AuditoriaTransacoesFiltrosDisponiveis;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

type AuditoriaTransacoesApiResponse =
  | AuditoriaTransacoesListResponse
  | {
      success?: boolean;
      data?: AuditoriaTransacoesApiPayload;
    };

function normalizeAuditoriaTransacaoUsuario(
  usuario: any,
  transacao: any,
): AuditoriaTransacaoUsuario | null {
  if (!usuario && !transacao?.usuarioId) return null;

  return {
    id: usuario?.id ?? transacao?.usuarioId ?? null,
    nome: usuario?.nome ?? null,
    email: usuario?.email ?? null,
    codigo: usuario?.codigo ?? null,
  };
}

function normalizeAuditoriaTransacaoEmpresa(
  empresa: any,
  transacao: any,
): AuditoriaTransacaoEmpresa | null {
  if (!empresa && !transacao?.empresaId) return null;

  return {
    id: empresa?.id ?? transacao?.empresaId ?? null,
    nomeExibicao: empresa?.nomeExibicao ?? null,
    codigo: empresa?.codigo ?? null,
  };
}

function normalizeAuditoriaTransacaoContexto(contexto: any): AuditoriaTransacaoContexto | null {
  if (!contexto && contexto !== 0) return null;

  const normalized: AuditoriaTransacaoContexto = {
    cursoNome: contexto?.cursoNome ?? null,
    cursoId: contexto?.cursoId ?? null,
    planoNome: contexto?.planoNome ?? null,
    planoId: contexto?.planoId ?? null,
    origem: contexto?.origem ?? null,
    metodoPagamento: contexto?.metodoPagamento ?? null,
  };

  if (Object.values(normalized).every((value) => value === null || value === undefined)) {
    return null;
  }

  return normalized;
}

function normalizeAuditoriaTransacao(transacao: any): AuditoriaTransacao {
  const usuario = normalizeAuditoriaTransacaoUsuario(transacao?.usuario, transacao);
  const empresa = normalizeAuditoriaTransacaoEmpresa(transacao?.empresa, transacao);
  const contexto = normalizeAuditoriaTransacaoContexto(transacao?.contexto);

  return {
    id: String(transacao?.id ?? ""),
    codigoExibicao: transacao?.codigoExibicao ?? null,
    tipo: transacao?.tipo ?? "",
    tipoLabel: transacao?.tipoLabel ?? transacao?.tipo ?? null,
    status: transacao?.status ?? "",
    statusLabel: transacao?.statusLabel ?? transacao?.status ?? null,
    valor: Number(transacao?.valor ?? 0),
    moeda: transacao?.moeda ?? "BRL",
    valorFormatado: transacao?.valorFormatado ?? null,
    usuarioId: transacao?.usuarioId ?? usuario?.id ?? null,
    empresaId: transacao?.empresaId ?? empresa?.id ?? null,
    gateway: transacao?.gateway ?? null,
    gatewayId: transacao?.gatewayId ?? null,
    gatewayLabel: transacao?.gatewayLabel ?? transacao?.gateway ?? null,
    gatewayReferencia: transacao?.gatewayReferencia ?? null,
    descricao: transacao?.descricao ?? null,
    usuario,
    empresa,
    contexto,
    meta: transacao?.meta ?? null,
    dadosAdicionais: transacao?.dadosAdicionais ?? null,
    criadoEm: transacao?.criadoEm ?? "",
    atualizadoEm: transacao?.atualizadoEm ?? transacao?.criadoEm ?? "",
  };
}

function normalizeAuditoriaTransacoesListResponse(
  response: AuditoriaTransacoesApiResponse,
  fallback?: { page?: number; pageSize?: number },
): AuditoriaTransacoesListResponse {
  const payload: AuditoriaTransacoesApiPayload =
    "data" in response && response.data
      ? response.data
      : (response as AuditoriaTransacoesApiPayload);

  const items = (payload.items ?? []).map(normalizeAuditoriaTransacao);
  const page = payload.pagination?.page ?? payload.page ?? fallback?.page ?? 1;
  const pageSize =
    payload.pagination?.pageSize ?? payload.pageSize ?? fallback?.pageSize ?? 10;
  const total = payload.pagination?.total ?? payload.total ?? items.length;
  const totalPages =
    payload.pagination?.totalPages ??
    payload.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    total,
    page,
    pageSize,
    totalPages,
    resumo: payload.resumo,
    filtrosDisponiveis: payload.filtrosDisponiveis,
  };
}

function normalizeAuditoriaTransacoesParams(
  params?: AuditoriaTransacoesListParams,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  return {
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    usuarioId: params.usuarioId,
    empresaId: params.empresaId,
    gateway: params.gateway,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    tipos: params.tipos ?? params.tipo,
    status: params.status,
    dataInicio: params.dataInicio ?? params.startDate,
    dataFim: params.dataFim ?? params.endDate,
  };
}

// ---------------------------------------------
// Logs
// ---------------------------------------------
export async function listAuditoriaLogs(
  params?: AuditoriaLogsListParams,
): Promise<AuditoriaLogsListResponse> {
  const normalizedParams = normalizeAuditoriaLogsParams(params);
  const url = `${auditoriaRoutes.logs.list()}${buildQuery(normalizedParams)}`;
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
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
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
}

export async function listAuditoriaLogsByUsuario(
  usuarioId: string,
  params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string },
): Promise<AuditoriaLogsListResponse> {
  const url = `${auditoriaRoutes.logs.byUsuario(usuarioId)}${buildQuery(params)}`;
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
}

export async function listAccessLogs(params?: AuditoriaLogsListParams) {
  const normalizedParams = normalizeAuditoriaLogsParams(params);
  const url = `${auditoriaRoutes.logs.acesso()}${buildQuery(normalizedParams)}`;
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
}

export async function listChangeLogs(params?: AuditoriaLogsListParams) {
  const normalizedParams = normalizeAuditoriaLogsParams(params);
  const url = `${auditoriaRoutes.logs.alteracao()}${buildQuery(normalizedParams)}`;
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
}

export async function listErrorLogs(
  params?: AuditoriaLogsListParams & { nivel?: string },
): Promise<AuditoriaLogsListResponse> {
  const normalizedParams = {
    ...normalizeAuditoriaLogsParams(params),
    nivel: params?.nivel,
  };
  const url = `${auditoriaRoutes.logs.erro()}${buildQuery(normalizedParams)}`;
  const response = await apiFetch<AuditoriaLogsApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaLogsListResponse(response, params);
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
  const normalizedParams = normalizeAuditoriaTransacoesParams(params);
  const url = `${auditoriaRoutes.transacoes.list()}${buildQuery(normalizedParams)}`;
  const response = await apiFetch<AuditoriaTransacoesApiResponse>(url, {
    init: { method: "GET", headers: buildHeaders() },
    cache: "no-cache",
  });

  return normalizeAuditoriaTransacoesListResponse(response, params);
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
