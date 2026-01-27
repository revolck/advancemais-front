"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listAvaliacoes,
  type Avaliacao,
  type AvaliacaoTipo,
  type AvaliacaoStatus,
  type AvaliacaoTipoAtividade,
} from "@/api/cursos";

export interface NormalizedAvaliacoesFilters {
  cursoId?: string | null;
  turmaId?: string | null;
  instrutorId?: string | null;
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
    status: avaliacao.status,
    modalidade: avaliacao.modalidade,
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
    criadoPor: avaliacao.criadoPor,
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

    const response = await listAvaliacoes({
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
      page: filters.page,
      pageSize: filters.pageSize,
      orderBy: filters.orderBy,
      order: filters.order,
    });

    const items = (response.data ?? []).map(mapAvaliacaoToListItem);

    return {
      items,
      pagination: response.pagination ?? {
        page: filters.page,
        pageSize: filters.pageSize,
        total: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / filters.pageSize)),
      },
    };
  } catch (error) {
    console.error("[useAvaliacoesDashboardQuery] Erro ao buscar avaliações:", error);
    throw error;
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
  });
}
