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
const CURSOS_PAGE_SIZE = 200;
const TURMAS_FETCH_CONCURRENCY = 5;

export interface UseTurmasForSelectOptions {
  cursoId?: string | number | null;
  enabled?: boolean;
  includeCursoNameInLabel?: boolean;
}

/**
 * Busca todas as turmas de todos os cursos para o select
 */
async function listAllTurmas(): Promise<TurmaComCurso[]> {
  try {
    // Busca todos os cursos com paginação
    let page = 1;
    let allCursos: { id: string | number; nome: string }[] = [];
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
    
    // Busca turmas com concorrência limitada para evitar burst de requests
    const turmasResults: TurmaComCurso[][] = [];
    for (let i = 0; i < allCursos.length; i += TURMAS_FETCH_CONCURRENCY) {
      const chunk = allCursos.slice(i, i + TURMAS_FETCH_CONCURRENCY);
      const chunkResults = await Promise.all(
        chunk.map(async (curso) => {
          try {
            const turmas = await listTurmas(curso.id);
            return turmas.map((turma) => ({
              ...turma,
              cursoId: Number(curso.id),
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

async function listTurmasByCurso(cursoId: string | number): Promise<TurmaComCurso[]> {
  try {
    const turmas = await listTurmas(cursoId);
    return turmas.map((turma) => ({
      ...turma,
      cursoId: Number(cursoId),
    })) as TurmaComCurso[];
  } catch (error) {
    console.error("Erro ao buscar turmas do curso:", error);
    return [];
  }
}

export function useTurmasForSelect(options?: UseTurmasForSelectOptions) {
  const cursoId = options?.cursoId ?? null;
  const includeCursoNameInLabel =
    options?.includeCursoNameInLabel ?? cursoId === null;
  const isEnabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: ["turmas", "for-select", cursoId ?? "all"],
    queryFn: () => (cursoId ? listTurmasByCurso(cursoId) : listAllTurmas()),
    enabled: isEnabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const data = isEnabled ? query.data : undefined;

  const turmas: TurmaSelectOption[] =
    data?.map((turma) => ({
      value: turma.id,
      label: `${turma.nome}${includeCursoNameInLabel && turma.cursoNome ? ` - ${turma.cursoNome}` : ""}`,
      metodo: turma.metodo,
    })) ?? [];

  return {
    turmas,
    rawData: data,
    isLoading: isEnabled ? query.isLoading : false,
    error: query.error,
  };
}
