"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAvaliacoes,
  type Avaliacao,
  type AvaliacaoTipo,
  type AvaliacaoStatus,
  type AvaliacaoTipoAtividade,
} from "@/api/cursos";
import { getAvaliacaoStatusEfetivo } from "../utils/avaliacaoStatus";

export interface NormalizedAvaliacoesFilters {
  cursoId?: string | null;
  turmaId?: string | null;
  instrutorId?: string | null;
  fetchAllPages?: boolean;
  semTurma?: boolean;
  tipo?: AvaliacaoTipo | null;
  tipoAtividade?: AvaliacaoTipoAtividade | null;
  modalidade?: string[] | null;
  status?: AvaliacaoStatus | AvaliacaoStatus[] | null;
  obrigatoria?: boolean | null;
  periodo?: string | null; // "YYYY-MM-DD,YYYY-MM-DD"
  search?: string;
  page: number;
  pageSize: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface AvaliacaoListItem {
  id: string;
  codigo?: string;
  cursoId: string;
  turmaId?: string | null;
  tipo: AvaliacaoTipo;
  titulo: string;
  descricao?: string;
  etiqueta?: string;
  status: AvaliacaoStatus;
  modalidade: string;
  instrutorId?: string | null;
  instrutor?: {
    id?: string | null;
    nome?: string | null;
  } | null;
  criadoPorId?: string | null;
  dataInicio?: string;
  dataFim?: string;
  duracaoMinutos?: number;
  valeNota: boolean;
  peso?: number;
  valePonto: boolean;
  obrigatoria: boolean;
  recuperacaoFinal?: boolean;
  criadoEm: string;
  atualizadoEm?: string;
  // Campos calculados/join
  cursoNome?: string;
  turmaNome?: string;
  criadoPor?: {
    id?: string | null;
    nome: string | null;
    avatarUrl: string | null;
    cpf: string | null;
  } | null;
}

export interface AvaliacoesQueryResult {
  items: AvaliacaoListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function extractName(
  value: string | { id?: string; codigo?: string; nome?: string } | null | undefined
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.nome || undefined;
}

function mapAvaliacaoToListItem(avaliacao: Avaliacao): AvaliacaoListItem {
  return {
    id: avaliacao.id,
    codigo: avaliacao.codigo,
    cursoId: avaliacao.cursoId,
    turmaId: avaliacao.turmaId,
    tipo: avaliacao.tipo,
    titulo: avaliacao.titulo || avaliacao.nome || "",
    descricao: avaliacao.descricao,
    etiqueta: avaliacao.etiqueta,
    status: getAvaliacaoStatusEfetivo(avaliacao) as AvaliacaoStatus,
    modalidade: avaliacao.modalidade,
    instrutorId: avaliacao.instrutorId ?? null,
    instrutor: avaliacao.instrutor
      ? {
          id: avaliacao.instrutor.id ?? null,
          nome: avaliacao.instrutor.nome ?? null,
        }
      : null,
    criadoPorId: avaliacao.criadoPorId ?? null,
    dataInicio: avaliacao.dataInicio,
    dataFim: avaliacao.dataFim,
    duracaoMinutos: avaliacao.duracaoMinutos,
    valeNota: avaliacao.valeNota,
    peso: avaliacao.peso ?? avaliacao.pesoNota,
    valePonto: avaliacao.valePonto,
    obrigatoria: avaliacao.obrigatoria,
    recuperacaoFinal: avaliacao.recuperacaoFinal,
    criadoEm: avaliacao.criadoEm || avaliacao.data || "",
    atualizadoEm: avaliacao.atualizadoEm,
    // Mapear campos de visão geral - suporta curso/turma como string ou objeto
    cursoNome: extractName(avaliacao.curso) || avaliacao.cursoNome || undefined,
    turmaNome: extractName(avaliacao.turma) || avaliacao.turmaNome || undefined,
    // Incluir criadoPor se disponível
    criadoPor: avaliacao.criadoPor
      ? {
          id: avaliacao.criadoPor.id ?? null,
          nome: avaliacao.criadoPor.nome ?? null,
          avatarUrl: avaliacao.criadoPor.avatarUrl ?? null,
          cpf: avaliacao.criadoPor.cpf ?? null,
        }
      : null,
  };
}

async function fetchAvaliacoes(
  filters: NormalizedAvaliacoesFilters
): Promise<AvaliacoesQueryResult> {
  try {
    const statusParam = Array.isArray(filters.status)
      ? filters.status.join(",")
      : filters.status ?? undefined;
    const modalidadeParam =
      filters.modalidade && filters.modalidade.length > 0
        ? filters.modalidade.join(",")
        : undefined;

    const buildParams = (page: number, pageSize: number) => ({
      cursoId: filters.cursoId ?? undefined,
      turmaId: filters.turmaId ?? undefined,
      instrutorId: filters.instrutorId ?? undefined,
      semTurma: filters.semTurma,
      tipo: filters.tipo ?? undefined,
      tipoAtividade: filters.tipoAtividade ?? undefined,
      modalidade: modalidadeParam,
      status: statusParam,
      obrigatoria: filters.obrigatoria ?? undefined,
      periodo: filters.periodo ?? undefined,
      search: filters.search,
      page,
      pageSize,
      orderBy: filters.orderBy,
      order: filters.order,
    });

    const shouldFetchAllPages = filters.fetchAllPages === true;
    const aggregated: Avaliacao[] = [];
    let finalPagination: AvaliacoesQueryResult["pagination"] | undefined;

    if (shouldFetchAllPages) {
      const batchSize = Math.max(filters.pageSize, 100);
      let page = 1;
      let totalPages = 1;

      do {
        const response = await listAvaliacoes(buildParams(page, batchSize));
        aggregated.push(...(response.data ?? []));

        const total =
          Number(response.pagination?.total ?? aggregated.length) || aggregated.length;
        totalPages = Number(response.pagination?.totalPages ?? 1) || 1;
        finalPagination = {
          page: 1,
          pageSize: filters.pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
        };
        page += 1;
      } while (page <= totalPages);
    } else {
      const response = await listAvaliacoes(buildParams(filters.page, filters.pageSize));
      aggregated.push(...(response.data ?? []));
      finalPagination = response.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: aggregated.length,
        totalPages: Math.max(1, Math.ceil(aggregated.length / filters.pageSize)),
      };
    }

    const items = aggregated.map(mapAvaliacaoToListItem);

    return {
      items,
      pagination: finalPagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / filters.pageSize)),
      },
    };
  } catch (error) {
    console.error(
      "[useAvaliacoesDashboardQuery] Erro ao buscar avaliações:",
      error
    );
    const apiError = error as Error & { status?: number };
    if (apiError?.status === 403) {
      throw new Error("Você não tem permissão para esta avaliação");
    }
    throw apiError;
  }
}

/**
 * Hook para buscar avaliações (provas/atividades) usando a API global
 * Substitui o antigo useProvasDashboardQuery que fazia loops por turmas
 */
export function useAvaliacoesDashboardQuery(filters: NormalizedAvaliacoesFilters) {
  return useQuery<AvaliacoesQueryResult, Error>({
    queryKey: ["avaliacoes", "dashboard", filters],
    queryFn: () => fetchAvaliacoes(filters),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
