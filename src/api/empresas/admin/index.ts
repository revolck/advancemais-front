import { empresasRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  AdminCompanyDetailResponse,
  AdminCompanyVacancyDetailResponse,
  AdminCompanyVacancyListResponse,
  CreateAdminCompanyPayload,
  AdminCompanyBanDetailResponse,
  AdminCompanyBanHistoryResponse,
  AdminCompanyPaymentHistoryResponse,
  ListAdminCompaniesParams,
  ListAdminCompaniesResponse,
  ListAdminCompanyBansParams,
  ListAdminCompanyPaymentsParams,
  ListAdminCompanyVacanciesParams,
  UpdateAdminCompanyPayload,
  CreateAdminCompanyBanPayload,
} from "./types";

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

export async function listAdminCompanies(
  params?: ListAdminCompaniesParams,
  init?: RequestInit,
): Promise<ListAdminCompaniesResponse> {
  const endpoint = empresasRoutes.adminEmpresas.list();
  const query = new URLSearchParams();

  if (params?.page) {
    query.set("page", String(params.page));
  }
  if (params?.pageSize) {
    query.set("pageSize", String(params.pageSize));
  }
  if (params?.search) {
    query.set("search", params.search);
  }
  if (params?.planNames && params.planNames.length > 0) {
    for (const name of params.planNames) query.append("planName", name);
  }
  if (params?.planTypes && params.planTypes.length > 0) {
    for (const t of params.planTypes) query.append("planType", String(t));
  }

  const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<ListAdminCompaniesResponse>(url, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
    cache: "no-cache",
    retries: 1,
  });
}

export async function getAdminCompanyById(id: string, init?: RequestInit): Promise<AdminCompanyDetailResponse> {
  const endpoint = empresasRoutes.adminEmpresas.get(id);

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyDetailResponse>(endpoint, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
  });
}

export async function createAdminCompany(
  data: CreateAdminCompanyPayload,
  init?: RequestInit,
): Promise<AdminCompanyDetailResponse> {
  const endpoint = empresasRoutes.adminEmpresas.create();

  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyDetailResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers,
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

export async function updateAdminCompany(
  id: string,
  data: UpdateAdminCompanyPayload,
  init?: RequestInit,
): Promise<AdminCompanyDetailResponse> {
  const endpoint = empresasRoutes.adminEmpresas.update(id);

  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyDetailResponse>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers,
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

function appendPaginationParams(
  query: URLSearchParams,
  params?: { page?: number; pageSize?: number },
): void {
  if (!params) return;
  if (params.page) {
    query.set("page", String(params.page));
  }
  if (params.pageSize) {
    query.set("pageSize", String(params.pageSize));
  }
}

export async function listAdminCompanyPayments(
  id: string,
  params?: ListAdminCompanyPaymentsParams,
  init?: RequestInit,
): Promise<AdminCompanyPaymentHistoryResponse> {
  const endpoint = empresasRoutes.adminEmpresas.pagamentos.list(id);
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyPaymentHistoryResponse>(url, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
    cache: "no-cache",
  });
}

export async function listAdminCompanyBans(
  id: string,
  params?: ListAdminCompanyBansParams,
  init?: RequestInit,
): Promise<AdminCompanyBanHistoryResponse> {
  const endpoint = empresasRoutes.adminEmpresas.banimentos.list(id);
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyBanHistoryResponse>(url, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
    cache: "no-cache",
  });
}

export async function createAdminCompanyBan(
  id: string,
  data: CreateAdminCompanyBanPayload,
  init?: RequestInit,
): Promise<AdminCompanyBanDetailResponse> {
  const endpoint = empresasRoutes.adminEmpresas.banimentos.create(id);

  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyBanDetailResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers,
      body: init?.body ?? JSON.stringify(data),
    },
    cache: "no-cache",
  });
}

function normalizeStatusParam(
  status?: ListAdminCompanyVacanciesParams["status"],
): string | undefined {
  if (!status) return undefined;
  if (Array.isArray(status)) {
    return status.filter(Boolean).join(",");
  }
  return typeof status === "string" ? status : String(status);
}

export async function listAdminCompanyVacancies(
  id: string,
  params?: ListAdminCompanyVacanciesParams,
  init?: RequestInit,
): Promise<AdminCompanyVacancyListResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.list(id);
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const normalizedStatus = normalizeStatusParam(params?.status);
  if (normalizedStatus) {
    query.set("status", normalizedStatus);
  }

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyVacancyListResponse>(url, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
    cache: "no-cache",
  });
}

export async function listAdminCompanyVacanciesInReview(
  id: string,
  params?: Omit<ListAdminCompanyVacanciesParams, "status">,
  init?: RequestInit,
): Promise<AdminCompanyVacancyListResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.emAnalise(id);
  const query = new URLSearchParams();
  appendPaginationParams(query, params);

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;

  const headers = {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyVacancyListResponse>(url, {
    init: {
      method: init?.method ?? "GET",
      ...init,
      headers,
    },
    cache: "no-cache",
  });
}

export async function approveAdminCompanyVacancy(
  id: string,
  vacancyId: string,
  init?: RequestInit,
): Promise<AdminCompanyVacancyDetailResponse> {
  const endpoint = empresasRoutes.adminEmpresas.vagas.aprovar(id, vacancyId);

  const headers = {
    "Content-Type": "application/json",
    Accept: apiConfig.headers.Accept,
    ...getAuthHeader(),
    ...normalizeHeaders(init?.headers),
  };

  return apiFetch<AdminCompanyVacancyDetailResponse>(endpoint, {
    init: {
      method: "POST",
      ...init,
      headers,
      body: init?.body ?? null,
    },
    cache: "no-cache",
  });
}
