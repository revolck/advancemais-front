"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminCompanyBan,
  revokeAdminCompanyUserBan,
  updateAdminCompany,
  updateAdminCompanyPlano,
  createAdminCompanyPlano,
  applyAdminCompanyPremiumResources,
  removeAdminCompanyPremiumResources,
} from "@/api/empresas";
import type {
  AdminCompanyConsolidatedResponse,
  AdminCompanyPremiumResourcesApiResponse,
  AdminCompanyPremiumResourcesResponse,
  ApplyAdminCompanyPremiumResourcesPayload,
  CreateAdminCompanyBanPayload,
  RemoveAdminCompanyPremiumResourcesPayload,
  RevokeBanPayload,
  UpdateAdminCompanyPayload,
  UpdateAdminCompanyPlanoPayload,
  CreateAdminCompanyPlanoPayload,
} from "@/api/empresas/admin/types";
import { queryKeys } from "@/lib/react-query/queryKeys";

function isPremiumResourcesResponse(
  response: AdminCompanyPremiumResourcesApiResponse,
): response is AdminCompanyPremiumResourcesResponse {
  return "success" in response && response.success === true;
}

export function useCompanyMutations(companyId: string) {
  const queryClient = useQueryClient();

  const detailKey = queryKeys.empresas.detail(companyId);

  const invalidateCompany = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: detailKey });
  }, [detailKey, queryClient]);

  const patchPremiumResourcesCache = useCallback(
    (response: AdminCompanyPremiumResourcesApiResponse) => {
      if (!isPremiumResourcesResponse(response)) return;

      queryClient.setQueryData<AdminCompanyConsolidatedResponse>(
        detailKey,
        (current) => {
          if (!current) return current;

          const efeitos = response.efeitos;
          const nextEmpresa = {
            ...current.empresa,
            recursosPremiumVagas: response.empresa.recursosPremiumVagas,
          };

          if (!efeitos) {
            return {
              ...current,
              empresa: nextEmpresa,
            };
          }

          const changedCount = efeitos.vagasPublicadasAlteradas;
          const targetStatus = efeitos.novoStatusVagasPublicadas;
          const nextPorStatus = { ...current.vagas.porStatus };

          nextPorStatus.PUBLICADO = Math.max(
            Number(nextPorStatus.PUBLICADO ?? 0) - changedCount,
            0,
          );
          nextPorStatus[targetStatus] =
            Number(nextPorStatus[targetStatus] ?? 0) + changedCount;

          return {
            ...current,
            empresa: nextEmpresa,
            vagas: {
              ...current.vagas,
              porStatus: nextPorStatus,
              recentes: current.vagas.recentes.map((vaga) =>
                vaga.status === "PUBLICADO"
                  ? {
                      ...vaga,
                      status: targetStatus,
                    }
                  : vaga,
              ),
            },
          };
        },
      );
    },
    [detailKey, queryClient],
  );

  const refreshCompanyAndLists = useCallback(
    async (response?: AdminCompanyPremiumResourcesApiResponse) => {
      const results = await Promise.allSettled([
        queryClient.refetchQueries({ queryKey: detailKey, type: "active" }),
        queryClient.invalidateQueries({ queryKey: ["admin-empresas-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-company-list"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-companies"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-vagas-list"] }),
      ]);

      const hasError = results.some((result) => result.status === "rejected");
      if (hasError) {
        console.warn(
          "Nao foi possivel revalidar todos os dados da empresa apos recursos premium.",
          results,
        );
      }

      if (response) {
        patchPremiumResourcesCache(response);
      }
    },
    [detailKey, patchPremiumResourcesCache, queryClient],
  );

  const banCompany = useMutation({
    mutationFn: (payload: CreateAdminCompanyBanPayload) =>
      createAdminCompanyBan(companyId, payload),
    onSuccess: async () => {
      await invalidateCompany();
    },
  });

  const revokeCompanyBan = useMutation({
    mutationFn: (payload: RevokeBanPayload) =>
      revokeAdminCompanyUserBan(companyId, payload),
    onSuccess: async () => {
      await invalidateCompany();
    },
  });

  const updateCompanyProfile = useMutation({
    mutationFn: (payload: UpdateAdminCompanyPayload) =>
      updateAdminCompany(companyId, payload),
    onSuccess: async () => {
      await invalidateCompany();
    },
  });

  const updateCompanyPlan = useMutation({
    mutationFn: (payload: UpdateAdminCompanyPlanoPayload) =>
      updateAdminCompanyPlano(companyId, payload),
    onSuccess: async () => {
      await invalidateCompany();
    },
  });

  const createCompanyPlan = useMutation({
    mutationFn: (payload: CreateAdminCompanyPlanoPayload) =>
      createAdminCompanyPlano(companyId, payload),
    onSuccess: async () => {
      await invalidateCompany();
    },
  });

  const applyPremiumResources = useMutation({
    mutationFn: (payload: ApplyAdminCompanyPremiumResourcesPayload) =>
      applyAdminCompanyPremiumResources(companyId, payload),
    onSuccess: (response) => {
      patchPremiumResourcesCache(response);
      void refreshCompanyAndLists(response);
    },
  });

  const removePremiumResources = useMutation({
    mutationFn: (payload: RemoveAdminCompanyPremiumResourcesPayload) =>
      removeAdminCompanyPremiumResources(companyId, payload),
    onSuccess: (response) => {
      patchPremiumResourcesCache(response);
      void refreshCompanyAndLists(response);
    },
  });

  return {
    banCompany,
    revokeCompanyBan,
    updateCompanyProfile,
    updateCompanyPlan,
    createCompanyPlan,
    applyPremiumResources,
    removePremiumResources,
  };
}
