import { empresasRoutes } from "@/api/routes";
import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import type {
  AdminCompanyDetailResponse,
  CreateAdminCompanyPayload,
  ListAdminCompaniesParams,
  ListAdminCompaniesResponse,
  UpdateAdminCompanyPayload,
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
  const endpoint = empresasRoutes.admin.list();
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
  });
}

export async function getAdminCompanyById(id: string, init?: RequestInit): Promise<AdminCompanyDetailResponse> {
  const endpoint = empresasRoutes.admin.get(id);

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
  const endpoint = empresasRoutes.admin.create();

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
  const endpoint = empresasRoutes.admin.update(id);

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
