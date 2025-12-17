"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listQuestoes,
  getQuestaoById,
  createQuestao,
  updateQuestao,
  deleteQuestao,
  type Questao,
  type CreateQuestaoPayload,
  type UpdateQuestaoPayload,
} from "@/api/provas";

interface UseQuestoesParams {
  cursoId: string | number;
  turmaId: string;
  provaId: string;
  enabled?: boolean;
}

/**
 * Hook para listar questões de uma prova
 */
export function useQuestoes({
  cursoId,
  turmaId,
  provaId,
  enabled = true,
}: UseQuestoesParams) {
  return useQuery<Questao[]>({
    queryKey: ["questoes", cursoId, turmaId, provaId],
    queryFn: async () => {
      return await listQuestoes(cursoId, turmaId, provaId);
    },
    enabled: enabled && !!cursoId && !!turmaId && !!provaId,
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
  });
}

/**
 * Hook para buscar uma questão específica
 */
export function useQuestao({
  cursoId,
  turmaId,
  provaId,
  questaoId,
  enabled = true,
}: UseQuestoesParams & { questaoId: string }) {
  return useQuery<Questao>({
    queryKey: ["questao", cursoId, turmaId, provaId, questaoId],
    queryFn: async () => {
      return await getQuestaoById(cursoId, turmaId, provaId, questaoId);
    },
    enabled: enabled && !!cursoId && !!turmaId && !!provaId && !!questaoId,
    staleTime: 30000,
    gcTime: 60000,
  });
}

/**
 * Hook para criar uma questão
 */
export function useCreateQuestao({
  cursoId,
  turmaId,
  provaId,
}: UseQuestoesParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateQuestaoPayload) => {
      return await createQuestao(cursoId, turmaId, provaId, payload);
    },
    onSuccess: () => {
      // Invalida a lista de questões
      queryClient.invalidateQueries({
        queryKey: ["questoes", cursoId, turmaId, provaId],
      });
    },
  });
}

/**
 * Hook para atualizar uma questão
 */
export function useUpdateQuestao({
  cursoId,
  turmaId,
  provaId,
}: UseQuestoesParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questaoId,
      payload,
    }: {
      questaoId: string;
      payload: UpdateQuestaoPayload;
    }) => {
      return await updateQuestao(cursoId, turmaId, provaId, questaoId, payload);
    },
    onSuccess: (data, variables) => {
      // Invalida a lista de questões
      queryClient.invalidateQueries({
        queryKey: ["questoes", cursoId, turmaId, provaId],
      });
      // Invalida a questão específica
      queryClient.invalidateQueries({
        queryKey: ["questao", cursoId, turmaId, provaId, variables.questaoId],
      });
    },
  });
}

/**
 * Hook para deletar uma questão
 */
export function useDeleteQuestao({
  cursoId,
  turmaId,
  provaId,
}: UseQuestoesParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questaoId: string) => {
      return await deleteQuestao(cursoId, turmaId, provaId, questaoId);
    },
    onSuccess: () => {
      // Invalida a lista de questões
      queryClient.invalidateQueries({
        queryKey: ["questoes", cursoId, turmaId, provaId],
      });
    },
  });
}

