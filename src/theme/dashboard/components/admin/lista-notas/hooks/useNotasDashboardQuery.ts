"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  listNotasGlobal,
  type NotaLancamento,
  type NotaHistoryEvent,
  type NotaOrigem,
} from "@/api/cursos";

export interface NormalizedNotasFilters {
  cursoId: string | null;
  turmaIds: string[];
  page: number;
  pageSize: number;
  search?: string;
  orderBy?: "alunoNome" | "nota" | "atualizadoEm";
  order?: "asc" | "desc";
  enabled?: boolean;
}

export interface NotaListItem {
  key: string;
  notaId?: string | null;
  historicoNotaId?: string | null;
  historicoDisponivel?: boolean;
  cursoId: string;
  turmaId: string;
  inscricaoId?: string;
  alunoId: string;
  alunoNome: string;
  alunoCpf?: string | null;
  alunoCodigo?: string | null;
  codigoMatricula?: string | null;
  alunoAvatarUrl?: string | null;
  cursoNome?: string | null;
  cursoCodigo?: string | null;
  turmaNome?: string | null;
  turmaCodigo?: string | null;
  statusInscricao?: string;
  nota: number | null;
  atualizadoEm: string;
  criadoEm?: string;
  motivo?: string | null;
  origem?: NotaOrigem | null;
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
  const notaWithLegacy = nota as NotaLancamento & {
    id?: string | null;
    notaId?: string | null;
    historicoNotaId?: string | null;
    historicoDisponivel?: boolean;
    aluno?: {
      cpf?: string | null;
      codigo?: string | null;
      codUsuario?: string | null;
      avatarUrl?: string | null;
    } | null;
    alunoCpf?: string | null;
    cpf?: string | null;
    alunoCodigo?: string | null;
    codigoAluno?: string | null;
    codigoInscricao?: string | null;
    matriculaCodigo?: string | null;
    alunoAvatarUrl?: string | null;
    avatarUrl?: string | null;
    cursoNome?: string | null;
    nomeCurso?: string | null;
    cursoCodigo?: string | null;
    codigoCurso?: string | null;
    turmaNome?: string | null;
    nomeTurma?: string | null;
    turmaCodigo?: string | null;
    codigoTurma?: string | null;
    curso?: {
      nome?: string | null;
      codigo?: string | null;
    } | null;
    turma?: {
      nome?: string | null;
      codigo?: string | null;
    } | null;
  };

  return {
    key: `${nota.cursoId}::${nota.turmaId}::${nota.alunoId}`,
    notaId: notaWithLegacy.notaId ?? notaWithLegacy.id ?? null,
    historicoNotaId:
      notaWithLegacy.historicoNotaId ??
      notaWithLegacy.notaId ??
      notaWithLegacy.id ??
      null,
    historicoDisponivel:
      notaWithLegacy.historicoDisponivel ??
      (Boolean(
        notaWithLegacy.historicoNotaId ??
          notaWithLegacy.notaId ??
          notaWithLegacy.id
      ) ||
        (nota.history?.length ?? 0) > 0),
    cursoId: nota.cursoId,
    turmaId: nota.turmaId,
    inscricaoId: nota.inscricaoId,
    alunoId: nota.alunoId,
    alunoNome: nota.alunoNome,
    criadoEm: nota.criadoEm,
    alunoCpf:
      notaWithLegacy.aluno?.cpf ??
      notaWithLegacy.alunoCpf ??
      notaWithLegacy.cpf ??
      null,
    alunoCodigo:
      notaWithLegacy.aluno?.codigo ??
      notaWithLegacy.aluno?.codUsuario ??
      notaWithLegacy.alunoCodigo ??
      notaWithLegacy.codigoAluno ??
      null,
    codigoMatricula:
      notaWithLegacy.codigoInscricao ??
      notaWithLegacy.matriculaCodigo ??
      null,
    alunoAvatarUrl:
      notaWithLegacy.aluno?.avatarUrl ??
      notaWithLegacy.alunoAvatarUrl ??
      notaWithLegacy.avatarUrl ??
      null,
    cursoNome:
      notaWithLegacy.curso?.nome ??
      notaWithLegacy.cursoNome ??
      notaWithLegacy.nomeCurso ??
      null,
    cursoCodigo:
      notaWithLegacy.curso?.codigo ??
      notaWithLegacy.cursoCodigo ??
      notaWithLegacy.codigoCurso ??
      null,
    turmaNome:
      notaWithLegacy.turma?.nome ??
      notaWithLegacy.turmaNome ??
      notaWithLegacy.nomeTurma ??
      null,
    turmaCodigo:
      notaWithLegacy.turma?.codigo ??
      notaWithLegacy.turmaCodigo ??
      notaWithLegacy.codigoTurma ??
      null,
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
  try {
    const response = await listNotasGlobal({
      cursoId: filters.cursoId ?? undefined,
      turmaIds: filters.turmaIds.length > 0 ? filters.turmaIds.join(",") : undefined,
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
    enabled: filters.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
