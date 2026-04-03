import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  EntrevistaAgendaInfo,
  EntrevistaCandidatoOpcaoItem,
  EntrevistaCreatePayload,
  EntrevistaCreateResponseItem,
  EntrevistaEndereco,
  EntrevistaEmpresaOpcaoItem,
  EntrevistaGoogleCapability,
  EntrevistaOverviewItem,
  EntrevistaOverviewCapabilities,
  EntrevistaVagaOpcaoItem,
  EntrevistasOverviewFiltrosDisponiveis,
  EntrevistasOverviewListParams,
  EntrevistasOverviewListResponse,
  EntrevistasOverviewSummary,
} from "./types";

const ENTREVISTAS_ROUTES = {
  OVERVIEW: "/api/v1/entrevistas/overview",
  OPTIONS_EMPRESAS: "/api/v1/entrevistas/opcoes/empresas",
  OPTIONS_VAGAS: "/api/v1/entrevistas/opcoes/vagas",
  OPTIONS_CANDIDATOS: "/api/v1/entrevistas/opcoes/candidatos",
  CREATE: "/api/v1/entrevistas",
} as const;

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

function buildQuery(params?: object): string {
  if (!params) return "";
  const sp = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        sp.set(key, value.join(","));
      }
      return;
    }
    sp.set(key, String(value));
  });

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

type EntrevistasOverviewApiPayload = {
  items?: unknown[];
  pagination?: Partial<EntrevistasOverviewListResponse["pagination"]>;
  summary?: EntrevistasOverviewSummary;
  filtrosDisponiveis?: EntrevistasOverviewFiltrosDisponiveis;
  capabilities?: EntrevistaOverviewCapabilities;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};

type EntrevistasOverviewApiResponse =
  | EntrevistasOverviewListResponse
  | {
      success?: boolean;
      data?: EntrevistasOverviewApiPayload;
    };

type EntrevistasOptionsApiResponse<T> =
  | { items?: T[] }
  | {
      success?: boolean;
      data?: {
        items?: T[];
      };
    };

type EntrevistaCreateApiResponse =
  | EntrevistaCreateResponseItem
  | {
      success?: boolean;
      data?: EntrevistaCreateResponseItem;
    };

function normalizeEndereco(value: any): EntrevistaEndereco | null {
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

function normalizeAgenda(value: any): EntrevistaAgendaInfo | null {
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

function normalizeGoogleCapability(value: any): EntrevistaGoogleCapability | null {
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

function normalizeCapabilities(value: any): EntrevistaOverviewCapabilities | undefined {
  if (!value || typeof value !== "object") return undefined;

  return {
    canCreate:
      typeof value?.canCreate === "boolean" ? value.canCreate : undefined,
    canCreatePresencial:
      typeof value?.canCreatePresencial === "boolean"
        ? value.canCreatePresencial
        : undefined,
    canCreateOnline:
      typeof value?.canCreateOnline === "boolean"
        ? value.canCreateOnline
        : undefined,
    requiresGoogleForOnline:
      typeof value?.requiresGoogleForOnline === "boolean"
        ? value.requiresGoogleForOnline
        : undefined,
    google: normalizeGoogleCapability(value?.google),
  };
}

function normalizeItem(item: any): EntrevistaOverviewItem {
  return {
    id: String(item?.id ?? ""),
    candidaturaId: item?.candidaturaId ?? null,
    empresaAnonima:
      typeof item?.empresaAnonima === "boolean"
        ? item.empresaAnonima
        : undefined,
    statusEntrevista: item?.statusEntrevista ?? "AGENDADA",
    statusEntrevistaLabel: item?.statusEntrevistaLabel ?? item?.statusEntrevista ?? null,
    modalidade: item?.modalidade ?? null,
    modalidadeLabel: item?.modalidadeLabel ?? item?.modalidade ?? null,
    agendadaPara: item?.agendadaPara ?? item?.dataInicio ?? null,
    agendadaParaFormatada:
      item?.agendadaParaFormatada ?? item?.dataInicioFormatada ?? item?.agendadaPara ?? null,
    dataInicio: item?.dataInicio ?? item?.agendadaPara ?? null,
    dataFim: item?.dataFim ?? null,
    descricao: item?.descricao ?? null,
    meetUrl: item?.meetUrl ?? null,
    local: item?.local ?? null,
    enderecoPresencial: normalizeEndereco(item?.enderecoPresencial),
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
    agenda: normalizeAgenda(item?.agenda),
    criadoEm: item?.criadoEm ?? null,
    atualizadoEm: item?.atualizadoEm ?? null,
  };
}

function normalizeListResponse(
  response: EntrevistasOverviewApiResponse,
  fallback?: { page?: number; pageSize?: number },
): EntrevistasOverviewListResponse {
  const payload: EntrevistasOverviewApiPayload =
    "data" in response && response.data
      ? response.data
      : (response as EntrevistasOverviewApiPayload);

  const items = (payload.items ?? []).map(normalizeItem);
  const page = payload.pagination?.page ?? payload.page ?? fallback?.page ?? 1;
  const pageSize =
    payload.pagination?.pageSize ?? payload.pageSize ?? fallback?.pageSize ?? 20;
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
    capabilities: normalizeCapabilities(payload.capabilities),
  };
}

function normalizeOptionsResponse<TInput, TOutput>(
  response: EntrevistasOptionsApiResponse<TInput>,
  normalizeItem: (item: TInput) => TOutput,
): TOutput[] {
  const payload: { items?: TInput[] } =
    "data" in response && response.data
      ? response.data
      : (response as { items?: TInput[] });

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
    enderecoPadraoEntrevista: normalizeEndereco(item?.enderecoPadraoEntrevista),
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
      typeof item?.empresaAnonima === "boolean"
        ? item.empresaAnonima
        : undefined,
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

function normalizeCreateResponse(
  response: EntrevistaCreateApiResponse,
): EntrevistaCreateResponseItem {
  const payload: EntrevistaCreateResponseItem =
    "data" in response && response.data
      ? response.data
      : (response as EntrevistaCreateResponseItem);

  return {
    id: String(payload?.id ?? ""),
    candidaturaId: payload?.candidaturaId ?? null,
    empresaAnonima:
      typeof payload?.empresaAnonima === "boolean"
        ? payload.empresaAnonima
        : undefined,
    statusEntrevista: payload?.statusEntrevista ?? "AGENDADA",
    statusEntrevistaLabel:
      payload?.statusEntrevistaLabel ?? payload?.statusEntrevista ?? null,
    modalidade: payload?.modalidade ?? null,
    modalidadeLabel: payload?.modalidadeLabel ?? payload?.modalidade ?? null,
    dataInicio: payload?.dataInicio ?? payload?.agendadaPara ?? null,
    dataFim: payload?.dataFim ?? null,
    agendadaPara: payload?.agendadaPara ?? payload?.dataInicio ?? null,
    agendadaParaFormatada:
      payload?.agendadaParaFormatada ?? payload?.agendadaPara ?? null,
    descricao: payload?.descricao ?? null,
    meetUrl: payload?.meetUrl ?? null,
    local: payload?.local ?? null,
    enderecoPresencial: normalizeEndereco(payload?.enderecoPresencial),
    agenda: normalizeAgenda(payload?.agenda),
    candidato: payload?.candidato
      ? {
          id: String(payload.candidato.id ?? ""),
          nome: payload.candidato.nome ?? "Candidato",
          codigo: payload.candidato.codigo ?? null,
        }
      : null,
    vaga: payload?.vaga
      ? {
          id: String(payload.vaga.id ?? ""),
          titulo: payload.vaga.titulo ?? "Vaga",
          codigo: payload.vaga.codigo ?? null,
        }
      : null,
    empresa: payload?.empresa
      ? {
          id: String(payload.empresa.id ?? ""),
          nomeExibicao: payload.empresa.nomeExibicao ?? null,
          anonima:
            typeof payload.empresa.anonima === "boolean"
              ? payload.empresa.anonima
              : undefined,
          labelExibicao: payload.empresa.labelExibicao ?? null,
        }
      : null,
    recrutador: payload?.recrutador
      ? {
          id: String(payload.recrutador.id ?? ""),
          nome: payload.recrutador.nome ?? "Recrutador",
        }
      : null,
    criadoEm: payload?.criadoEm ?? null,
  };
}

export async function listEntrevistasOverview(
  params?: EntrevistasOverviewListParams,
  init?: RequestInit,
): Promise<EntrevistasOverviewListResponse> {
  const url = `${ENTREVISTAS_ROUTES.OVERVIEW}${buildQuery(params)}`;
  const response = await apiFetch<EntrevistasOverviewApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeListResponse(response, {
    page: params?.page,
    pageSize: params?.pageSize,
  });
}

export async function listEntrevistaEmpresasOptions(
  init?: RequestInit,
): Promise<EntrevistaEmpresaOpcaoItem[]> {
  const response = await apiFetch<EntrevistasOptionsApiResponse<unknown>>(
    ENTREVISTAS_ROUTES.OPTIONS_EMPRESAS,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildHeaders(init?.headers),
      },
      cache: "no-cache",
    },
  );

  return normalizeOptionsResponse(response, normalizeEmpresaOpcao);
}

export async function listEntrevistaVagasOptions(
  empresaUsuarioId: string,
  init?: RequestInit,
): Promise<EntrevistaVagaOpcaoItem[]> {
  const url = `${ENTREVISTAS_ROUTES.OPTIONS_VAGAS}${buildQuery({
    empresaUsuarioId,
  })}`;

  const response = await apiFetch<EntrevistasOptionsApiResponse<unknown>>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeOptionsResponse(response, normalizeVagaOpcao);
}

export async function listEntrevistaCandidatosOptions(
  vagaId: string,
  init?: RequestInit,
): Promise<EntrevistaCandidatoOpcaoItem[]> {
  const url = `${ENTREVISTAS_ROUTES.OPTIONS_CANDIDATOS}${buildQuery({
    vagaId,
  })}`;

  const response = await apiFetch<EntrevistasOptionsApiResponse<unknown>>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildHeaders(init?.headers),
    },
    cache: "no-cache",
  });

  return normalizeOptionsResponse(response, normalizeCandidatoOpcao);
}

export async function createEntrevista(
  payload: EntrevistaCreatePayload,
  init?: RequestInit,
): Promise<EntrevistaCreateResponseItem> {
  const response = await apiFetch<EntrevistaCreateApiResponse>(
    ENTREVISTAS_ROUTES.CREATE,
    {
      init: {
        method: "POST",
        ...init,
        headers: buildHeaders({
          "Content-Type": apiConfig.headers["Content-Type"],
          ...normalizeHeaders(init?.headers),
        }),
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    },
  );

  return normalizeCreateResponse(response);
}

export type {
  EntrevistaAgendaInfo,
  EntrevistaCandidatoOpcaoItem,
  EntrevistaCreatePayload,
  EntrevistaCreateResponseItem,
  EntrevistaEndereco,
  EntrevistaEmpresaOpcaoItem,
  EntrevistaGoogleCapability,
  EntrevistaOverviewItem,
  EntrevistaOverviewCapabilities,
  EntrevistaVagaOpcaoItem,
  EntrevistaStatus,
  EntrevistaModalidade,
  EntrevistasOverviewFiltrosDisponiveis,
  EntrevistasOverviewListParams,
  EntrevistasOverviewListResponse,
  EntrevistasOverviewSummary,
} from "./types";
