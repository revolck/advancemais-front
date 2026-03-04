"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listFrequencias,
  listFrequenciasGlobal,
  type Frequencia,
  type FrequenciaOrigemTipo,
  type ListFrequenciasResponse,
  type FrequenciaStatus,
} from "@/api/cursos";
import type { AulaSelectItem } from "./useAulasForSelect";

export type FrequenciaAulaSortBy = "ALUNO";
export type FrequenciaSortDirection = "asc" | "desc";

export interface NormalizedFrequenciaFilters {
  cursoId: string | null;
  turmaId: string | null;
  origemTipo: FrequenciaOrigemTipo | null;
  origemId: string | null;
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
  id: string | null;
  syntheticId?: string | null;
  isPersisted?: boolean;
  key: string;
  cursoId: string;
  cursoNome?: string | null;
  turmaId: string;
  turmaNome?: string | null;
  turmaCodigo?: string | null;
  aulaId: string | null;
  tipoOrigem: FrequenciaOrigemTipo;
  origemId: string | null;
  origemTitulo?: string | null;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  alunoCodigo?: string | null;
  alunoCpf?: string | null;
  avatarUrl?: string | null;
  statusAtual: FrequenciaStatus;
  modoLancamento?: "MANUAL" | "AUTOMATICO";
  minutosPresenca?: number | null;
  minimoMinutosParaPresenca?: number | null;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string | null;
  naturalKey?: {
    inscricaoId: string;
    tipoOrigem: FrequenciaOrigemTipo;
    origemId: string;
  };
  evidence?: {
    acessou?: boolean;
    primeiroAcessoEm?: string | null;
    ultimoAcessoEm?: string | null;
    minutosEngajados?: number | null;
    respondeu?: boolean;
    statusSugerido?: FrequenciaStatus;
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
  const rawFreq = freq as Frequencia & {
    cursoNome?: string | null;
    turmaNome?: string | null;
    turmaCodigo?: string | null;
    curso?: { nome?: string | null };
    turma?: { nome?: string | null; codigo?: string | null };
  };
  const tipoOrigem = freq.tipoOrigem ?? "AULA";
  const origemId = freq.origemId ?? freq.aulaId ?? null;
  const alunoNome =
    freq.alunoNome ??
    freq.aluno?.nomeCompleto ??
    freq.aluno?.nome ??
    "—";

  const fallbackKey = `${freq.turmaId}::${freq.inscricaoId}::${tipoOrigem}::${
    origemId ?? "sem-origem"
  }`;

  return {
    id: freq.id,
    syntheticId: freq.syntheticId ?? null,
    isPersisted: freq.isPersisted,
    key: freq.id ?? freq.syntheticId ?? fallbackKey,
    cursoId: freq.cursoId,
    cursoNome: rawFreq.cursoNome ?? rawFreq.curso?.nome ?? null,
    turmaId: freq.turmaId,
    turmaNome: rawFreq.turmaNome ?? rawFreq.turma?.nome ?? null,
    turmaCodigo: rawFreq.turmaCodigo ?? rawFreq.turma?.codigo ?? null,
    aulaId: freq.aulaId ?? null,
    tipoOrigem,
    origemId,
    origemTitulo: freq.origemTitulo ?? null,
    inscricaoId: freq.inscricaoId,
    alunoId: freq.aluno?.id ?? freq.alunoId ?? freq.inscricaoId,
    alunoNome,
    alunoCodigo: freq.aluno?.codigo ?? null,
    alunoCpf: freq.aluno?.cpf ?? null,
    avatarUrl: freq.aluno?.avatarUrl ?? null,
    statusAtual: freq.status,
    modoLancamento: freq.modoLancamento,
    minutosPresenca: freq.minutosPresenca ?? null,
    minimoMinutosParaPresenca: freq.minimoMinutosParaPresenca ?? null,
    justificativa: freq.justificativa,
    observacoes: freq.observacoes,
    dataReferencia: freq.dataReferencia ?? null,
    naturalKey:
      freq.naturalKey ??
      (origemId
        ? {
            inscricaoId: freq.inscricaoId,
            tipoOrigem,
            origemId,
          }
        : undefined),
    evidence: {
      acessou: freq.evidencia?.acessou,
      primeiroAcessoEm: freq.evidencia?.primeiroAcessoEm ?? null,
      ultimoAcessoEm: freq.evidencia?.ultimoAcessoEm ?? null,
      minutosEngajados:
        typeof freq.evidencia?.minutosEngajados === "number"
          ? freq.evidencia.minutosEngajados
          : freq.minutosPresenca ?? null,
      respondeu: freq.evidencia?.respondeu,
      statusSugerido: freq.evidencia?.statusSugerido,
    },
  };
}

async function fetchFrequencia(
  filters: NormalizedFrequenciaFilters
): Promise<FrequenciaQueryResult> {
  try {
    const queryParams = {
      tipoOrigem: filters.origemTipo ?? undefined,
      origemId: filters.origemId ?? undefined,
      aulaId:
        filters.origemTipo === "AULA" && filters.origemId
          ? filters.origemId
          : undefined,
      search: filters.search || undefined,
      page: filters.page,
      pageSize: filters.pageSize,
    };

    const response: ListFrequenciasResponse =
      filters.cursoId && filters.turmaId
        ? await listFrequencias(filters.cursoId, filters.turmaId, queryParams)
        : await listFrequenciasGlobal({
            ...queryParams,
            cursoId: filters.cursoId ?? undefined,
            turmaIds: filters.turmaId ?? undefined,
          });

    const parsed = parseFrequenciasResponse(response);

    const items = parsed.items.map(mapFrequenciaToListItem);

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
    const canEdit = (() => {
      // No contexto global (sem filtros selecionados), permite edição para
      // perfis autorizados. O bloqueio por tempo só vale quando há aula
      // selecionada no contexto da tela.
      if (!filters.cursoId || !filters.turmaId || !filters.origemId) {
        return true;
      }
      if (filters.origemTipo !== "AULA") return true;
      if (!filters.aula) return true;
      const now = new Date();
      const aulaFim = filters.aula.dataFim
        ? new Date(filters.aula.dataFim)
        : filters.aula.dataInicio
        ? new Date(
            new Date(filters.aula.dataInicio).getTime() +
              (filters.aula.duracaoMinutos ?? 60) * 60000
          )
        : null;
      return aulaFim ? now >= aulaFim : true;
    })();

    return {
      items: filtered,
      canEdit,
      pagination: parsed.pagination ?? {
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
      filters.origemTipo,
      filters.origemId,
      filters.aula?.id ?? null,
      filters.sortBy ?? "ALUNO",
      filters.sortDirection ?? "asc",
      filters.page,
      filters.pageSize,
      filters.search ?? null,
    ],
    queryFn: () => fetchFrequencia(filters),
    enabled: true,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

function parseFrequenciasResponse(
  response: ListFrequenciasResponse
): {
  items: Frequencia[];
  pagination?: FrequenciaQueryResult["pagination"];
} {
  const raw = response as any;

  const items =
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.data) && raw.data.data) ||
    (Array.isArray(raw?.data?.data?.items) && raw.data.data.items) ||
    (Array.isArray(raw?.items) && raw.items) ||
    [];

  const pagination =
    raw?.pagination ??
    raw?.data?.pagination ??
    raw?.data?.data?.pagination ??
    undefined;

  return {
    items,
    pagination,
  };
}
