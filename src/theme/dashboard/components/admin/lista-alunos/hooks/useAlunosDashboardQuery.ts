"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listAlunosComInscricao,
  type AlunoComInscricao,
  type ListAlunosComInscricaoParams,
} from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface NormalizedAlunosFilters {
  page: number;
  pageSize: number;
  status?: string | null;
  cursoId?: number | null;
  turmaId?: string | null;
  cidade?: string | null;
  search?: string;
}

export interface AlunosQueryResult {
  alunos: AlunoComInscricao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useAlunosDashboardQuery(filters: NormalizedAlunosFilters) {
  return useQuery<AlunosQueryResult, Error>({
    queryKey: queryKeys.alunos.list(filters),
    queryFn: async () => {
      const params: ListAlunosComInscricaoParams = {
        page: filters.page,
        limit: filters.pageSize,
      };

      if (filters.status) params.status = filters.status;
      if (filters.cursoId) params.cursoId = filters.cursoId;
      if (filters.turmaId) params.turmaId = filters.turmaId;
      if (filters.cidade) params.cidade = filters.cidade;
      if (filters.search) params.search = filters.search;

      const response = await listAlunosComInscricao(params);

      const originalAlunos = response.data ?? [];

      const filtered = originalAlunos.filter((aluno) => {
        const matchesCurso =
          !filters.cursoId ||
          aluno.ultimoCurso?.curso.id === filters.cursoId;
        const matchesTurma =
          !filters.turmaId ||
          aluno.ultimoCurso?.turma.id === filters.turmaId;
        const matchesCidade =
          !filters.cidade ||
          (aluno.cidade || "").toLowerCase() ===
            filters.cidade.toLowerCase();

        if (filters.search && filters.search.length >= 3) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            aluno.nomeCompleto.toLowerCase().includes(searchLower) ||
            (aluno.email || "").toLowerCase().includes(searchLower) ||
            (aluno.cpf || "").toLowerCase().includes(searchLower) ||
            aluno.id.toLowerCase().includes(searchLower);

          return (
            matchesCurso &&
            matchesTurma &&
            matchesCidade &&
            matchesSearch
          );
        }

        return matchesCurso && matchesTurma && matchesCidade;
      });

      const filteredTotal = filtered.length;

      const pagination = response.pagination
        ? {
            page: response.pagination.page ?? filters.page,
            pageSize: response.pagination.pageSize ?? filters.pageSize,
            total:
              filters.cursoId || filters.turmaId || filters.cidade
                ? filteredTotal
                : response.pagination.total ?? filteredTotal,
            totalPages:
              filters.cursoId || filters.turmaId || filters.cidade
                ? Math.max(
                    1,
                    Math.ceil(filteredTotal / filters.pageSize)
                  )
                : response.pagination.pages ??
                  Math.max(1, Math.ceil(filteredTotal / filters.pageSize)),
          }
        : {
            page: filters.page,
            pageSize: filters.pageSize,
            total: filteredTotal,
            totalPages: Math.max(
              1,
              Math.ceil(filteredTotal / filters.pageSize)
            ),
          };

      return {
        alunos: filtered,
        pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

