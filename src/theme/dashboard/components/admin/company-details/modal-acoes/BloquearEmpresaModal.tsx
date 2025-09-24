"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { toastCustom } from "@/components/ui/custom/toast";
import { createAdminCompanyBan } from "@/api/empresas";
import type {
  AdminCompanyBanItem,
  BanType,
  BanReason,
} from "@/api/empresas/admin/types";
import { AlertTriangle, Shield, Clock, FileText } from "lucide-react";

const BAN_TYPE_OPTIONS = [
  { label: "Temporário", value: "TEMPORARIO" },
  { label: "Permanente", value: "PERMANENTE" },
  { label: "Restrição de recurso", value: "RESTRICAO_DE_RECURSO" },
];

const BAN_REASON_OPTIONS = [
  { label: "Spam", value: "SPAM" },
  { label: "Violação de políticas", value: "VIOLACAO_POLITICAS" },
  { label: "Fraude", value: "FRAUDE" },
  { label: "Abuso de recursos", value: "ABUSO_DE_RECURSOS" },
  { label: "Outros", value: "OUTROS" },
];

const BAN_DURATION_OPTIONS = [
  { label: "7 dias", value: "7" },
  { label: "15 dias", value: "15" },
  { label: "30 dias", value: "30" },
  { label: "60 dias", value: "60" },
  { label: "120 dias", value: "120" },
  { label: "Banimento permanente", value: "0" },
];

interface BloquearEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onBanApplied: (ban: AdminCompanyBanItem) => void;
}

export function BloquearEmpresaModal({
  isOpen,
  onOpenChange,
  companyId,
  onBanApplied,
}: BloquearEmpresaModalProps) {
  const initialState = useMemo(
    () => ({
      tipo: "TEMPORARIO",
      motivo: "VIOLACAO_POLITICAS",
      dias: "30",
      observacoes: "",
    }),
    []
  );

  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setState(initialState);
      setIsSubmitting(false);
    }
  }, [initialState, isOpen]);

  const handleTypeChange = useCallback((value: string | null) => {
    setState((prev) => ({
      ...prev,
      tipo: value || "TEMPORARIO",
    }));
  }, []);

  const handleReasonChange = useCallback((value: string | null) => {
    setState((prev) => ({
      ...prev,
      motivo: value || "VIOLACAO_POLITICAS",
    }));
  }, []);

  const handleDaysChange = useCallback((value: string | null) => {
    setState((prev) => ({
      ...prev,
      dias: value || "30",
    }));
  }, []);

  const handleObservationsChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value.slice(0, 250);
      setState((prev) => ({ ...prev, observacoes: nextValue }));
    },
    []
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const trimmedObservations = state.observacoes.trim();
    if (!trimmedObservations) {
      toastCustom.error({
        title: "Informe as observações",
        description:
          "Descreva as observações do banimento (máximo 250 caracteres).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAdminCompanyBan(companyId, {
        tipo: state.tipo as BanType,
        motivo: state.motivo as BanReason,
        dias: Number(state.dias),
        observacoes: trimmedObservations,
      });

      if ("banimento" in response) {
        onBanApplied(response.banimento);
      }

      toastCustom.success({
        title: "Banimento aplicado",
        description: "A empresa foi banida e o período selecionado está ativo.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao banir empresa", error);
      toastCustom.error({
        title: "Erro ao aplicar banimento",
        description:
          "Não foi possível banir a empresa agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    companyId,
    handleClose,
    isSubmitting,
    onBanApplied,
    state.tipo,
    state.motivo,
    state.dias,
    state.observacoes,
  ]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Bloquear acesso</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-8 p-1">
          {/* Tipo e Motivo */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <SelectCustom
                mode="single"
                label="Tipo de banimento"
                required
                options={BAN_TYPE_OPTIONS}
                value={state.tipo}
                onChange={handleTypeChange}
                placeholder="Selecione o tipo"
                disabled={isSubmitting}
                size="sm"
                fullWidth
              />
            </div>

            <div className="space-y-3">
              <SelectCustom
                mode="single"
                label="Motivo"
                required
                options={BAN_REASON_OPTIONS}
                value={state.motivo}
                onChange={handleReasonChange}
                placeholder="Selecione o motivo"
                disabled={isSubmitting}
                size="sm"
                fullWidth
              />
            </div>
          </div>

          {/* Duração */}
          <div className="space-y-3">
            <SelectCustom
              mode="single"
              label="Duração do banimento"
              required
              options={BAN_DURATION_OPTIONS}
              value={state.dias}
              onChange={handleDaysChange}
              placeholder="Selecione a duração"
              disabled={isSubmitting}
              size="sm"
              fullWidth
            />
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <SimpleTextarea
              label="Observações detalhadas"
              required
              value={state.observacoes}
              maxLength={250}
              showCharCount
              onChange={handleObservationsChange}
              disabled={isSubmitting}
              placeholder="Descreva detalhadamente as observações que justificam o banimento da empresa..."
              className="min-h-[120px] resize-none"
            />
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 bg-gray-50/50 px-6 py-4">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Aplicando banimento..."
              size="md"
            >
              Bloquear
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
