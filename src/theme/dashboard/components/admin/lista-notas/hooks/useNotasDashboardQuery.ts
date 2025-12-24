"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";
import {
  ensureNotasSeededForTurma,
  getNotasStoreSnapshot,
  getNotasHistorySnapshot,
  getNotaForEnrollmentFromStore,
  hasManualNotaInStore,
  type NotaHistoryEvent,
  type NotaOrigemRef,
} from "@/mockData/notas";

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
  origem?: NotaOrigemRef | null;
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

function normalizeAlunoNome(inscricao: TurmaInscricao): string {
  return (
    inscricao.aluno?.nomeCompleto ||
    inscricao.aluno?.nome ||
    inscricao.alunoId ||
    "—"
  );
}

function includesSearch(value: string, search: string): boolean {
  return value.toLowerCase().includes(search.toLowerCase());
}

function sortItems(
  items: NotaListItem[],
  orderBy: NormalizedNotasFilters["orderBy"],
  order: NormalizedNotasFilters["order"]
) {
  const field = orderBy ?? "alunoNome";
  const direction = order ?? "asc";
  const factor = direction === "asc" ? 1 : -1;

  const arr = [...items];
  arr.sort((a, b) => {
    if (field === "alunoNome") {
      return (
        factor *
        a.alunoNome.localeCompare(b.alunoNome, "pt-BR", { sensitivity: "base" })
      );
    }
    if (field === "nota") {
      const aVal = a.nota ?? -1;
      const bVal = b.nota ?? -1;
      return factor * (aVal - bVal);
    }
    if (field === "atualizadoEm") {
      const aTime = a.atualizadoEm ? new Date(a.atualizadoEm).getTime() : 0;
      const bTime = b.atualizadoEm ? new Date(b.atualizadoEm).getTime() : 0;
      return factor * (aTime - bTime);
    }
    return 0;
  });
  return arr;
}

async function fetchNotasDashboard(filters: NormalizedNotasFilters): Promise<NotasQueryResult> {
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

  const cursoId = filters.cursoId;
  const turmaIds = filters.turmaIds;

  const results = await Promise.all(
    turmaIds.map(async (turmaId) => {
      try {
        const inscricoes = await listInscricoes(cursoId, turmaId);
        return { turmaId, inscricoes };
      } catch {
        return { turmaId, inscricoes: [] as TurmaInscricao[] };
      }
    })
  );

  results.forEach(({ turmaId, inscricoes }) => {
    if (!inscricoes?.length) return;
    ensureNotasSeededForTurma({
      cursoId,
      turmaId,
      alunoIds: inscricoes.map((i) => i.alunoId),
    });
  });

  const notasStore = getNotasStoreSnapshot();
  const historyStore = getNotasHistorySnapshot();

  const search = (filters.search ?? "").trim();

  const allItems: NotaListItem[] = results.flatMap(({ turmaId, inscricoes }) =>
    (inscricoes ?? []).map((inscricao) => {
      const alunoId = inscricao.alunoId;
      const alunoNome = normalizeAlunoNome(inscricao);
      const notaInfo = getNotaForEnrollmentFromStore(notasStore, {
        cursoId,
        turmaId,
        alunoId,
      });
      const isManual = hasManualNotaInStore(notasStore, { cursoId, turmaId, alunoId });

      return {
        key: notaInfo.key,
        cursoId,
        turmaId,
        inscricaoId: inscricao.id,
        alunoId,
        alunoNome,
        statusInscricao: inscricao.status,
        nota: notaInfo.nota,
        atualizadoEm: notaInfo.atualizadoEm,
        criadoEm: notaInfo.criadoEm,
        motivo: notaInfo.motivo,
        origem: notaInfo.origem,
        isManual,
        history: historyStore[notaInfo.key] ?? [],
      };
    })
  );

  const filtered =
    search.length > 0
      ? allItems.filter(
          (item) =>
            includesSearch(item.alunoNome, search) ||
            includesSearch(item.alunoId, search)
        )
      : allItems;

  const sorted = sortItems(filtered, filters.orderBy, filters.order);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(Math.max(1, filters.page), totalPages);
  const start = (safePage - 1) * filters.pageSize;
  const end = start + filters.pageSize;
  const pageItems = sorted.slice(start, end);

  return {
    items: pageItems,
    pagination: {
      page: safePage,
      pageSize: filters.pageSize,
      total,
      totalPages,
    },
  };
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
