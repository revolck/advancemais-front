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
  status?: string | string[] | null; // Status único ou array para múltiplos status
  cursoId?: string | null; // UUID (string) - seleção individual
  turmaId?: string | null; // UUID (string) - seleção individual
  cidade?: string | string[] | null; // Cidade único ou array para múltiplas cidades
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

      if (filters.status) {
        params.status = Array.isArray(filters.status) && filters.status.length === 1
          ? filters.status[0]
          : filters.status;
      }
      if (filters.cursoId) {
        // Agora sempre é string único (não array)
        params.cursoId = filters.cursoId;
      }
      if (filters.turmaId) {
        // Agora sempre é string único (não array)
        params.turmaId = filters.turmaId;
      }
      if (filters.cidade) {
        params.cidade = Array.isArray(filters.cidade) && filters.cidade.length === 1
          ? filters.cidade[0]
          : filters.cidade;
      }
      if (filters.search) params.search = filters.search;

      const response = await listAlunosComInscricao(params);

      const originalAlunos = response.data ?? [];

      const filtered = originalAlunos.filter((aluno) => {
        // Suporte para múltiplos status
        const matchesStatus = !filters.status
          ? true
          : Array.isArray(filters.status)
          ? filters.status.includes(aluno.ultimoCurso?.statusInscricao || "")
          : aluno.ultimoCurso?.statusInscricao === filters.status;
        
        // Curso individual (string único)
        const matchesCurso = !filters.cursoId
          ? true
          : aluno.ultimoCurso?.curso.id === filters.cursoId;
        
        // Turma individual (string único)
        const matchesTurma = !filters.turmaId
          ? true
          : aluno.ultimoCurso?.turma.id === filters.turmaId;
        
        // Suporte para múltiplas cidades
        const matchesCidade = !filters.cidade
          ? true
          : Array.isArray(filters.cidade)
          ? filters.cidade.some((cidade) =>
              (aluno.cidade || "").toLowerCase() === cidade.toLowerCase()
            )
          : (aluno.cidade || "").toLowerCase() === filters.cidade.toLowerCase();

        if (filters.search && filters.search.length >= 3) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            aluno.nomeCompleto.toLowerCase().includes(searchLower) ||
            (aluno.email || "").toLowerCase().includes(searchLower) ||
            (aluno.cpf || "").toLowerCase().includes(searchLower) ||
            aluno.id.toLowerCase().includes(searchLower);

          return (
            matchesStatus &&
            matchesCurso &&
            matchesTurma &&
            matchesCidade &&
            matchesSearch
          );
        }

        return matchesStatus && matchesCurso && matchesTurma && matchesCidade;
      });

      const filteredTotal = filtered.length;

      const pagination = response.pagination
        ? {
            page: response.pagination.page ?? filters.page,
            pageSize: response.pagination.pageSize ?? filters.pageSize,
            total:
              filters.status || filters.cursoId || filters.turmaId || filters.cidade || filters.search
                ? filteredTotal
                : response.pagination.total ?? filteredTotal,
            totalPages:
              filters.status || filters.cursoId || filters.turmaId || filters.cidade || filters.search
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

