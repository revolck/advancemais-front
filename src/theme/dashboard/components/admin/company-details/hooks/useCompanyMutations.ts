"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminCompanyBan,
  revokeAdminCompanyUserBan,
  updateAdminCompany,
  updateAdminCompanyPlano,
  createAdminCompanyPlano,
} from "@/api/empresas";
import type {
  CreateAdminCompanyBanPayload,
  RevokeBanPayload,
  UpdateAdminCompanyPayload,
  UpdateAdminCompanyPlanoPayload,
  CreateAdminCompanyPlanoPayload,
} from "@/api/empresas/admin/types";
import { queryKeys } from "@/lib/react-query/queryKeys";

export function useCompanyMutations(companyId: string) {
  const queryClient = useQueryClient();

  const detailKey = queryKeys.empresas.detail(companyId);

  const invalidateCompany = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: detailKey });
  }, [detailKey, queryClient]);

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

  return {
    banCompany,
    revokeCompanyBan,
    updateCompanyProfile,
    updateCompanyPlan,
    createCompanyPlan,
  };
}
