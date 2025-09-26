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
import { InputCustom } from "@/components/ui/custom/input";
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
];

const BAN_REASON_OPTIONS = [
  { label: "Spam", value: "SPAM" },
  { label: "Violação de políticas", value: "VIOLACAO_POLITICAS" },
  { label: "Fraude", value: "FRAUDE" },
  { label: "Abuso de recursos", value: "ABUSO_DE_RECURSOS" },
  { label: "Outros", value: "OUTROS" },
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

  const handleDaysKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir apenas teclas de números (0-9)
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];

      if (allowedKeys.includes(event.key)) {
        return; // Permitir teclas de controle
      }

      // Bloquear tudo que não for dígito (0-9)
      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        return;
      }

      // Se já tem 4 dígitos, bloquear mais digitação
      if (state.dias.length >= 4) {
        event.preventDefault();
        return;
      }
    },
    [state.dias.length]
  );

  const handleDaysChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      // Se o campo estiver vazio, permitir
      if (!value) {
        setState((prev) => ({
          ...prev,
          dias: "",
        }));
        return;
      }

      // Garantir que só tem números e máximo 4 caracteres
      const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);

      // Se for 0, não permitir
      if (numericValue === "0") {
        setState((prev) => ({
          ...prev,
          dias: "",
        }));
        return;
      }

      // Se não há valor após filtrar, limpar o campo
      if (!numericValue) {
        setState((prev) => ({
          ...prev,
          dias: "",
        }));
        return;
      }

      // Converter para número e verificar se é válido (1-9999)
      const numValue = parseInt(numericValue, 10);

      // Se for um número válido entre 1 e 9999, usar o valor
      if (numValue >= 1 && numValue <= 9999) {
        setState((prev) => ({
          ...prev,
          dias: numericValue,
        }));
      } else if (numericValue.length === 4 && numValue > 9999) {
        // Se tiver 4 dígitos e for maior que 9999, limitar a 9999
        setState((prev) => ({
          ...prev,
          dias: "9999",
        }));
      } else {
        // Para outros casos (digitação em progresso), manter apenas os números
        setState((prev) => ({
          ...prev,
          dias: numericValue,
        }));
      }
    },
    []
  );

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
        title: "Bloqueio aplicado",
        description: "Esta empresa teve o acesso bloqueado e o período selecionado está ativo.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao banir empresa", error);
      toastCustom.error({
        title: "Erro ao aplicar bloqueio",
        description:
          "Não foi possível bloquear a empresa agora. Tente novamente em instantes.",
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
                label="Tipo"
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

          {/* Duração - apenas para tipo temporário */}
          {state.tipo === "TEMPORARIO" && (
            <div className="space-y-3">
              <InputCustom
                type="text"
                label="Duração (dias)"
                required
                value={state.dias}
                onChange={handleDaysChange}
                onKeyDown={handleDaysKeyDown}
                placeholder="Digite a quantidade de dias (1-9999)"
                disabled={isSubmitting}
                size="sm"
                fullWidth
                maxLength={4}
              />
            </div>
          )}

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
              placeholder="Descreva detalhadamente as observações que justificam o bloqueio de acesso da empresa..."
              className="min-h-[120px] resize-none"
            />
          </div>
        </ModalBody>

        <ModalFooter className="py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
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
