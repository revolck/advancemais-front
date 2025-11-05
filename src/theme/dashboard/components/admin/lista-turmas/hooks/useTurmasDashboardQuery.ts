"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listTurmas, listCursos, type CursoTurma } from "@/api/cursos";
import { queryKeys } from "@/lib/react-query/queryKeys";

export interface TurmasDashboardFilters {
  cursoId: string | null;
}

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
    const pageSize = 50;
    let allCursos: any[] = [];
    let hasMore = true;
    
    while (hasMore) {
      const cursosResponse = await listCursos({ page, pageSize });
      const cursos = cursosResponse.data || [];
      allCursos = [...allCursos, ...cursos];
      
      const totalPages = cursosResponse.pagination?.totalPages || 1;
      hasMore = page < totalPages;
      page++;
      
      if (page > 100) break; // Limite de segurança
    }
    
    // Busca turmas de todos os cursos e adiciona informações do curso
    const turmasPromises = allCursos.map(async (curso) => {
      try {
        const turmas = await listTurmas(curso.id);
        // Adiciona informações do curso a cada turma
        return turmas.map((turma) => ({
          ...turma,
          cursoId: curso.id,
          cursoNome: curso.nome,
        })) as TurmaComCurso[];
      } catch {
        return [];
      }
    });
    
    const turmasResults = await Promise.all(turmasPromises);
    
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
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
