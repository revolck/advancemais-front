"use client";

import { useQuery } from "@tanstack/react-query";
import { getCursoAlunoDetalhes, type CursoAlunoDetalhesResponse } from "@/api/cursos";

export function useAlunoDetalhesQuery(alunoId: string | null) {
  return useQuery<CursoAlunoDetalhesResponse, Error>({
    queryKey: ["notas", "aluno-detalhes", alunoId],
    queryFn: async () => {
      return await getCursoAlunoDetalhes(alunoId as string);
    },
    enabled: Boolean(alunoId && alunoId.trim().length > 0),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 0,
  });
}

