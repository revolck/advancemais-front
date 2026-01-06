"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listFrequencias,
  type Frequencia,
  type FrequenciaStatus,
} from "@/api/cursos";
import type { AulaSelectItem } from "./useAulasForSelect";

export type FrequenciaAulaSortBy = "ALUNO";
export type FrequenciaSortDirection = "asc" | "desc";

export interface NormalizedFrequenciaFilters {
  cursoId: string | null;
  turmaId: string | null;
  aula: AulaSelectItem | null;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: FrequenciaAulaSortBy;
  sortDirection?: FrequenciaSortDirection;
}

// Re-export para compatibilidade
export type { FrequenciaStatus } from "@/api/cursos";

export interface FrequenciaListItem {
  id: string;
  key: string;
  cursoId: string;
  turmaId: string;
  aulaId: string;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  alunoCodigo?: string | null;
  alunoCpf?: string | null;
  statusAtual: FrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
  evidence?: {
    ultimoLogin?: string | null;
    tempoAoVivoMin?: number | null;
  };
}

export interface FrequenciaQueryResult {
  items: FrequenciaListItem[];
  canEdit: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function mapFrequenciaToListItem(freq: Frequencia): FrequenciaListItem {
  return {
    id: freq.id,
    key: freq.id,
    cursoId: freq.cursoId,
    turmaId: freq.turmaId,
    aulaId: freq.aulaId,
    inscricaoId: freq.inscricaoId,
    alunoId: freq.aluno?.id ?? freq.inscricaoId,
    alunoNome: freq.aluno?.nome ?? "—",
    alunoCodigo: null, // API pode retornar isso no futuro
    alunoCpf: null, // API pode retornar isso no futuro
    statusAtual: freq.status,
    justificativa: freq.justificativa,
    observacoes: freq.observacoes,
    dataReferencia: freq.dataReferencia,
    evidence: {
      ultimoLogin: null, // API pode retornar isso no futuro
      tempoAoVivoMin: null, // API pode retornar isso no futuro
    },
  };
}

async function fetchFrequencia(
  filters: NormalizedFrequenciaFilters
): Promise<FrequenciaQueryResult> {
  if (!filters.cursoId || !filters.turmaId || !filters.aula) {
    return {
      items: [],
      canEdit: false,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  }

  try {
    const response = await listFrequencias(filters.cursoId, filters.turmaId, {
      aulaId: filters.aula.id,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    const items = (response.data ?? []).map(mapFrequenciaToListItem);

    // Filtro local por search (se a API não suportar)
    const search = (filters.search ?? "").trim().toLowerCase();
    const filtered = search
      ? items.filter(
          (item) =>
            item.alunoNome.toLowerCase().includes(search) ||
            item.alunoId.toLowerCase().includes(search) ||
            (item.alunoCodigo?.toLowerCase().includes(search) ?? false) ||
            (item.alunoCpf?.toLowerCase().includes(search) ?? false)
        )
      : items;

    // Ordenação local
    const dir = filters.sortDirection ?? "asc";
    const mult = dir === "asc" ? 1 : -1;
    const sortBy = filters.sortBy ?? "ALUNO";

    if (sortBy === "ALUNO") {
      filtered.sort(
        (a, b) =>
          mult *
          a.alunoNome.localeCompare(b.alunoNome, "pt-BR", { sensitivity: "base" })
      );
    }

    // Verifica se pode editar (aula já aconteceu)
    const now = new Date();
    const aulaFim = filters.aula.dataFim
      ? new Date(filters.aula.dataFim)
      : filters.aula.dataInicio
      ? new Date(
          new Date(filters.aula.dataInicio).getTime() +
            (filters.aula.duracaoMinutos ?? 60) * 60000
        )
      : null;
    const canEdit = aulaFim ? now >= aulaFim : false;

    return {
      items: filtered,
      canEdit,
      pagination: response.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / filters.pageSize)),
      },
    };
  } catch (error) {
    console.error("[useFrequenciaDashboardQuery] Erro ao buscar frequências:", error);
    throw error;
  }
}

export function useFrequenciaDashboardQuery(filters: NormalizedFrequenciaFilters) {
  return useQuery<FrequenciaQueryResult, Error>({
    queryKey: [
      "frequencia",
      "dashboard",
      filters.cursoId,
      filters.turmaId,
      filters.aula?.id ?? null,
      filters.sortBy ?? "ALUNO",
      filters.sortDirection ?? "asc",
      filters.page,
      filters.pageSize,
      filters.search ?? null,
    ],
    queryFn: () => fetchFrequencia(filters),
    enabled: Boolean(filters.cursoId && filters.turmaId && filters.aula?.id),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
