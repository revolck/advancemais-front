"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toastCustom } from "@/components/ui/custom/toast";
import type { AdminCompanyPremiumRemovalVacancyStatus } from "@/api/empresas/admin/types";
import { useCompanyMutations } from "../../../hooks/useCompanyMutations";
import {
  DEFAULT_APPLY_REASON,
  DEFAULT_REMOVE_REASON,
  DEFAULT_REMOVE_STATUS,
} from "../constants";
import type { RecursosPremiumVagasModalProps } from "../types";

export function useRecursosPremiumVagasModal({
  isOpen,
  onOpenChange,
  company,
}: RecursosPremiumVagasModalProps) {
  const isActive = Boolean(company.recursosPremiumVagas?.ativo);
  const initialReason = useMemo(
    () => (isActive ? DEFAULT_REMOVE_REASON : DEFAULT_APPLY_REASON),
    [isActive],
  );

  const [motivo, setMotivo] = useState(initialReason);
  const [novoStatus, setNovoStatus] =
    useState<AdminCompanyPremiumRemovalVacancyStatus>(DEFAULT_REMOVE_STATUS);

  const { applyPremiumResources, removePremiumResources } = useCompanyMutations(
    company.id,
  );

  const isSubmitting =
    applyPremiumResources.status === "pending" ||
    removePremiumResources.status === "pending";

  useEffect(() => {
    if (!isOpen) return;

    setMotivo(initialReason);
    setNovoStatus(DEFAULT_REMOVE_STATUS);
  }, [initialReason, isOpen]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const handleStatusChange = useCallback((value: string | null) => {
    setNovoStatus(
      (value ||
        DEFAULT_REMOVE_STATUS) as AdminCompanyPremiumRemovalVacancyStatus,
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const trimmedReason = motivo.trim();
    if (!trimmedReason) {
      toastCustom.error({
        title: "Informe o motivo",
        description: "O motivo e obrigatorio para auditoria administrativa.",
      });
      return;
    }

    try {
      if (isActive) {
        const response = await removePremiumResources.mutateAsync({
          motivo: trimmedReason,
          novoStatusVagasPublicadas: novoStatus,
        });

        if ("success" in response && response.success === false) {
          throw new Error(response.message);
        }

        const efeitos = "efeitos" in response ? response.efeitos : undefined;
        toastCustom.success({
          title: "Recursos premium removidos",
          description: efeitos
            ? `${efeitos.vagasPublicadasAlteradas} vaga(s) retirada(s) do ar e ${efeitos.destaquesRemovidos} destaque(s) removido(s).`
            : "Os privilegios premium foram removidos da empresa.",
        });
      } else {
        const response = await applyPremiumResources.mutateAsync({
          motivo: trimmedReason,
        });

        if ("success" in response && response.success === false) {
          throw new Error(response.message);
        }

        toastCustom.success({
          title: "Recursos premium aplicados",
          description:
            "A empresa agora possui vagas e destaques ilimitados sem depender de plano ativo.",
        });
      }

      handleClose();
    } catch (error) {
      console.error("Erro ao gerenciar recursos premium da empresa", error);
      toastCustom.error({
        title: isActive
          ? "Erro ao remover recursos premium"
          : "Erro ao aplicar recursos premium",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel concluir a operacao. Tente novamente.",
      });
    }
  }, [
    applyPremiumResources,
    handleClose,
    isActive,
    isSubmitting,
    motivo,
    novoStatus,
    removePremiumResources,
  ]);

  return {
    isActive,
    motivo,
    novoStatus,
    isSubmitting,
    handleClose,
    handleMotivoChange: setMotivo,
    handleStatusChange,
    handleSubmit,
  };
}
