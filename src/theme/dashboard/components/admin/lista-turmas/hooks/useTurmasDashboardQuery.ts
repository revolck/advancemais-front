"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listTurmas, listCursos, type CursoTurma } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface TurmasDashboardFilters {
  cursoId: string | null;
}

const CURSOS_PAGE_SIZE = 200;
const TURMAS_FETCH_CONCURRENCY = 5;

/**
 * Tipo estendido de turma com informações do curso
 */
type TurmaComCurso = CursoTurma & {
  cursoId?: number;
  cursoNome?: string;
};

/**
 * Busca todas as turmas de todos os cursos
 */
async function listAllTurmas(): Promise<TurmaComCurso[]> {
  try {
    // Busca todos os cursos com paginação
    let page = 1;
    let allCursos: any[] = [];
    let hasMore = true;
    
    while (hasMore) {
      const cursosResponse = await listCursos({ page, pageSize: CURSOS_PAGE_SIZE });
      const cursos = cursosResponse.data || [];
      allCursos = [...allCursos, ...cursos];
      
      const totalPages = cursosResponse.pagination?.totalPages || 1;
      hasMore = page < totalPages;
      page++;
      
      if (page > 100) break; // Limite de segurança
    }
    
    // Busca turmas de todos os cursos com concorrência limitada
    // para evitar burst de requests no backend/browser.
    const turmasResults: TurmaComCurso[][] = [];
    for (let i = 0; i < allCursos.length; i += TURMAS_FETCH_CONCURRENCY) {
      const chunk = allCursos.slice(i, i + TURMAS_FETCH_CONCURRENCY);
      const chunkResults = await Promise.all(
        chunk.map(async (curso) => {
          try {
            const turmas = await listTurmas(curso.id);
            return turmas.map((turma) => ({
              ...turma,
              cursoId: curso.id,
              cursoNome: curso.nome,
            })) as TurmaComCurso[];
          } catch {
            return [];
          }
        })
      );
      turmasResults.push(...chunkResults);
    }
    
    // Remove duplicatas e retorna todas as turmas
    const uniqueTurmas = new Map<string, TurmaComCurso>();
    turmasResults.flat().forEach((turma) => {
      if (turma && turma.id) {
        uniqueTurmas.set(turma.id, turma);
      }
    });
    
    return Array.from(uniqueTurmas.values());
  } catch (error) {
    console.error("Erro ao buscar todas as turmas:", error);
    return [];
  }
}

export function useTurmasDashboardQuery({
  cursoId,
}: TurmasDashboardFilters) {
  return useQuery<(CursoTurma | TurmaComCurso)[], Error>({
    queryKey: queryKeys.turmas.list({ cursoId }),
    queryFn: async () => {
      // Se um curso específico foi selecionado, busca apenas suas turmas
      if (cursoId) {
        const response = await listTurmas(cursoId);
        return Array.isArray(response) ? response : [];
      }
      
      // Se nenhum curso foi selecionado, busca todas as turmas
      return await listAllTurmas();
    },
    enabled: true, // Sempre habilitado (busca todas ou de um curso específico)
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
