"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listEstagiosGlobal,
  type Estagio,
  type EstagioStatus,
} from "@/api/cursos";

export interface NormalizedEstagiosFilters {
  cursoId?: string | null;
  turmaId?: string | null;
  status?: EstagioStatus | null;
  search?: string;
  page: number;
  pageSize: number;
}

export interface EstagioListItem {
  id: string;
  cursoId: string;
  turmaId: string;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  alunoEmail?: string;
  status: EstagioStatus;
  empresaNome: string;
  empresaTelefone?: string;
  cep: string;
  rua: string;
  numero: string;
  dataInicioPrevista: string;
  dataFimPrevista: string;
  horarioInicio: string;
  horarioFim: string;
  compareceu?: boolean | null;
  aprovado?: boolean | null;
  observacoes?: string | null;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface EstagiosQueryResult {
  items: EstagioListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

function mapEstagioToListItem(estagio: Estagio): EstagioListItem {
  return {
    id: estagio.id,
    cursoId: estagio.cursoId,
    turmaId: estagio.turmaId,
    inscricaoId: estagio.inscricaoId,
    alunoId: estagio.alunoId,
    alunoNome: estagio.aluno?.nomeCompleto ?? "—",
    alunoEmail: estagio.aluno?.email,
    status: estagio.status,
    empresaNome: estagio.empresaNome,
    empresaTelefone: estagio.empresaTelefone,
    cep: estagio.cep,
    rua: estagio.rua,
    numero: estagio.numero,
    dataInicioPrevista: estagio.dataInicioPrevista,
    dataFimPrevista: estagio.dataFimPrevista,
    horarioInicio: estagio.horarioInicio,
    horarioFim: estagio.horarioFim,
    compareceu: estagio.compareceu,
    aprovado: estagio.aprovado,
    observacoes: estagio.observacoes,
    criadoEm: estagio.criadoEm,
    atualizadoEm: estagio.atualizadoEm,
  };
}

async function fetchEstagios(
  filters: NormalizedEstagiosFilters
): Promise<EstagiosQueryResult> {
  try {
    const response = await listEstagiosGlobal({
      cursoId: filters.cursoId ?? undefined,
      turmaId: filters.turmaId ?? undefined,
      status: filters.status ?? undefined,
      search: filters.search,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    const items = (response.data ?? []).map(mapEstagioToListItem);

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
    console.error("[useEstagiosDashboardQuery] Erro ao buscar estágios:", error);
    throw error;
  }
}

export function useEstagiosDashboardQuery(filters: NormalizedEstagiosFilters) {
  return useQuery<EstagiosQueryResult, Error>({
    queryKey: ["estagios", "dashboard", filters],
    queryFn: () => fetchEstagios(filters),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}









