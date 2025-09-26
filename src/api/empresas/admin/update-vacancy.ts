import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { routes } from "@/api/routes";
import type { AdminCompanyVagaItem } from "./types";

export interface VagaUpdateInput {
  usuarioId?: string;
  areaInteresseId?: number;
  subareaInteresseId?: number;
  modoAnonimo?: boolean;
  regimeDeTrabalho?: string;
  modalidade?: string;
  titulo?: string;
  slug?: string;
  paraPcd?: boolean;
  vagaEmDestaque?: boolean;
  numeroVagas?: number;
  descricao?: string;
  requisitos?: {
    obrigatorios?: string[];
    desejaveis?: string[];
  } | null;
  atividades?: {
    principais?: string[];
    extras?: string[];
  } | null;
  beneficios?: {
    lista?: string[];
    observacoes?: string;
  } | null;
  observacoes?: string;
  jornada?: string;
  senioridade?: string;
  inscricoesAte?: string;
  inseridaEm?: string;
  status?: string;
  localizacao?: {
    cidade?: string;
    estado?: string;
    formato?: string;
  } | null;
  salarioMin?: string | number;
  salarioMax?: string | number;
  salarioConfidencial?: boolean;
  maxCandidaturasPorUsuario?: number | null;
}

function getAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

export async function updateVacancy(
  vacancyId: string,
  data: VagaUpdateInput,
  init?: RequestInit
): Promise<AdminCompanyVagaItem> {
  const endpoint = routes.empresas.adminEmpresas.vagas.update(vacancyId);

  return apiFetch<AdminCompanyVagaItem>(endpoint, {
    init: {
      method: "PUT",
      ...init,
      headers: {
        ...apiConfig.headers,
        ...getAuthHeader(),
        ...normalizeHeaders(init?.headers),
      },
      body: JSON.stringify(data),
    },
    cache: "no-cache",
  });
}
