import { apiFetch } from "../client";
import { apiConfig, buildApiUrl } from "@/lib/env";
import { CANDIDATOS_ROUTES } from "./routes";
import type {
  AplicarVagaPayload,
  AplicarVagaResponse,
  CandidatoOverview,
  CandidatosFilters,
  CandidatosOverviewResponse,
  CandidaturasFilters,
  CandidaturaSimples,
  CandidaturaStatus,
  CandidatosModuleInfoResponse,
  // Currículos
  CreateCurriculoPayload,
  UpdateCurriculoPayload,
  // Áreas de interesse
  CandidatoAreaInteresse,
  CandidatoAreaInteresseCreateInput,
  CandidatoAreaInteresseUpdateInput,
  CandidatoSubareaInteresse,
  CandidatoSubareaInteresseCreateInput,
  CandidatoSubareaInteresseUpdateInput,
  // Vagas públicas
  VagaPublicaListFilters,
  VagasPublicasListResponse,
  CandidaturaDetalhe,
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

function buildAuthHeaders(
  additionalHeaders?: HeadersInit
): Record<string, string> {
  return {
    ...apiConfig.headers,
    ...getAuthHeader(),
    ...normalizeHeaders(additionalHeaders),
  };
}

// ============================================================================
// INFORMAÇÕES DO MÓDULO
// ============================================================================

export async function getCandidatosModuleInfo(
  init?: RequestInit
): Promise<CandidatosModuleInfoResponse> {
  return apiFetch<CandidatosModuleInfoResponse>(CANDIDATOS_ROUTES.BASE, {
    init: {
      method: "GET",
      ...init,
      headers: {
        Accept: apiConfig.headers.Accept,
        ...normalizeHeaders(init?.headers),
      },
    },
    cache: "no-cache",
  });
}

/**
 * Aplicar a uma vaga usando um currículo
 */
export async function aplicarVaga(
  data: AplicarVagaPayload,
  init?: RequestInit
): Promise<AplicarVagaResponse> {
  return apiFetch<AplicarVagaResponse>(CANDIDATOS_ROUTES.APLICAR, {
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

/**
 * Listar minhas candidaturas
 */
export async function listarMinhasCandidaturas(
  filters?: CandidaturasFilters,
  init?: RequestInit
): Promise<CandidaturaSimples[]> {
  const searchParams = new URLSearchParams();

  if (filters?.vagaId) {
    searchParams.append("vagaId", filters.vagaId);
  }

  if (filters?.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      searchParams.append("status", status);
    });
  }

  const url = `${CANDIDATOS_ROUTES.MINHAS_CANDIDATURAS}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return apiFetch<CandidaturaSimples[]>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

/**
 * Visão consolidada de candidatos e vagas
 */
export async function listarCandidatosOverview(
  filters?: CandidatosFilters,
  init?: RequestInit
): Promise<CandidatosOverviewResponse> {
  const searchParams = new URLSearchParams();

  if (filters?.page) {
    searchParams.append("page", filters.page.toString());
  }

  if (filters?.pageSize) {
    searchParams.append("pageSize", filters.pageSize.toString());
  }

  if (filters?.empresaUsuarioId) {
    searchParams.append("empresaUsuarioId", filters.empresaUsuarioId);
  }

  if (filters?.vagaId) {
    searchParams.append("vagaId", filters.vagaId);
  }

  if (filters?.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      searchParams.append("status", status);
    });
  }

  if (filters?.search) {
    searchParams.append("search", filters.search);
  }

  if (filters?.onlyWithCandidaturas !== undefined) {
    searchParams.append(
      "onlyWithCandidaturas",
      filters.onlyWithCandidaturas.toString()
    );
  }

  if (filters?.criadoDe) {
    searchParams.append("criadoDe", filters.criadoDe);
  }

  if (filters?.criadoAte) {
    searchParams.append("criadoAte", filters.criadoAte);
  }

  const url = `${CANDIDATOS_ROUTES.OVERVIEW}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return apiFetch<CandidatosOverviewResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

/**
 * Listar candidaturas recebidas pela empresa
 */
export async function listarCandidaturasRecebidas(
  filters?: CandidaturasFilters,
  init?: RequestInit
): Promise<CandidaturaSimples[]> {
  const searchParams = new URLSearchParams();

  if (filters?.vagaId) {
    searchParams.append("vagaId", filters.vagaId);
  }

  if (filters?.status && filters.status.length > 0) {
    filters.status.forEach((status) => {
      searchParams.append("status", status);
    });
  }

  const url = `${CANDIDATOS_ROUTES.RECEBIDAS}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return apiFetch<CandidaturaSimples[]>(url, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

/**
 * Buscar candidato por ID (usando o endpoint de overview com filtro específico)
 */
export async function buscarCandidatoPorId(
  candidatoId: string,
  init?: RequestInit
): Promise<CandidatoOverview | null> {
  try {
    const response = await listarCandidatosOverview(
      {
        search: candidatoId,
        page: 1,
        pageSize: 1,
      },
      init
    );

    return (
      response.data.find((candidato) => candidato.id === candidatoId) || null
    );
  } catch (error) {
    console.error("Erro ao buscar candidato:", error);
    return null;
  }
}

/**
 * Atualizar status de candidatura
 */
export async function atualizarStatusCandidatura(
  candidaturaId: string,
  status: CandidaturaStatus,
  init?: RequestInit
): Promise<CandidaturaSimples> {
  // Alinhado ao backend: PUT /api/v1/candidatos/candidaturas/{id}
  return apiFetch<CandidaturaSimples>(
    CANDIDATOS_ROUTES.CANDIDATURA(candidaturaId),
    {
      init: {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        body: JSON.stringify({ status }),
        ...init,
      },
    }
  );
}

/**
 * Obter detalhes de uma candidatura por ID
 */
export async function getCandidaturaById(
  candidaturaId: string,
  init?: RequestInit
): Promise<CandidaturaSimples> {
  return apiFetch<CandidaturaSimples>(
    CANDIDATOS_ROUTES.CANDIDATURA(candidaturaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
    }
  );
}

/**
 * Obter detalhes completos de uma candidatura
 */
export async function getCandidaturaDetalhe(
  candidaturaId: string,
  init?: RequestInit
): Promise<CandidaturaDetalhe> {
  return apiFetch<CandidaturaDetalhe>(
    CANDIDATOS_ROUTES.CANDIDATURA(candidaturaId),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
    }
  );
}

/**
 * Atualizar uma candidatura (status/observações)
 */
export async function atualizarCandidatura(
  candidaturaId: string,
  payload: Partial<{ status: CandidaturaStatus; observacoes: string }> = {},
  init?: RequestInit
): Promise<CandidaturaSimples> {
  return apiFetch<CandidaturaSimples>(
    CANDIDATOS_ROUTES.CANDIDATURA(candidaturaId),
    {
      init: {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        body: JSON.stringify(payload),
        ...init,
      },
    }
  );
}

/**
 * Cancelar candidatura (delete)
 */
export async function cancelarCandidatura(
  candidaturaId: string,
  init?: RequestInit
): Promise<void> {
  return apiFetch<void>(CANDIDATOS_ROUTES.CANDIDATURA(candidaturaId), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

// ============================================================================
// CURRÍCULOS
// ============================================================================

export async function listCurriculos(init?: RequestInit) {
  return apiFetch<any[]>(CANDIDATOS_ROUTES.CURRICULOS, {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

export async function getCurriculo(id: string, init?: RequestInit) {
  return apiFetch<any>(CANDIDATOS_ROUTES.CURRICULO(id), {
    init: {
      method: "GET",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

export async function downloadCurriculoPDF(
  id: string,
  init?: RequestInit
): Promise<Blob> {
  const endpoint = CANDIDATOS_ROUTES.CURRICULO_PDF(id);
  const url = buildApiUrl(endpoint);

  const response = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      ...buildAuthHeaders(init?.headers),
      Accept: "application/pdf",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  return response.blob();
}

export async function createCurriculo(
  data: CreateCurriculoPayload,
  init?: RequestInit
) {
  return apiFetch<any>(CANDIDATOS_ROUTES.CURRICULOS, {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(init?.headers),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

export async function updateCurriculo(
  id: string,
  data: UpdateCurriculoPayload,
  init?: RequestInit
) {
  return apiFetch<any>(CANDIDATOS_ROUTES.CURRICULO(id), {
    init: {
      method: "PUT",
      headers: {
        ...buildAuthHeaders(init?.headers),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

export async function deleteCurriculo(id: string, init?: RequestInit) {
  return apiFetch<void>(CANDIDATOS_ROUTES.CURRICULO(id), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

// ============================================================================
// ÁREAS E SUBÁREAS DE INTERESSE
// ============================================================================

export async function listAreasInteresse(init?: RequestInit) {
  return apiFetch<CandidatoAreaInteresse[]>(CANDIDATOS_ROUTES.AREAS_INTERESSE, {
    init: { method: "GET", ...init, headers: buildAuthHeaders(init?.headers) },
  });
}

export async function getAreaInteresse(
  id: number | string,
  init?: RequestInit
) {
  return apiFetch<CandidatoAreaInteresse>(
    CANDIDATOS_ROUTES.AREA_INTERESSE(id),
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
    }
  );
}

export async function createAreaInteresse(
  data: CandidatoAreaInteresseCreateInput,
  init?: RequestInit
) {
  return apiFetch<CandidatoAreaInteresse>(CANDIDATOS_ROUTES.AREAS_INTERESSE, {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(init?.headers),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      ...init,
    },
  });
}

export async function updateAreaInteresse(
  id: number | string,
  data: CandidatoAreaInteresseUpdateInput,
  init?: RequestInit
) {
  return apiFetch<CandidatoAreaInteresse>(
    CANDIDATOS_ROUTES.AREA_INTERESSE(id),
    {
      init: {
        method: "PUT",
        headers: {
          ...buildAuthHeaders(init?.headers),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        ...init,
      },
    }
  );
}

export async function deleteAreaInteresse(
  id: number | string,
  init?: RequestInit
) {
  return apiFetch<void>(CANDIDATOS_ROUTES.AREA_INTERESSE(id), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

export async function createSubareaInteresse(
  areaId: number | string,
  data: CandidatoSubareaInteresseCreateInput,
  init?: RequestInit
) {
  return apiFetch<CandidatoSubareaInteresse>(
    CANDIDATOS_ROUTES.SUBAREAS_INTERESSE(areaId),
    {
      init: {
        method: "POST",
        headers: {
          ...buildAuthHeaders(init?.headers),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        ...init,
      },
    }
  );
}

export async function updateSubareaInteresse(
  subareaId: number | string,
  data: CandidatoSubareaInteresseUpdateInput,
  init?: RequestInit
) {
  return apiFetch<CandidatoSubareaInteresse>(
    CANDIDATOS_ROUTES.SUBAREA_INTERESSE(subareaId),
    {
      init: {
        method: "PUT",
        headers: {
          ...buildAuthHeaders(init?.headers),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        ...init,
      },
    }
  );
}

export async function deleteSubareaInteresse(
  subareaId: number | string,
  init?: RequestInit
) {
  return apiFetch<void>(CANDIDATOS_ROUTES.SUBAREA_INTERESSE(subareaId), {
    init: {
      method: "DELETE",
      ...init,
      headers: buildAuthHeaders(init?.headers),
    },
  });
}

/**
 * Listar subáreas de interesse (endpoint agregado)
 * GET /api/v1/candidatos/subareas-interesse?areaId=1
 */
export async function listSubareasInteresse(
  areaId?: number | string,
  init?: RequestInit
): Promise<CandidatoSubareaInteresse[]> {
  const qs = areaId ? `?areaId=${encodeURIComponent(String(areaId))}` : "";
  return apiFetch<CandidatoSubareaInteresse[]>(
    `${CANDIDATOS_ROUTES.SUBAREAS_INTERESSE_LIST}${qs}`,
    {
      init: {
        method: "GET",
        ...init,
        headers: buildAuthHeaders(init?.headers),
      },
    }
  );
}

/**
 * Criar subárea de interesse (variante global)
 * POST /api/v1/candidatos/subareas-interesse
 */
export async function createSubareaInteresseGlobal(
  payload: { areaId: number | string; nome: string },
  init?: RequestInit
): Promise<CandidatoSubareaInteresse> {
  return apiFetch<CandidatoSubareaInteresse>(
    CANDIDATOS_ROUTES.SUBAREAS_INTERESSE_LIST,
    {
      init: {
        method: "POST",
        headers: {
          ...buildAuthHeaders(init?.headers),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        ...init,
      },
    }
  );
}

// ============================================================================
// VAGAS PÚBLICAS (LISTAGEM PARA CANDIDATOS)
// ============================================================================

export async function listarVagasPublicas(
  filters?: VagaPublicaListFilters,
  init?: RequestInit
): Promise<VagasPublicasListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "")
        params.append(k, String(v));
    });
  }
  const url = params.toString()
    ? `${CANDIDATOS_ROUTES.VAGAS_PUBLICAS}?${params.toString()}`
    : CANDIDATOS_ROUTES.VAGAS_PUBLICAS;

  return apiFetch<VagasPublicasListResponse>(url, {
    init: {
      method: "GET",
      ...init,
      headers: { Accept: apiConfig.headers.Accept, ...(init?.headers as any) },
    },
  });
}
