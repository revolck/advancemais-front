"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listInscricoes, type TurmaInscricao } from "@/api/cursos";
import type { AulaSelectItem } from "./useAulasForSelect";
import {
  didAulaHappen,
  getFrequenciaComputed,
  type FrequenciaStatus,
} from "@/mockData/frequencia";
import { getMockAlunosForTurma } from "@/mockData/notas";

export interface NormalizedFrequenciaFilters {
  cursoId: string | null;
  turmaId: string | null;
  aula: AulaSelectItem | null;
  page: number;
  pageSize: number;
  search?: string;
}

export interface FrequenciaListItem {
  key: string;
  cursoId: string;
  turmaId: string;
  aulaId: string;
  alunoId: string;
  alunoNome: string;
  statusAtual: FrequenciaStatus;
  motivo?: string | null;
  sugestaoStatus: FrequenciaStatus;
  evidence: {
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

async function fetchFrequencia(filters: NormalizedFrequenciaFilters): Promise<FrequenciaQueryResult> {
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

  const aula = filters.aula;
  let inscricoes: TurmaInscricao[] = [];
  try {
    inscricoes = (await listInscricoes(filters.cursoId, filters.turmaId)) ?? [];
  } catch {
    inscricoes = [];
  }

  if (inscricoes.length === 0) {
    const mock = getMockAlunosForTurma({
      cursoId: filters.cursoId,
      turmaId: filters.turmaId,
      count: 20,
    });
    inscricoes = mock.map((m, idx) => ({
      id: `mock-inscricao-${filters.cursoId}-${filters.turmaId}-${idx}`,
      alunoId: m.alunoId,
      aluno: { id: m.alunoId, nomeCompleto: m.alunoNome },
    }));
  }
  const search = (filters.search ?? "").trim();

  const canEdit = didAulaHappen(aula);

  const all: FrequenciaListItem[] = (inscricoes ?? []).map((inscricao) => {
    const alunoId = inscricao.alunoId;
    const alunoNome = normalizeAlunoNome(inscricao);
    const computed = getFrequenciaComputed({
      cursoId: filters.cursoId as string,
      turmaId: filters.turmaId as string,
      aula: {
        id: aula.id,
        dataInicio: aula.dataInicio,
        dataFim: aula.dataFim,
        duracaoMinutos: aula.duracaoMinutos,
        modalidade: aula.modalidade,
      },
      alunoId,
    });

    return {
      key: computed.key,
      cursoId: filters.cursoId as string,
      turmaId: filters.turmaId as string,
      aulaId: aula.id,
      alunoId,
      alunoNome,
      statusAtual: computed.statusAtual,
      motivo: computed.motivo ?? null,
      sugestaoStatus: computed.sugestaoStatus,
      evidence: computed.evidence,
    };
  });

  const filtered =
    search.length > 0
      ? all.filter(
          (item) =>
            includesSearch(item.alunoNome, search) ||
            includesSearch(item.alunoId, search)
        )
      : all;

  // Ordena por nome
  filtered.sort((a, b) =>
    a.alunoNome.localeCompare(b.alunoNome, "pt-BR", { sensitivity: "base" })
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(Math.max(1, filters.page), totalPages);
  const start = (safePage - 1) * filters.pageSize;
  const end = start + filters.pageSize;

  return {
    items: filtered.slice(start, end),
    canEdit,
    pagination: {
      page: safePage,
      pageSize: filters.pageSize,
      total,
      totalPages,
    },
  };
}

export function useFrequenciaDashboardQuery(filters: NormalizedFrequenciaFilters) {
  return useQuery<FrequenciaQueryResult, Error>({
    queryKey: [
      "frequencia",
      "dashboard",
      filters.cursoId,
      filters.turmaId,
      filters.aula?.id ?? null,
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
