"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listRespostas,
  responderQuestao,
  corrigirResposta,
  type RespostaComQuestao,
  type ResponderQuestaoPayload,
  type CorrigirRespostaPayload,
  type ListRespostasParams,
} from "@/api/provas";

interface UseRespostasParams {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  params?: ListRespostasParams;
  enabled?: boolean;
}

/**
 * Hook para listar respostas de uma prova
 */
export function useRespostas({
  cursoId,
  turmaId,
  provaId,
  params,
  enabled = true,
}: UseRespostasParams) {
  return useQuery<RespostaComQuestao[]>({
    queryKey: ["respostas", cursoId, turmaId, provaId, params],
    queryFn: async () => {
      return await listRespostas(cursoId, turmaId, provaId, params);
    },
    enabled: enabled && !!cursoId && !!turmaId && !!provaId,
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
  });
}

/**
 * Hook para responder uma questão (aluno)
 */
export function useResponderQuestao({
  cursoId,
  turmaId,
  provaId,
}: Omit<UseRespostasParams, "params" | "enabled">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questaoId,
      payload,
    }: {
      questaoId: string;
      payload: ResponderQuestaoPayload;
    }) => {
      return await responderQuestao(cursoId, turmaId, provaId, questaoId, payload);
    },
    onSuccess: () => {
      // Invalida a lista de respostas
      queryClient.invalidateQueries({
        queryKey: ["respostas", cursoId, turmaId, provaId],
      });
    },
  });
}

/**
 * Hook para corrigir uma resposta (instrutor)
 */
export function useCorrigirResposta({
  cursoId,
  turmaId,
  provaId,
}: Omit<UseRespostasParams, "params" | "enabled">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questaoId,
      payload,
    }: {
      questaoId: string;
      payload: CorrigirRespostaPayload;
    }) => {
      return await corrigirResposta(cursoId, turmaId, provaId, questaoId, payload);
    },
    onSuccess: () => {
      // Invalida a lista de respostas
      queryClient.invalidateQueries({
        queryKey: ["respostas", cursoId, turmaId, provaId],
      });
    },
  });
}


