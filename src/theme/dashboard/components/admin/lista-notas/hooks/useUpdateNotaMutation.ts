"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNota,
  deleteNotas,
  type NotaLancamento,
  type NotaOrigem,
} from "@/api/cursos";

export interface UpdateNotaVariables {
  cursoId: string;
  turmaId: string;
  alunoId: string;
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigem | null;
}

export function useUpdateNotaMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotaLancamento | null, Error, UpdateNotaVariables>({
    mutationFn: async ({ cursoId, turmaId, alunoId, nota, motivo, origem }) => {
      // Se nota for null, remove os lançamentos manuais do aluno
      if (nota === null) {
        await deleteNotas(cursoId, turmaId, { alunoId });
        return null;
      }

      // Cria lançamento de nota manual (incremental)
      return createNota(cursoId, turmaId, {
        alunoId,
        nota,
        motivo: motivo ?? "Lançamento manual",
        origem,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas", "dashboard"] });
    },
  });
}
