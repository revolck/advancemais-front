"use client";

import { useQuery } from "@tanstack/react-query";
import { listNotasGlobal } from "@/api/cursos";

interface UseNotasAtuaisPorAlunoParams {
  cursoId: string | null;
  turmaId: string | null;
}

export function useNotasAtuaisPorAluno({
  cursoId,
  turmaId,
}: UseNotasAtuaisPorAlunoParams) {
  const query = useQuery<Record<string, number>, Error>({
    queryKey: ["notas", "atuais-por-aluno", cursoId, turmaId],
    enabled: Boolean(cursoId && turmaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    queryFn: async () => {
      const notaByAlunoId: Record<string, number> = {};
      const pageSize = 200;
      let page = 1;
      let totalPages = 1;

      do {
        const response = await listNotasGlobal({
          cursoId: cursoId as string,
          turmaIds: turmaId as string,
          page,
          pageSize,
          orderBy: "atualizadoEm",
          order: "desc",
        });

        const items = response.data?.items ?? [];
        for (const item of items) {
          if (!item?.alunoId) continue;
          if (notaByAlunoId[item.alunoId] !== undefined) continue;
          const notaAtual =
            typeof item.nota === "number" && Number.isFinite(item.nota)
              ? item.nota
              : 0;
          notaByAlunoId[item.alunoId] = notaAtual;
        }

        totalPages = Math.max(1, response.data?.pagination?.totalPages ?? 1);
        page += 1;
      } while (page <= totalPages);

      return notaByAlunoId;
    },
  });

  return {
    notaByAlunoId: query.data ?? {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
