"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFrequencia,
  updateFrequencia,
  type Frequencia,
  type FrequenciaStatus,
} from "@/api/cursos";

export interface UpdateFrequenciaVariables {
  cursoId: string;
  turmaId: string;
  aulaId: string;
  inscricaoId: string;
  frequenciaId?: string; // Se existir, faz update; senão, cria
  status: FrequenciaStatus;
  justificativa?: string | null;
  dataReferencia?: string;
}

export function useUpdateFrequenciaMutation() {
  const queryClient = useQueryClient();

  return useMutation<Frequencia, Error, UpdateFrequenciaVariables>({
    mutationFn: async ({
      cursoId,
      turmaId,
      aulaId,
      inscricaoId,
      frequenciaId,
      status,
      justificativa,
      dataReferencia,
    }) => {
      // Se tiver frequenciaId, atualiza; senão, cria
      if (frequenciaId) {
        return updateFrequencia(cursoId, turmaId, frequenciaId, {
          status,
          justificativa,
        });
      } else {
        return createFrequencia(cursoId, turmaId, {
          inscricaoId,
          aulaId,
          status,
          justificativa,
          dataReferencia: dataReferencia ?? new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frequencia", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["frequencia", "resumo"] });
      queryClient.invalidateQueries({ queryKey: ["frequencia", "history"] });
    },
  });
}
