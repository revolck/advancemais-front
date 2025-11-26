import { apiFetch } from "@/api/client";
import { apiConfig } from "@/lib/env";
import { CANDIDATOS_ROUTES } from "../routes";
import type {
  CandidatoOverview,
  Candidatura,
  CandidaturaStatus,
} from "../types";

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
// DADOS CONSOLIDADOS DO CANDIDATO
// ============================================================================

/**
 * Interface para dados consolidados do candidato
 */
export interface AdminCandidatoConsolidatedData {
  candidato: CandidatoOverview;
  candidaturas?: {
    recentes: Candidatura[];
    total: number;
    porStatus: Record<CandidaturaStatus, number>;
  };
  curriculos?: {
    recentes: any[]; // TODO: Definir tipo de currículo
    total: number;
  };
  auditoria?: {
    recentes: any[]; // TODO: Definir tipo de auditoria
    total: number;
  };
}

/**
 * Obtém visão consolidada do candidato
 *
 * Retorna uma visão consolidada do candidato incluindo candidaturas,
 * currículos e auditoria. Apenas perfis ADMIN e MODERADOR podem acessar.
 *
 * @param id - ID do candidato
 * @param init - Configurações adicionais da requisição
 * @returns Visão consolidada do candidato
 */
export async function getAdminCandidatoConsolidated(
  id: string,
  init?: RequestInit
): Promise<AdminCandidatoConsolidatedData> {
  // Por enquanto, vamos usar a API existente e simular dados consolidados
  // TODO: Implementar endpoint consolidado no backend
  const candidato = await buscarCandidatoPorId(id, init);

  if (!candidato) {
    throw new Error("Candidato não encontrado");
  }

  // Simular dados consolidados baseados no candidato atual
  return {
    candidato,
    candidaturas: {
      recentes: candidato.candidaturas || [],
      total: candidato.candidaturas?.length || 0,
      porStatus:
        candidato.candidaturas?.reduce((acc, candidatura) => {
          acc[candidatura.status] = (acc[candidatura.status] || 0) + 1;
          return acc;
        }, {} as Record<CandidaturaStatus, number>) || {},
    },
    curriculos: {
      recentes: [], // TODO: Implementar quando tiver endpoint de currículos
      total: 0,
    },
    auditoria: {
      recentes: [], // TODO: Implementar quando tiver endpoint de auditoria
      total: 0,
    },
  };
}

// ============================================================================
// CRUD DE CANDIDATOS
// ============================================================================

/**
 * Busca candidato por ID com dados completos
 *
 * @param id - ID do candidato
 * @param init - Configurações adicionais da requisição
 * @returns Dados completos do candidato
 */
export async function buscarCandidatoPorId(
  id: string,
  init?: RequestInit
): Promise<CandidatoOverview | null> {
  try {
    // Usar a API existente de overview com filtro específico
    // Adicionar onlyWithCandidaturas=false para garantir que retorne mesmo sem candidaturas
    // Mas não filtrar por empresa para retornar todas as candidaturas do candidato
    const url = `${CANDIDATOS_ROUTES.OVERVIEW}?search=${encodeURIComponent(
      id
    )}&pageSize=10`;
    
    console.log("🔍 Buscando candidato na API:", url);
    
    const response = await apiFetch<{
      data: CandidatoOverview[];
      pagination: any;
    }>(url, {
        init: {
          method: "GET",
          ...init,
          headers: buildAuthHeaders(init?.headers),
        },
    });

    console.log("📦 Resposta da API:", {
      total: response.data.length,
      candidatos: response.data.map((c) => ({
        id: c.id,
        nome: c.nomeCompleto,
        candidaturas: c.candidaturas?.length || 0,
      })),
    });

    // Buscar o candidato exato pelo ID
    const candidato = response.data.find((candidato) => candidato.id === id);
    
    if (candidato) {
      console.log("✅ Candidato encontrado:", {
        id: candidato.id,
        nome: candidato.nomeCompleto,
        totalCandidaturas: candidato.candidaturas?.length || 0,
      });
    } else {
      console.warn("⚠️ Candidato não encontrado na resposta:", {
        buscado: id,
        encontrados: response.data.map((c) => c.id),
      });
    }

    return candidato || null;
  } catch (error) {
    console.error("❌ Erro ao buscar candidato:", error);
    return null;
  }
}

/**
 * Atualiza status de candidatura
 *
 * @param candidaturaId - ID da candidatura
 * @param status - Novo status
 * @param init - Configurações adicionais da requisição
 * @returns Candidatura atualizada
 */
export async function atualizarStatusCandidatura(
  candidaturaId: string,
  status: CandidaturaStatus,
  init?: RequestInit
): Promise<Candidatura> {
  return apiFetch<Candidatura>(
    `/api/v1/candidatos/candidaturas/${candidaturaId}/status`,
    {
      init: {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(init?.headers),
        },
        body: JSON.stringify({ status }),
        ...init,
      },
    }
  );
}

/**
 * Bloqueia candidato
 *
 * @param id - ID do candidato
 * @param motivo - Motivo do bloqueio
 * @param duracao - Duração do bloqueio em dias (opcional, permanente se não informado)
 * @param init - Configurações adicionais da requisição
 * @returns Resultado do bloqueio
 */
export async function bloquearCandidato(
  id: string,
  motivo: string,
  duracao?: number,
  init?: RequestInit
): Promise<void> {
  // TODO: Implementar endpoint de bloqueio quando disponível
  console.log("Bloqueando candidato:", { id, motivo, duracao });
}

/**
 * Desbloqueia candidato
 *
 * @param id - ID do candidato
 * @param init - Configurações adicionais da requisição
 * @returns Resultado do desbloqueio
 */
export async function desbloquearCandidato(
  id: string,
  init?: RequestInit
): Promise<void> {
  // TODO: Implementar endpoint de desbloqueio quando disponível
  console.log("Desbloqueando candidato:", id);
}

/**
 * Lista histórico de auditoria do candidato
 *
 * @param id - ID do candidato
 * @param init - Configurações adicionais da requisição
 * @returns Histórico de auditoria
 */
export async function listarAuditoriaCandidato(
  id: string,
  init?: RequestInit
): Promise<any[]> {
  // TODO: Implementar endpoint de auditoria quando disponível
  return [];
}










