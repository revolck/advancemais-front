import { apiFetch } from "@/api/client";
import { empresasRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";
import type {
  AdminCompanyDashboardApiResponse,
  AdminCompanyListApiResponse,
  AdminCompanyDetailApiResponse,
  AdminCompanyCreateApiResponse,
  AdminCompanyUpdateApiResponse,
  AdminCompanyPaymentHistoryApiResponse,
  AdminCompanyBanHistoryApiResponse,
  AdminCompanyBanCreateApiResponse,
  AdminCompanyBanRevokeApiResponse,
  AdminCompanyVagaListApiResponse,
  AdminCompanyVagaApproveApiResponse,
  AdminCompanyDashboardParams,
  AdminCompanyListParams,
  AdminCompanyPaymentParams,
  AdminCompanyBanParams,
  AdminCompanyVagaParams,
  CreateAdminCompanyPayload,
  UpdateAdminCompanyPayload,
  CreateAdminCompanyBanPayload,
  RevokeAdminCompanyBanPayload,
  BanItem,
  BanListResponse,
  CreateBanPayload,
  RevokeBanPayload,
  BanResponse,
} from "./types";

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Normaliza headers para garantir compatibilidade
 */
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

/**
 * Obtém header de autorização do token armazenado nos cookies
 */
function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Constrói headers padrão para requisições autenticadas
 */
function buildAuthHeaders(
  additionalHeaders?: HeadersInit
): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

/**
 * Constrói query string a partir de parâmetros
 */
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, String(item)));
      } else {
        query.set(key, String(value));
      }
    }
  });

  return query.toString();
}

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Lista empresas para dashboard administrativo
 *
 * Retorna uma listagem paginada otimizada com até 10 empresas por página
 * para exibição em dashboards administrativos.
 *
 * @param params - Parâmetros de paginação e busca
 * @param init - Configurações adicionais da requisição
 * @returns Lista paginada de empresas para dashboard
 */
export async function getAdminCompanyDashboard(
  params?: AdminCompanyDashboardParams,
  init?: RequestInit
): Promise<AdminCompanyDashboardApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.dashboard();
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.search) queryParams.search = params.search;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyDashboardApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// CRUD DE EMPRESAS
// ============================================================================

/**
 * Lista empresas com dados resumidos do plano ativo
 *
 * Retorna empresas (Pessoa Jurídica) com dados resumidos do plano ativo.
 * Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param params - Parâmetros de paginação e busca
 * @param init - Configurações adicionais da requisição
 * @returns Lista paginada de empresas
 */
export async function listAdminCompanies(
  params?: AdminCompanyListParams,
  init?: RequestInit
): Promise<AdminCompanyListApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.list();
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.search) queryParams.search = params.search;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyListApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Valida se um CNPJ já existe na base de dados
 *
 * Verifica se o CNPJ informado já está cadastrado para outra empresa.
 * Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param cnpj - CNPJ a ser validado
 * @param init - Configurações adicionais da requisição
 * @returns Status da validação do CNPJ
 */
export async function validateAdminCompanyCnpj(
  cnpj: string,
  init?: RequestInit
): Promise<{ exists: boolean; message?: string }> {
  const endpoint = empresasRoutes.adminEmpresas.validateCnpj(cnpj);

  return apiFetch<{ exists: boolean; message?: string }>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Valida se um CPF já existe na base de dados
 *
 * Verifica se o CPF informado já está cadastrado para outro usuário.
 * Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param cpf - CPF a ser validado
 * @param init - Configurações adicionais da requisição
 * @returns Status da validação do CPF
 */
export async function validateAdminCompanyCpf(
  cpf: string,
  init?: RequestInit
): Promise<{ exists: boolean; message?: string }> {
  const endpoint = empresasRoutes.adminEmpresas.validateCpf(cpf);

  return apiFetch<{ exists: boolean; message?: string }>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Cria uma nova empresa
 *
 * Cria uma nova empresa (Pessoa Jurídica) e permite opcionalmente vincular
 * um plano ativo no momento da criação. Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param data - Dados da empresa a ser criada
 * @param init - Configurações adicionais da requisição
 * @returns Empresa criada com sucesso
 */
export async function createAdminCompany(
  data: CreateAdminCompanyPayload,
  init?: RequestInit
): Promise<AdminCompanyCreateApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.create();

  return apiFetch<AdminCompanyCreateApiResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Atualiza dados cadastrais da empresa
 *
 * Atualiza dados cadastrais da empresa e permite gerenciar o plano vinculado.
 * Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param id - ID da empresa
 * @param data - Dados a serem atualizados
 * @param init - Configurações adicionais da requisição
 * @returns Empresa atualizada com sucesso
 */
export async function updateAdminCompany(
  id: string,
  data: UpdateAdminCompanyPayload,
  init?: RequestInit
): Promise<AdminCompanyUpdateApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.update(id);

  return apiFetch<AdminCompanyUpdateApiResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Obtém detalhes completos da empresa
 *
 * Retorna informações completas da empresa incluindo plano ativo, pagamentos e métricas.
 * Endpoint restrito aos perfis ADMIN e MODERADOR.
 *
 * @param id - ID da empresa
 * @param init - Configurações adicionais da requisição
 * @returns Detalhes completos da empresa
 */
export async function getAdminCompanyById(
  id: string,
  init?: RequestInit
): Promise<AdminCompanyDetailApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.get(id);

  return apiFetch<AdminCompanyDetailApiResponse>(endpoint, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// PAGAMENTOS
// ============================================================================

/**
 * Lista histórico de pagamentos da empresa
 *
 * Lista eventos de pagamento relacionados à empresa sem expor dados sensíveis
 * de cartão. Apenas perfis ADMIN e MODERADOR podem acessar.
 *
 * @param id - ID da empresa
 * @param params - Parâmetros de paginação
 * @param init - Configurações adicionais da requisição
 * @returns Histórico de pagamentos da empresa
 */
export async function listAdminCompanyPayments(
  id: string,
  params?: AdminCompanyPaymentParams,
  init?: RequestInit
): Promise<AdminCompanyPaymentHistoryApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.pagamentos.list(id);
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyPaymentHistoryApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// BANIMENTOS
// ============================================================================

/**
 * Lista banimentos aplicados à empresa
 *
 * Retorna o histórico de banimentos aplicados ao usuário da empresa,
 * detalhando vigência, status e responsável.
 *
 * @param id - ID da empresa
 * @param params - Parâmetros de paginação
 * @param init - Configurações adicionais da requisição
 * @returns Histórico de banimentos da empresa
 */
export async function listAdminCompanyBans(
  id: string,
  params?: AdminCompanyBanParams,
  init?: RequestInit
): Promise<AdminCompanyBanHistoryApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.banimentos.list(id);
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyBanHistoryApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Aplica banimento à empresa
 *
 * Centraliza o banimento do usuário da empresa, permitindo banimentos
 * temporários ou permanentes com registro de auditoria.
 *
 * @param id - ID da empresa
 * @param data - Dados do banimento
 * @param init - Configurações adicionais da requisição
 * @returns Banimento aplicado com sucesso
 */
export async function createAdminCompanyBan(
  id: string,
  data: CreateAdminCompanyBanPayload,
  init?: RequestInit
): Promise<AdminCompanyBanCreateApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.banimentos.create(id);

  return apiFetch<AdminCompanyBanCreateApiResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Revoga banimento ativo da empresa
 *
 * Revoga o banimento ativo da empresa, restaura o status do usuário
 * e registra auditoria da ação.
 *
 * @param id - ID da empresa
 * @param data - Dados da revogação
 * @param init - Configurações adicionais da requisição
 * @returns Revogação realizada com sucesso
 */
export async function revokeAdminCompanyBan(
  id: string,
  data?: RevokeAdminCompanyBanPayload,
  init?: RequestInit
): Promise<AdminCompanyBanRevokeApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.banimentos.revogar(id);

  return apiFetch<AdminCompanyBanRevokeApiResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: data ? init?.body ?? JSON.stringify(data) : undefined,
    },
    cache: "no-cache",
  });
}

// ============================================================================
// VAGAS
// ============================================================================

/**
 * Lista histórico de vagas da empresa
 *
 * Lista vagas criadas pela empresa com opção de filtrar por status,
 * incluindo o código curto gerado automaticamente para cada vaga.
 *
 * @param id - ID da empresa
 * @param params - Parâmetros de filtro e paginação
 * @param init - Configurações adicionais da requisição
 * @returns Histórico de vagas da empresa
 */
export async function listAdminCompanyVacancies(
  id: string,
  params?: AdminCompanyVagaParams,
  init?: RequestInit
): Promise<AdminCompanyVagaListApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.list(id);
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;
  if (params?.status) queryParams.status = params.status;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyVagaListApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Lista vagas em análise da empresa
 *
 * Retorna vagas da empresa com status EM_ANALISE aguardando aprovação.
 *
 * @param id - ID da empresa
 * @param params - Parâmetros de paginação
 * @param init - Configurações adicionais da requisição
 * @returns Vagas em análise da empresa
 */
export async function listAdminCompanyVacanciesInReview(
  id: string,
  params?: Omit<AdminCompanyVagaParams, "status">,
  init?: RequestInit
): Promise<AdminCompanyVagaListApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.emAnalise(id);
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<AdminCompanyVagaListApiResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Aprova vaga em análise
 *
 * Altera o status da vaga para PUBLICADO caso esteja em análise.
 *
 * @param id - ID da empresa
 * @param vagaId - ID da vaga
 * @param init - Configurações adicionais da requisição
 * @returns Vaga aprovada com sucesso
 */
export async function approveAdminCompanyVacancy(
  id: string,
  vagaId: string,
  init?: RequestInit
): Promise<AdminCompanyVagaApproveApiResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.aprovar(id, vagaId);

  return apiFetch<AdminCompanyVagaApproveApiResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: init?.body ?? null,
    },
    cache: "no-cache",
  });
}

// ============================================================================
// BLOQUEIOS DE USUÁRIOS
// ============================================================================

/**
 * Lista bloqueios aplicados a uma empresa
 *
 * Retorna o histórico de bloqueios aplicados ao usuário da empresa,
 * detalhando vigência, status e responsável.
 *
 * @param id - ID da empresa
 * @param params - Parâmetros de paginação
 * @param init - Configurações adicionais da requisição
 * @returns Lista paginada de bloqueios
 */
export async function listAdminCompanyUserBans(
  id: string,
  params?: AdminCompanyBanParams,
  init?: RequestInit
): Promise<BanListResponse> {
  const endpoint = empresasRoutes.adminEmpresas.bloqueios.list(id);
  const queryParams: Record<string, any> = {};

  if (params?.page) queryParams.page = params.page;
  if (params?.pageSize) queryParams.pageSize = params.pageSize;

  const queryString = buildQueryString(queryParams);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  return apiFetch<BanListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
    cache: "no-cache",
  });
}

/**
 * Aplica bloqueio a uma empresa
 *
 * Centraliza o bloqueio do usuário da empresa, permitindo bloqueios
 * temporários ou permanentes com registro de auditoria.
 *
 * @param id - ID da empresa
 * @param data - Dados do bloqueio
 * @param init - Configurações adicionais da requisição
 * @returns Bloqueio aplicado com sucesso
 */
export async function createAdminCompanyUserBan(
  id: string,
  data: CreateBanPayload,
  init?: RequestInit
): Promise<BanResponse> {
  const endpoint = empresasRoutes.adminEmpresas.bloqueios.create(id);

  return apiFetch<BanResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

/**
 * Revoga bloqueio ativo de uma empresa
 *
 * Revoga o bloqueio ativo da empresa, restaura o status do usuário
 * e registra auditoria da ação.
 *
 * @param id - ID da empresa
 * @param data - Dados da revogação
 * @param init - Configurações adicionais da requisição
 * @returns Revogação realizada com sucesso
 */
export async function revokeAdminCompanyUserBan(
  id: string,
  data: RevokeBanPayload,
  init?: RequestInit
): Promise<void> {
  const endpoint = empresasRoutes.adminEmpresas.bloqueios.revogar(id);

  await apiFetch<void>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: apiConfig.headers.Accept,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}
