"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listNotas, type NotaLancamento, type NotaHistoryEvent } from "@/api/cursos";

export interface NormalizedNotasFilters {
  cursoId: string | null;
  turmaIds: string[];
  page: number;
  pageSize: number;
  search?: string;
  orderBy?: "alunoNome" | "nota" | "atualizadoEm";
  order?: "asc" | "desc";
}

export interface NotaListItem {
  key: string;
  cursoId: string;
  turmaId: string;
  inscricaoId?: string;
  alunoId: string;
  alunoNome: string;
  statusInscricao?: string;
  nota: number | null;
  atualizadoEm: string;
  criadoEm?: string;
  motivo?: string | null;
  origem?: {
    tipo: "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";
    id?: string | null;
    titulo?: string | null;
  } | null;
  isManual: boolean;
  history: NotaHistoryEvent[];
}

export interface NotasQueryResult {
  items: NotaListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function mapNotaLancamentoToListItem(nota: NotaLancamento): NotaListItem {
  return {
    key: `${nota.cursoId}::${nota.turmaId}::${nota.alunoId}`,
    cursoId: nota.cursoId,
    turmaId: nota.turmaId,
    inscricaoId: nota.inscricaoId,
    alunoId: nota.alunoId,
    alunoNome: nota.alunoNome,
    nota: nota.nota,
    atualizadoEm: nota.atualizadoEm,
    motivo: nota.motivo,
    origem: nota.origem,
    isManual: nota.isManual,
    history: nota.history ?? [],
  };
}

async function fetchNotasDashboard(
  filters: NormalizedNotasFilters
): Promise<NotasQueryResult> {
  if (!filters.cursoId || filters.turmaIds.length === 0) {
    return {
      items: [],
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  }

  try {
    const response = await listNotas(filters.cursoId, {
      turmaIds: filters.turmaIds.join(","),
      search: filters.search,
      page: filters.page,
      pageSize: filters.pageSize,
      orderBy: filters.orderBy,
      order: filters.order,
    });

    const items = (response.data?.items ?? []).map(mapNotaLancamentoToListItem);

    return {
      items,
      pagination: response.data?.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / filters.pageSize)),
      },
    };
  } catch (error) {
    console.error("[useNotasDashboardQuery] Erro ao buscar notas:", error);
    throw error;
  }
}

export function useNotasDashboardQuery(filters: NormalizedNotasFilters) {
  return useQuery<NotasQueryResult, Error>({
    queryKey: ["notas", "dashboard", filters],
    queryFn: () => fetchNotasDashboard(filters),
    enabled: Boolean(filters.cursoId && filters.turmaIds.length > 0),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
