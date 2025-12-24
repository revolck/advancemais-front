"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertFrequencia, type FrequenciaStatus, type FrequenciaStorageRecord } from "@/mockData/frequencia";

export interface UpdateFrequenciaVariables {
  cursoId: string;
  turmaId: string;
  aulaId: string;
  alunoId: string;
  status: FrequenciaStatus;
  motivo?: string | null;
}

export function useUpdateFrequenciaMutation() {
  const queryClient = useQueryClient();

  return useMutation<FrequenciaStorageRecord, Error, UpdateFrequenciaVariables>({
    mutationFn: async ({ cursoId, turmaId, aulaId, alunoId, status, motivo }) => {
      return upsertFrequencia({ cursoId, turmaId, aulaId, alunoId, status, motivo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frequencia", "dashboard"] });
    },
  });
}

