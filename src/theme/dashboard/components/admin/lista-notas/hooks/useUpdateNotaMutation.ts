"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertNotaForEnrollment,
  upsertNotaWithContextForEnrollment,
  deleteManualNotaForEnrollment,
  type NotaOrigemRef,
  type NotaStorageRecord,
} from "@/mockData/notas";

export interface UpdateNotaVariables {
  cursoId: string;
  turmaId: string;
  alunoId: string;
  nota: number | null;
  motivo?: string | null;
  origem?: NotaOrigemRef | null;
}

export function useUpdateNotaMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotaStorageRecord | null, Error, UpdateNotaVariables>({
    mutationFn: async ({ cursoId, turmaId, alunoId, nota, motivo, origem }) => {
      if (nota === null) {
        return deleteManualNotaForEnrollment({ cursoId, turmaId, alunoId });
      }
      if (motivo !== undefined || origem !== undefined) {
        return upsertNotaWithContextForEnrollment({
          cursoId,
          turmaId,
          alunoId,
          nota,
          motivo,
          origem,
        });
      }
      return upsertNotaForEnrollment({ cursoId, turmaId, alunoId, nota });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas", "dashboard"] });
    },
  });
}
