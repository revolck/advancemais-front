"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateEstagioStatus,
  type Estagio,
  type EstagioStatus,
} from "@/api/cursos";

export interface UpdateEstagioStatusVariables {
  estagioId: string;
  status: EstagioStatus;
  compareceu?: boolean;
  observacoes?: string;
}

export function useUpdateEstagioStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<Estagio, Error, UpdateEstagioStatusVariables>({
    mutationFn: async ({ estagioId, status, compareceu, observacoes }) => {
      return updateEstagioStatus(estagioId, {
        status,
        compareceu,
        observacoes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estagios", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["estagios"] });
    },
  });
}









