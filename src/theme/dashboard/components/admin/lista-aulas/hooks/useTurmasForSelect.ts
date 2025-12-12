"use client";

import { useQuery } from "@tanstack/react-query";
import { listTurmas, listCursos, type CursoTurma } from "@/api/cursos";

interface SelectOption {
  value: string;
  label: string;
}

export interface TurmaSelectOption extends SelectOption {
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
}

type TurmaComCurso = CursoTurma & {
  cursoId?: number;
  cursoNome?: string;
};

/**
 * Busca todas as turmas de todos os cursos para o select
 */
async function listAllTurmas(): Promise<TurmaComCurso[]> {
  try {
    // Busca todos os cursos com paginação
    let page = 1;
    const pageSize = 50;
    let allCursos: { id: string | number; nome: string }[] = [];
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
          cursoId: Number(curso.id),
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

export function useTurmasForSelect() {
  const query = useQuery({
    queryKey: ["turmas-for-select"],
    queryFn: listAllTurmas,
    staleTime: 60000, // 1 minute
  });

  const turmas: TurmaSelectOption[] =
    query.data?.map((turma) => ({
      value: turma.id,
      label: `${turma.nome}${turma.cursoNome ? ` - ${turma.cursoNome}` : ""}`,
      metodo: turma.metodo,
    })) ?? [];

  return {
    turmas,
    rawData: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
