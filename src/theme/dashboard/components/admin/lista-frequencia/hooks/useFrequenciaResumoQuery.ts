"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getFrequenciaResumo, type FrequenciaResumoItem } from "@/api/cursos";
import type { AulaSelectItem } from "./useAulasForSelect";

export type FrequenciaResumoPeriodo = "TOTAL" | "DIA" | "SEMANA" | "MES";
export type FrequenciaResumoSortBy = "ALUNO" | "TAXA";
export type FrequenciaSortDirection = "asc" | "desc";

export interface NormalizedFrequenciaResumoFilters {
  cursoId: string | null;
  turmaId: string | null;
  periodo: FrequenciaResumoPeriodo;
  anchorDate: Date | null;
  aulas: AulaSelectItem[];
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: FrequenciaResumoSortBy;
  sortDirection?: FrequenciaSortDirection;
}

export interface FrequenciaResumoListItem {
  key: string;
  cursoId: string;
  turmaId: string;
  alunoId: string;
  alunoNome: string;
  alunoCodigo?: string | null;
  alunoCpf?: string | null;
  totalAulas: number;
  presencas: number;
  ausencias: number;
  pendentes: number;
  justificadas: number;
  atrasados: number;
  taxaPresencaPct: number;
}

export interface FrequenciaResumoQueryResult {
  items: FrequenciaResumoListItem[];
  totalAulasNoPeriodo: number;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function mapResumoItemToListItem(
  item: FrequenciaResumoItem,
  cursoId: string,
  turmaId: string,
  periodo: FrequenciaResumoPeriodo
): FrequenciaResumoListItem {
  return {
    key: `${cursoId}::${turmaId}::${item.alunoId}::${periodo}`,
    cursoId,
    turmaId,
    alunoId: item.alunoId,
    alunoNome: item.alunoNome,
    alunoCodigo: item.alunoCodigo ?? null,
    alunoCpf: null, // API não retorna CPF no resumo
    totalAulas: item.totalAulas,
    presencas: item.presencas,
    ausencias: item.ausencias,
    pendentes: 0, // Calculado como: totalAulas - (presencas + ausencias + atrasados + justificadas)
    justificadas: item.justificadas,
    atrasados: item.atrasados,
    taxaPresencaPct: item.taxaPresencaPct,
  };
}

async function fetchResumo(
  filters: NormalizedFrequenciaResumoFilters
): Promise<FrequenciaResumoQueryResult> {
  if (!filters.cursoId || !filters.turmaId) {
    return {
      items: [],
      totalAulasNoPeriodo: 0,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 1,
      },
    };
  }

  try {
    const anchorDate = filters.anchorDate
      ? format(filters.anchorDate, "yyyy-MM-dd")
      : undefined;

    const response = await getFrequenciaResumo(
      filters.cursoId,
      filters.turmaId,
      {
        periodo: filters.periodo,
        anchorDate,
        search: filters.search,
        page: filters.page,
        pageSize: filters.pageSize,
      }
    );

    const items = (response.data?.items ?? []).map((item) =>
      mapResumoItemToListItem(
        item,
        filters.cursoId!,
        filters.turmaId!,
        filters.periodo
      )
    );

    // Ordenação local (caso a API não suporte)
    const dir = filters.sortDirection ?? "asc";
    const mult = dir === "asc" ? 1 : -1;
    const sortBy = filters.sortBy ?? "ALUNO";

    if (sortBy === "TAXA") {
      items.sort((a, b) => mult * (a.taxaPresencaPct - b.taxaPresencaPct));
    } else {
      items.sort(
        (a, b) =>
          mult *
          a.alunoNome.localeCompare(b.alunoNome, "pt-BR", { sensitivity: "base" })
      );
    }

    return {
      items,
      totalAulasNoPeriodo: response.data?.totalAulasNoPeriodo ?? 0,
      pagination: response.data?.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / filters.pageSize)),
      },
    };
  } catch (error) {
    console.error("[useFrequenciaResumoQuery] Erro ao buscar resumo:", error);
    throw error;
  }
}

export function useFrequenciaResumoQuery(
  filters: NormalizedFrequenciaResumoFilters
) {
  const anchor = filters.anchorDate
    ? format(filters.anchorDate, "yyyy-MM-dd")
    : null;

  return useQuery<FrequenciaResumoQueryResult, Error>({
    queryKey: [
      "frequencia",
      "resumo",
      filters.cursoId,
      filters.turmaId,
      filters.periodo,
      anchor,
      filters.sortBy ?? "ALUNO",
      filters.sortDirection ?? "asc",
      filters.page,
      filters.pageSize,
      filters.search ?? null,
    ],
    queryFn: () => fetchResumo(filters),
    enabled: Boolean(filters.cursoId && filters.turmaId),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
