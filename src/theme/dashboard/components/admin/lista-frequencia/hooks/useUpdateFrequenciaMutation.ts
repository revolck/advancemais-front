"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertFrequenciaLancamento,
  type Frequencia,
  type FrequenciaOrigemTipo,
  type FrequenciaStatus,
} from "@/api/cursos";

export interface UpdateFrequenciaVariables {
  cursoId: string;
  turmaId: string;
  frequenciaId?: string | null;
  tipoOrigem: FrequenciaOrigemTipo;
  origemId: string;
  inscricaoId: string;
  status: FrequenciaStatus;
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia?: string;
}

export function useUpdateFrequenciaMutation() {
  const queryClient = useQueryClient();

  return useMutation<Frequencia, Error, UpdateFrequenciaVariables>({
    mutationFn: async ({
      cursoId,
      turmaId,
      tipoOrigem,
      origemId,
      inscricaoId,
      status,
      justificativa,
      observacoes,
    }) => {
      return upsertFrequenciaLancamento(cursoId, turmaId, {
        inscricaoId,
        tipoOrigem,
        origemId,
        status,
        justificativa,
        observacoes: observacoes ?? null,
        modoLancamento: "MANUAL",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frequencia", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["frequencia", "resumo"] });
      queryClient.invalidateQueries({ queryKey: ["frequencia", "history"] });
    },
  });
}
