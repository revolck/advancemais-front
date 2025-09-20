"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminCompanyBan } from "@/api/empresas";
import type { AdminCompanyBanInfo } from "@/api/empresas/admin/types";

const BAN_OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
  { label: "60 dias", value: 60 },
  { label: "120 dias", value: 120 },
  { label: "Banimento permanente", value: 0 },
] as const;

interface BanirEmpresaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onBanApplied: (ban: AdminCompanyBanInfo) => void;
}

export function BanirEmpresaModal({
  isOpen,
  onOpenChange,
  companyId,
  onBanApplied,
}: BanirEmpresaModalProps) {
  const initialState = useMemo(
    () => ({ dias: 7, motivo: "" }),
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

  const handleDaysChange = useCallback((value: string) => {
    const parsed = Number(value);
    setState((prev) => ({ ...prev, dias: Number.isNaN(parsed) ? prev.dias : parsed }));
  }, []);

  const handleReasonChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value.slice(0, 250);
    setState((prev) => ({ ...prev, motivo: nextValue }));
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const trimmedReason = state.motivo.trim();
    if (!trimmedReason) {
      toastCustom.error({
        title: "Informe o motivo",
        description: "Descreva o motivo do banimento (máximo 250 caracteres).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAdminCompanyBan(companyId, {
        dias: state.dias,
        motivo: trimmedReason,
      });

      onBanApplied(response.banimento);

      toastCustom.success({
        title: "Banimento aplicado",
        description: "A empresa foi banida e o período selecionado está ativo.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao banir empresa", error);
      toastCustom.error({
        title: "Erro ao aplicar banimento",
        description: "Não foi possível banir a empresa agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    companyId,
    handleClose,
    isSubmitting,
    onBanApplied,
    state.dias,
    state.motivo,
    toastCustom,
    createAdminCompanyBan,
  ]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Banir empresa</ModalTitle>
          <ModalDescription>
            Defina a duração do banimento e registre um motivo para manter o histórico organizado.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Duração do banimento</label>
            <Select
              value={String(state.dias)}
              onValueChange={handleDaysChange}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {BAN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SimpleTextarea
            label="Motivo"
            value={state.motivo}
            maxLength={250}
            showCharCount
            onChange={handleReasonChange}
            disabled={isSubmitting}
            placeholder="Descreva rapidamente o motivo do banimento"
            className="min-h-[140px]"
          />
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="danger"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Aplicando..."
          >
            Banir empresa
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
