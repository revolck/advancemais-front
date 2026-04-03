/**
 * API de Recrutador
 * - Empresas e vagas vinculadas
 * - Entrevistas (Google Meet via Calendar)
 */

import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  CreateRecrutadorEntrevistaPayload,
  CreateRecrutadorEntrevistaResponse,
  RecrutadorCandidatoCurriculoDetailResponse,
  GetRecrutadorEntrevistaResponse,
  RecrutadorEntrevistaCreatePayload,
  RecrutadorEntrevistaCreateResponse,
  RecrutadorEntrevistaOpcoesResponse,
  RecrutadorEntrevistaEmpresaOpcaoItem,
  RecrutadorEntrevistaVagaOpcaoItem,
  RecrutadorEntrevistaCandidatoOpcaoItem,
  ListRecrutadorEntrevistasOverviewParams,
  RecrutadorCandidatoCreateEntrevistaPayload,
  RecrutadorCandidatoCreateEntrevistaResponse,
  RecrutadorCandidatoEntrevistaOpcoesResponse,
  ListRecrutadorCandidatoEntrevistasParams,
  ListRecrutadorVagaCandidatosParams,
  ListRecrutadorCandidatosParams,
  ListRecrutadorVagasParams,
  RecrutadorCandidatoDetailResponse,
  RecrutadorCandidatoEntrevistasResponse,
  RecrutadorCandidatosResponse,
  RecrutadorEmpresaDetailResponse,
  RecrutadorEmpresasResponse,
  RecrutadorEntrevistasOverviewResponse,
  RecrutadorVagaCandidatosResponse,
  RecrutadorVagaCandidaturaStatusUpdateResponse,
  RecrutadorVagaDetailResponse,
  UpdateRecrutadorVagaCandidaturaStatusPayload,
  RecrutadorVagasResponse,
} from "./types";
import type {
  EntrevistaCandidatoOpcaoItem,
  EntrevistaOverviewCapabilities,
  EntrevistaOverviewItem,
  EntrevistaEmpresaOpcaoItem,
  EntrevistasOverviewFiltrosDisponiveis,
  EntrevistasOverviewSummary,
  EntrevistaVagaOpcaoItem,
} from "@/api/entrevistas/types";

const RECRUTADOR_ROUTES = {
  EMPRESAS: "/api/v1/recrutador/empresas",
  EMPRESA_BY_ID: (id: string) =>
    `/api/v1/recrutador/empresas/${encodeURIComponent(id)}`,
  CANDIDATOS: "/api/v1/recrutador/candidatos",
  CANDIDATO_BY_ID: (id: string) =>
    `/api/v1/recrutador/candidatos/${encodeURIComponent(id)}`,
  CANDIDATO_ENTREVISTAS: (id: string) =>
    `/api/v1/recrutador/candidatos/${encodeURIComponent(id)}/entrevistas`,
  CANDIDATO_ENTREVISTAS_OPCOES: (id: string) =>
    `/api/v1/recrutador/candidatos/${encodeURIComponent(id)}/entrevistas/opcoes`,
  CANDIDATO_CURRICULO_BY_ID: (candidatoId: string, curriculoId: string) =>
    `/api/v1/recrutador/candidatos/${encodeURIComponent(
      candidatoId
    )}/curriculos/${encodeURIComponent(curriculoId)}`,
  ENTREVISTAS_OVERVIEW: "/api/v1/recrutador/entrevistas/overview",
  ENTREVISTAS_OPTIONS_EMPRESAS: "/api/v1/recrutador/entrevistas/opcoes/empresas",
  ENTREVISTAS_OPTIONS_VAGAS: "/api/v1/recrutador/entrevistas/opcoes/vagas",
  ENTREVISTAS_OPTIONS_CANDIDATOS: "/api/v1/recrutador/entrevistas/opcoes/candidatos",
  ENTREVISTAS_CREATE: "/api/v1/recrutador/entrevistas",
  VAGAS: "/api/v1/recrutador/vagas",
  VAGA_BY_ID: (id: string) => `/api/v1/recrutador/vagas/${encodeURIComponent(id)}`,
  VAGA_CANDIDATOS: (id: string) =>
    `/api/v1/recrutador/vagas/${encodeURIComponent(id)}/candidatos`,
  VAGA_CANDIDATURA_STATUS: (vagaId: string, candidaturaId: string) =>
    `/api/v1/recrutador/vagas/${encodeURIComponent(
      vagaId
    )}/candidaturas/${encodeURIComponent(candidaturaId)}/status`,
  CREATE_ENTREVISTA: (vagaId: string, candidatoId: string) =>
    `/api/v1/recrutador/vagas/${encodeURIComponent(
      vagaId
    )}/candidatos/${encodeURIComponent(candidatoId)}/entrevistas`,
  ENTREVISTA_BY_ID: (id: string) =>
    `/api/v1/recrutador/entrevistas/${encodeURIComponent(id)}`,
} as const;

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
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

function buildAuthHeaders(additionalHeaders?: HeadersInit): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      if (
        key === "status" ||
        key === "statusEntrevista" ||
        key === "modalidades"
      ) {
        query.set(key, value.join(","));
      } else {
        value.forEach((v) => query.append(key, String(v)));
      }
      return;
    }
    query.set(key, String(value));
  });

  return query.toString();
}

function normalizeEntrevistaEndereco(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    cep: value?.cep ?? null,
    logradouro: value?.logradouro ?? null,
    numero: value?.numero ?? null,
    complemento: value?.complemento ?? null,
    bairro: value?.bairro ?? null,
    cidade: value?.cidade ?? null,
    estado: value?.estado ?? null,
    pontoReferencia: value?.pontoReferencia ?? null,
  };
}

function normalizeEntrevistaGoogle(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    connected:
      typeof value?.connected === "boolean" ? value.connected : undefined,
    expired: typeof value?.expired === "boolean" ? value.expired : undefined,
    calendarId: value?.calendarId ?? null,
    expiraEm: value?.expiraEm ?? null,
    connectEndpoint: value?.connectEndpoint ?? null,
    disconnectEndpoint: value?.disconnectEndpoint ?? null,
    statusEndpoint: value?.statusEndpoint ?? null,
  };
}

function normalizeEntrevistaAgenda(value: any) {
  if (!value || typeof value !== "object") return null;

  return {
    eventoInternoId: value?.eventoInternoId ?? null,
    criadoNoSistema:
      typeof value?.criadoNoSistema === "boolean"
        ? value.criadoNoSistema
        : undefined,
    provider: value?.provider ?? null,
    organizerSource: value?.organizerSource ?? null,
    organizerUserId: value?.organizerUserId ?? null,
    organizerEmail: value?.organizerEmail ?? null,
  };
}

type RecrutadorEntrevistasOverviewApiPayload = {
  items?: unknown[];
  pagination?: Partial<RecrutadorEntrevistasOverviewResponse["pagination"]>;
  summary?: EntrevistasOverviewSummary;
  filtrosDisponiveis?: EntrevistasOverviewFiltrosDisponiveis;
  capabilities?: EntrevistaOverviewCapabilities;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

type RecrutadorEntrevistasOverviewApiResponse =
  | RecrutadorEntrevistasOverviewResponse
  | {
      success?: boolean;
      data?: RecrutadorEntrevistasOverviewApiPayload;
    };

type RecrutadorEntrevistasOptionsApiResponse<T> =
  | RecrutadorEntrevistaOpcoesResponse<T>
  | {
      success?: boolean;
      data?: RecrutadorEntrevistaOpcoesResponse<T>;
    };

function normalizeEntrevistaOverviewItem(item: any): EntrevistaOverviewItem {
  return {
    id: String(item?.id ?? ""),
    candidaturaId: item?.candidaturaId ?? null,
    empresaAnonima:
      typeof item?.empresaAnonima === "boolean"
        ? item.empresaAnonima
        : undefined,
    statusEntrevista: item?.statusEntrevista ?? "AGENDADA",
    statusEntrevistaLabel:
      item?.statusEntrevistaLabel ?? item?.statusEntrevista ?? null,
    modalidade: item?.modalidade ?? null,
    modalidadeLabel: item?.modalidadeLabel ?? item?.modalidade ?? null,
    agendadaPara: item?.agendadaPara ?? item?.dataInicio ?? null,
    agendadaParaFormatada:
      item?.agendadaParaFormatada ??
      item?.dataInicioFormatada ??
      item?.agendadaPara ??
      null,
    dataInicio: item?.dataInicio ?? item?.agendadaPara ?? null,
    dataFim: item?.dataFim ?? null,
    descricao: item?.descricao ?? null,
    meetUrl: item?.meetUrl ?? null,
    local: item?.local ?? null,
    enderecoPresencial: normalizeEntrevistaEndereco(item?.enderecoPresencial),
    candidato: {
      id: String(item?.candidato?.id ?? ""),
      codigo: item?.candidato?.codigo ?? null,
      nome: item?.candidato?.nome ?? "Candidato",
      email: item?.candidato?.email ?? null,
      cpf: item?.candidato?.cpf ?? null,
      telefone: item?.candidato?.telefone ?? null,
      avatarUrl: item?.candidato?.avatarUrl ?? null,
      cidade: item?.candidato?.cidade ?? null,
      estado: item?.candidato?.estado ?? null,
    },
    vaga: {
      id: String(item?.vaga?.id ?? ""),
      codigo: item?.vaga?.codigo ?? null,
      titulo: item?.vaga?.titulo ?? "Vaga",
      status: item?.vaga?.status ?? null,
    },
    empresa: item?.empresa
      ? {
          id: String(item.empresa.id ?? ""),
          nomeExibicao: item.empresa.nomeExibicao ?? null,
          anonima:
            typeof item.empresa.anonima === "boolean"
              ? item.empresa.anonima
              : undefined,
          labelExibicao: item.empresa.labelExibicao ?? null,
          logoUrl: item.empresa.logoUrl ?? null,
        }
      : null,
    recrutador: item?.recrutador
      ? {
          id: String(item.recrutador.id ?? ""),
          nome: item.recrutador.nome ?? "Recrutador",
          email: item.recrutador.email ?? null,
          avatarUrl: item.recrutador.avatarUrl ?? null,
        }
      : null,
    meta: item?.meta ?? null,
    agenda: normalizeEntrevistaAgenda(item?.agenda),
    criadoEm: item?.criadoEm ?? null,
    atualizadoEm: item?.atualizadoEm ?? null,
  };
}

function normalizeEntrevistasOverviewResponse(
  response: RecrutadorEntrevistasOverviewApiResponse,
  fallback?: { page?: number; pageSize?: number }
): RecrutadorEntrevistasOverviewResponse {
  const payload: RecrutadorEntrevistasOverviewApiPayload =
    "data" in response && response.data
      ? response.data
      : (response as RecrutadorEntrevistasOverviewApiPayload);

  const items = (payload.items ?? []).map(normalizeEntrevistaOverviewItem);
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
    summary: payload.summary,
    filtrosDisponiveis: payload.filtrosDisponiveis,
    capabilities: payload.capabilities,
  };
}

function normalizeOptionsResponse<TInput, TOutput>(
  response: RecrutadorEntrevistasOptionsApiResponse<TInput>,
  normalizeItem: (item: TInput) => TOutput,
): TOutput[] {
  const payload: RecrutadorEntrevistaOpcoesResponse<TInput> =
    "data" in response && response.data
      ? response.data
      : (response as RecrutadorEntrevistaOpcoesResponse<TInput>);

  return (payload.items ?? []).map(normalizeItem);
}

function normalizeEmpresaOpcao(item: any): EntrevistaEmpresaOpcaoItem {
  return {
    id: String(item?.id ?? ""),
    nomeExibicao: item?.nomeExibicao ?? "Empresa",
    codigo: item?.codigo ?? null,
    cnpj: item?.cnpj ?? null,
    email: item?.email ?? null,
    logoUrl: item?.logoUrl ?? null,
    totalVagasElegiveis: Number(item?.totalVagasElegiveis ?? 0),
    enderecoPadraoEntrevista: normalizeEntrevistaEndereco(
      item?.enderecoPadraoEntrevista,
    ),
  };
}

function normalizeVagaOpcao(item: any): EntrevistaVagaOpcaoItem {
  return {
    id: String(item?.id ?? ""),
    codigo: item?.codigo ?? null,
    titulo: item?.titulo ?? "Vaga",
    status: item?.status ?? null,
    statusLabel: item?.statusLabel ?? item?.status ?? null,
    empresaUsuarioId: String(item?.empresaUsuarioId ?? ""),
    empresaAnonima:
      typeof item?.empresaAnonima === "boolean" ? item.empresaAnonima : undefined,
    anonimatoOrigem: item?.anonimatoOrigem ?? null,
    anonimatoBloqueado:
      typeof item?.anonimatoBloqueado === "boolean"
        ? item.anonimatoBloqueado
        : undefined,
    candidatosElegiveis: Number(item?.candidatosElegiveis ?? 0),
  };
}

function normalizeCandidatoOpcao(item: any): EntrevistaCandidatoOpcaoItem {
  return {
    candidaturaId: String(item?.candidaturaId ?? ""),
    candidato: {
      id: String(item?.candidato?.id ?? ""),
      codigo: item?.candidato?.codigo ?? null,
      nome: item?.candidato?.nome ?? "Candidato",
      email: item?.candidato?.email ?? null,
      cpf: item?.candidato?.cpf ?? null,
      telefone: item?.candidato?.telefone ?? null,
      avatarUrl: item?.candidato?.avatarUrl ?? null,
      cidade: item?.candidato?.cidade ?? null,
      estado: item?.candidato?.estado ?? null,
    },
    statusCandidatura: item?.statusCandidatura ?? null,
    statusCandidaturaLabel:
      item?.statusCandidaturaLabel ?? item?.statusCandidatura ?? null,
    ultimaAtualizacaoEm: item?.ultimaAtualizacaoEm ?? null,
    entrevistaAtiva: Boolean(item?.entrevistaAtiva),
    entrevistaAtivaId: item?.entrevistaAtivaId ?? null,
  };
}

function normalizeEntrevistaCreateResponse(item: any) {
  return {
    id: String(item?.id ?? ""),
    candidaturaId: item?.candidaturaId ?? null,
    empresaAnonima:
      typeof item?.empresaAnonima === "boolean"
        ? item.empresaAnonima
        : undefined,
    statusEntrevista: item?.statusEntrevista ?? "AGENDADA",
    statusEntrevistaLabel:
      item?.statusEntrevistaLabel ?? item?.statusEntrevista ?? null,
    modalidade: item?.modalidade ?? null,
    modalidadeLabel: item?.modalidadeLabel ?? item?.modalidade ?? null,
    dataInicio: item?.dataInicio ?? item?.agendadaPara ?? null,
    dataFim: item?.dataFim ?? null,
    agendadaPara: item?.agendadaPara ?? item?.dataInicio ?? null,
    agendadaParaFormatada:
      item?.agendadaParaFormatada ?? item?.agendadaPara ?? null,
    descricao: item?.descricao ?? null,
    meetUrl: item?.meetUrl ?? null,
    local: item?.local ?? null,
    enderecoPresencial: normalizeEntrevistaEndereco(item?.enderecoPresencial),
    agenda: normalizeEntrevistaAgenda(item?.agenda),
    candidato: item?.candidato
      ? {
          id: String(item.candidato.id ?? ""),
          nome: item.candidato.nome ?? "Candidato",
          codigo: item.candidato.codigo ?? null,
        }
      : null,
    vaga: item?.vaga
      ? {
          id: String(item.vaga.id ?? ""),
          titulo: item.vaga.titulo ?? "Vaga",
          codigo: item.vaga.codigo ?? null,
        }
      : null,
    empresa: item?.empresa
      ? {
          id: String(item.empresa.id ?? ""),
          nomeExibicao: item.empresa.nomeExibicao ?? null,
          anonima:
            typeof item.empresa.anonima === "boolean"
              ? item.empresa.anonima
              : undefined,
          labelExibicao: item.empresa.labelExibicao ?? null,
        }
      : null,
    recrutador: item?.recrutador
      ? {
          id: String(item.recrutador.id ?? ""),
          nome: item.recrutador.nome ?? "Recrutador",
        }
      : null,
    criadoEm: item?.criadoEm ?? null,
  };
}

export async function getRecrutadorEmpresas(
  init?: RequestInit
): Promise<RecrutadorEmpresasResponse> {
  return apiFetch<RecrutadorEmpresasResponse>(RECRUTADOR_ROUTES.EMPRESAS, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function getRecrutadorEmpresaById(
  id: string,
  init?: RequestInit
): Promise<RecrutadorEmpresaDetailResponse> {
  return apiFetch<RecrutadorEmpresaDetailResponse>(RECRUTADOR_ROUTES.EMPRESA_BY_ID(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function listRecrutadorCandidatos(
  params?: ListRecrutadorCandidatosParams,
  init?: RequestInit
): Promise<RecrutadorCandidatosResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.search) queryParams.search = params.search;
  if (params?.empresaUsuarioId) queryParams.empresaUsuarioId = params.empresaUsuarioId;
  if (params?.vagaId) queryParams.vagaId = params.vagaId;
  if (params?.criadoDe) queryParams.criadoDe = params.criadoDe;
  if (params?.criadoAte) queryParams.criadoAte = params.criadoAte;
  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;

  const qs = buildQueryString(queryParams);
  const url = qs ? `${RECRUTADOR_ROUTES.CANDIDATOS}?${qs}` : RECRUTADOR_ROUTES.CANDIDATOS;

  return apiFetch<RecrutadorCandidatosResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function getRecrutadorCandidatoById(
  id: string,
  init?: RequestInit
): Promise<RecrutadorCandidatoDetailResponse> {
  return apiFetch<RecrutadorCandidatoDetailResponse>(
    RECRUTADOR_ROUTES.CANDIDATO_BY_ID(id),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
      cache: "no-cache",
    }
  );
}

export async function listRecrutadorEntrevistasOverview(
  params?: ListRecrutadorEntrevistasOverviewParams,
  init?: RequestInit
): Promise<RecrutadorEntrevistasOverviewResponse> {
  const qs = buildQueryString({
    page: params?.page,
    pageSize: params?.pageSize,
    search: params?.search,
    empresaUsuarioId: params?.empresaUsuarioId,
    vagaId: params?.vagaId,
    recrutadorId: params?.recrutadorId,
    statusEntrevista: params?.statusEntrevista,
    modalidades: params?.modalidades,
    dataInicio: params?.dataInicio,
    dataFim: params?.dataFim,
    sortBy: params?.sortBy,
    sortDir: params?.sortDir,
  });

  const url = qs
    ? `${RECRUTADOR_ROUTES.ENTREVISTAS_OVERVIEW}?${qs}`
    : RECRUTADOR_ROUTES.ENTREVISTAS_OVERVIEW;

  const response = await apiFetch<RecrutadorEntrevistasOverviewApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeEntrevistasOverviewResponse(response, {
    page: params?.page,
    pageSize: params?.pageSize,
  });
}

export async function listRecrutadorEntrevistaEmpresasOptions(
  init?: RequestInit,
): Promise<RecrutadorEntrevistaEmpresaOpcaoItem[]> {
  const response = await apiFetch<RecrutadorEntrevistasOptionsApiResponse<unknown>>(
    RECRUTADOR_ROUTES.ENTREVISTAS_OPTIONS_EMPRESAS,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
      cache: "no-cache",
    },
  );

  return normalizeOptionsResponse(response, normalizeEmpresaOpcao);
}

export async function listRecrutadorEntrevistaVagasOptions(
  empresaUsuarioId: string,
  init?: RequestInit,
): Promise<RecrutadorEntrevistaVagaOpcaoItem[]> {
  const qs = buildQueryString({ empresaUsuarioId });
  const url = qs
    ? `${RECRUTADOR_ROUTES.ENTREVISTAS_OPTIONS_VAGAS}?${qs}`
    : RECRUTADOR_ROUTES.ENTREVISTAS_OPTIONS_VAGAS;

  const response = await apiFetch<RecrutadorEntrevistasOptionsApiResponse<unknown>>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeOptionsResponse(response, normalizeVagaOpcao);
}

export async function listRecrutadorEntrevistaCandidatosOptions(
  vagaId: string,
  init?: RequestInit,
): Promise<RecrutadorEntrevistaCandidatoOpcaoItem[]> {
  const qs = buildQueryString({ vagaId });
  const url = qs
    ? `${RECRUTADOR_ROUTES.ENTREVISTAS_OPTIONS_CANDIDATOS}?${qs}`
    : RECRUTADOR_ROUTES.ENTREVISTAS_OPTIONS_CANDIDATOS;

  const response = await apiFetch<RecrutadorEntrevistasOptionsApiResponse<unknown>>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeOptionsResponse(response, normalizeCandidatoOpcao);
}

export async function createRecrutadorEntrevistaDashboard(
  payload: RecrutadorEntrevistaCreatePayload,
  init?: RequestInit,
): Promise<RecrutadorEntrevistaCreateResponse> {
  const response = await apiFetch<RecrutadorEntrevistaCreateResponse>(
    RECRUTADOR_ROUTES.ENTREVISTAS_CREATE,
    {
      init: {
        method: "POST",
        ...init,
        headers: buildAuthHeaders({
          "Content-Type": apiConfig.headers["Content-Type"],
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );

  const payloadData =
    (response as any)?.data && typeof (response as any).data === "object"
      ? (response as any).data
      : response;

  return normalizeEntrevistaCreateResponse(payloadData);
}

export async function listRecrutadorCandidatoEntrevistas(
  candidatoId: string,
  params?: ListRecrutadorCandidatoEntrevistasParams,
  init?: RequestInit
): Promise<RecrutadorCandidatoEntrevistasResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortDir) queryParams.sortDir = params.sortDir;
  if (params?.statusEntrevista?.length) {
    queryParams.statusEntrevista = params.statusEntrevista;
  }
  if (params?.modalidades?.length) {
    queryParams.modalidades = params.modalidades;
  }
  if (params?.dataInicio) queryParams.dataInicio = params.dataInicio;
  if (params?.dataFim) queryParams.dataFim = params.dataFim;

  const qs = buildQueryString(queryParams);
  const url = qs
    ? `${RECRUTADOR_ROUTES.CANDIDATO_ENTREVISTAS(candidatoId)}?${qs}`
    : RECRUTADOR_ROUTES.CANDIDATO_ENTREVISTAS(candidatoId);

  return apiFetch<RecrutadorCandidatoEntrevistasResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function getRecrutadorCandidatoEntrevistaOpcoes(
  candidatoId: string,
  init?: RequestInit
): Promise<RecrutadorCandidatoEntrevistaOpcoesResponse> {
  const response = await apiFetch<any>(
    RECRUTADOR_ROUTES.CANDIDATO_ENTREVISTAS_OPCOES(candidatoId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
      cache: "no-cache",
    }
  );

  const payload =
    response?.data && typeof response.data === "object" ? response.data : response;

  const items = Array.isArray(payload?.items)
    ? payload.items.map((item: any) => ({
        candidaturaId: String(item?.candidaturaId ?? ""),
        empresa: item?.empresa
          ? {
              id: String(item.empresa.id ?? ""),
              nomeExibicao: item.empresa.nomeExibicao ?? null,
              codigo: item.empresa.codigo ?? null,
              anonima:
                typeof item.empresa.anonima === "boolean"
                  ? item.empresa.anonima
                  : undefined,
              labelExibicao: item.empresa.labelExibicao ?? null,
            }
          : null,
        vaga: item?.vaga
          ? {
              id: String(item.vaga.id ?? ""),
              codigo: item.vaga.codigo ?? null,
              titulo: item.vaga.titulo ?? "Vaga",
              status: item.vaga.status ?? null,
              statusLabel: item.vaga.statusLabel ?? item.vaga.status ?? null,
            }
          : null,
        candidato: item?.candidato
          ? {
              id: String(item.candidato.id ?? ""),
              codigo: item.candidato.codigo ?? null,
              nome: item.candidato.nome ?? "Candidato",
            }
          : null,
        statusCandidatura: item?.statusCandidatura ?? null,
        statusCandidaturaLabel:
          item?.statusCandidaturaLabel ?? item?.statusCandidatura ?? null,
        tipoAcesso:
          item?.tipoAcesso === "EMPRESA" || item?.tipoAcesso === "VAGA"
            ? item.tipoAcesso
            : undefined,
        empresaVinculadaDiretamente:
          typeof item?.empresaVinculadaDiretamente === "boolean"
            ? item.empresaVinculadaDiretamente
            : undefined,
        entrevistaAtiva: Boolean(item?.entrevistaAtiva),
        entrevistaAtivaId: item?.entrevistaAtivaId ?? null,
        empresaAnonima:
          typeof item?.empresaAnonima === "boolean"
            ? item.empresaAnonima
            : undefined,
        anonimatoBloqueado:
          typeof item?.anonimatoBloqueado === "boolean"
            ? item.anonimatoBloqueado
            : undefined,
        enderecoPadraoEntrevista: normalizeEntrevistaEndereco(
          item?.enderecoPadraoEntrevista
        ),
      }))
    : [];

  return {
    canCreate:
      typeof payload?.canCreate === "boolean" ? payload.canCreate : undefined,
    canCreateOnline:
      typeof payload?.canCreateOnline === "boolean"
        ? payload.canCreateOnline
        : undefined,
    canCreatePresencial:
      typeof payload?.canCreatePresencial === "boolean"
        ? payload.canCreatePresencial
        : undefined,
    requiresGoogleForOnline:
      typeof payload?.requiresGoogleForOnline === "boolean"
        ? payload.requiresGoogleForOnline
        : undefined,
    google: normalizeEntrevistaGoogle(payload?.google),
    defaults:
      payload?.defaults && typeof payload.defaults === "object"
        ? {
            empresaUsuarioId: payload.defaults.empresaUsuarioId ?? null,
            vagaId: payload.defaults.vagaId ?? null,
            candidaturaId: payload.defaults.candidaturaId ?? null,
          }
        : null,
    items,
  };
}

export async function createRecrutadorCandidatoEntrevista(
  candidatoId: string,
  payload: RecrutadorCandidatoCreateEntrevistaPayload,
  init?: RequestInit
): Promise<RecrutadorCandidatoCreateEntrevistaResponse> {
  const response = await apiFetch<any>(
    RECRUTADOR_ROUTES.CANDIDATO_ENTREVISTAS(candidatoId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildAuthHeaders({
          "Content-Type": apiConfig.headers["Content-Type"],
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );

  const item =
    response?.data && typeof response.data === "object" ? response.data : response;

  return normalizeEntrevistaCreateResponse(item);
}

export async function getRecrutadorCandidatoCurriculoById(
  candidatoId: string,
  curriculoId: string,
  init?: RequestInit
): Promise<RecrutadorCandidatoCurriculoDetailResponse> {
  return apiFetch<RecrutadorCandidatoCurriculoDetailResponse>(
    RECRUTADOR_ROUTES.CANDIDATO_CURRICULO_BY_ID(candidatoId, curriculoId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
      cache: "no-cache",
    }
  );
}

export async function listRecrutadorVagas(
  params?: ListRecrutadorVagasParams,
  init?: RequestInit
): Promise<RecrutadorVagasResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.search) queryParams.search = params.search;
  if (params?.empresaUsuarioId) queryParams.empresaUsuarioId = params.empresaUsuarioId;
  if (params?.localizacao) queryParams.localizacao = params.localizacao;
  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortDir) queryParams.sortDir = params.sortDir;
  if (params?.status && params.status.length > 0) {
    const hasRascunho = params.status.some(
      (s) => String(s).toUpperCase() === "RASCUNHO"
    );
    if (hasRascunho) {
      throw new Error("Filtro status=RASCUNHO não é permitido para recrutador.");
    }
    queryParams.status = params.status;
  }

  const qs = buildQueryString(queryParams);
  const url = qs ? `${RECRUTADOR_ROUTES.VAGAS}?${qs}` : RECRUTADOR_ROUTES.VAGAS;

  return apiFetch<RecrutadorVagasResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function getRecrutadorVagaById(
  id: string,
  init?: RequestInit
): Promise<RecrutadorVagaDetailResponse> {
  return apiFetch<RecrutadorVagaDetailResponse>(RECRUTADOR_ROUTES.VAGA_BY_ID(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function listRecrutadorVagaCandidatos(
  vagaId: string,
  params?: ListRecrutadorVagaCandidatosParams,
  init?: RequestInit
): Promise<RecrutadorVagaCandidatosResponse> {
  const queryParams: Record<string, unknown> = {};

  if (params?.search) queryParams.search = params.search;
  if (params?.inscricaoDe) queryParams.inscricaoDe = params.inscricaoDe;
  if (params?.inscricaoAte) queryParams.inscricaoAte = params.inscricaoAte;
  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortDir) queryParams.sortDir = params.sortDir;

  const qs = buildQueryString(queryParams);
  const url = qs
    ? `${RECRUTADOR_ROUTES.VAGA_CANDIDATOS(vagaId)}?${qs}`
    : RECRUTADOR_ROUTES.VAGA_CANDIDATOS(vagaId);

  return apiFetch<RecrutadorVagaCandidatosResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export async function updateRecrutadorVagaCandidaturaStatus(
  vagaId: string,
  candidaturaId: string,
  payload: UpdateRecrutadorVagaCandidaturaStatusPayload,
  init?: RequestInit
): Promise<RecrutadorVagaCandidaturaStatusUpdateResponse> {
  return apiFetch<RecrutadorVagaCandidaturaStatusUpdateResponse>(
    RECRUTADOR_ROUTES.VAGA_CANDIDATURA_STATUS(vagaId, candidaturaId),
    {
      init: {
        method: "PATCH",
        ...init,
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

export async function createRecrutadorEntrevista(
  vagaId: string,
  candidatoId: string,
  payload: CreateRecrutadorEntrevistaPayload,
  init?: RequestInit
): Promise<CreateRecrutadorEntrevistaResponse> {
  return apiFetch<CreateRecrutadorEntrevistaResponse>(
    RECRUTADOR_ROUTES.CREATE_ENTREVISTA(vagaId, candidatoId),
    {
      init: {
        method: "POST",
        ...init,
        headers: buildAuthHeaders({
          "Content-Type": "application/json",
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

export async function getRecrutadorEntrevistaById(
  id: string,
  init?: RequestInit
): Promise<GetRecrutadorEntrevistaResponse> {
  return apiFetch<GetRecrutadorEntrevistaResponse>(RECRUTADOR_ROUTES.ENTREVISTA_BY_ID(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

export type {
  RecrutadorCandidatoCreateEntrevistaPayload,
  RecrutadorCandidatoCreateEntrevistaResponse,
  RecrutadorEntrevistaCreatePayload,
  RecrutadorEntrevistaCreateResponse,
  RecrutadorEntrevistaEmpresaOpcaoItem,
  RecrutadorEntrevistaVagaOpcaoItem,
  RecrutadorEntrevistaCandidatoOpcaoItem,
  ListRecrutadorEntrevistasOverviewParams,
  ListRecrutadorCandidatoEntrevistasParams,
  ListRecrutadorCandidatosParams,
  RecrutadorEmpresa,
  RecrutadorEmpresaDetailData,
  RecrutadorEmpresaDetailResponse,
  RecrutadorEmpresaEscopo,
  RecrutadorEmpresaVagaResumo,
  RecrutadorCandidatoCandidatura,
  RecrutadorCandidatoCurriculoDetailResponse,
  RecrutadorCandidatoCurriculoResumo,
  RecrutadorCandidatoDetailData,
  RecrutadorCandidatoDetailResponse,
  RecrutadorCandidatoDetailCandidato,
  RecrutadorCandidatoDetailEscopo,
  RecrutadorCandidatoEntrevistaOpcoesDefaults,
  RecrutadorCandidatoEntrevistaOpcoesResponse,
  RecrutadorCandidatoEntrevistaOpcaoItem,
  RecrutadorCandidatoEntrevistaItem,
  RecrutadorCandidatoEntrevistasListData,
  RecrutadorCandidatoEntrevistasResponse,
  RecrutadorCandidatoEmpresaResumo,
  RecrutadorCandidatoResumo,
  RecrutadorCandidatoVagaResumo,
  RecrutadorCandidatosResponse,
  RecrutadorEmpresasResponse,
  RecrutadorEntrevistasOverviewResponse,
  RecrutadorVagaCandidatosItem,
  RecrutadorVagaCandidaturaStatusUpdateResponse,
  RecrutadorVagaCandidatosResponse,
  RecrutadorVagaEmpresaResumo,
  RecrutadorVagaResumo,
  RecrutadorVagasResponse,
  RecrutadorVagaDetailResponse,
  ListRecrutadorVagaCandidatosParams,
  ListRecrutadorVagasParams,
  UpdateRecrutadorVagaCandidaturaStatusPayload,
  RecrutadorEntrevista,
  CreateRecrutadorEntrevistaPayload,
  CreateRecrutadorEntrevistaResponse,
  GetRecrutadorEntrevistaResponse,
} from "./types";
