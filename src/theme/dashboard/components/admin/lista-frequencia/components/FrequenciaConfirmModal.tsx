"use client";

import React from "react";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import type { FrequenciaStatus } from "../hooks/useFrequenciaDashboardQuery";
import { SimpleTextarea } from "@/components/ui/custom/text-area";

export function FrequenciaConfirmModal(props: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: FrequenciaStatus;
  pendingStatus: FrequenciaStatus | null;
  isOverrideFlow: boolean;
  pendingMotivo: string;
  onChangeMotivo: (value: string) => void;
  confirmDisabled: boolean;
  isSaving?: boolean;
  onConfirm: () => void;
}) {
  const {
    isOpen,
    onOpenChange,
    currentStatus,
    pendingStatus,
    isOverrideFlow,
    pendingMotivo,
    onChangeMotivo,
    confirmDisabled,
    isSaving = false,
    onConfirm,
  } = props;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>
            {!currentStatus
              ? "Confirmar frequência"
              : "Alterar frequência"}
          </ModalTitle>
          <ModalDescription className="text-sm! mt-0! mb-0!">
            {isOverrideFlow
              ? "Você está alterando uma frequência já lançada. Deseja continuar?"
              : "Após confirmar, a frequência não poderá ser desfeita pelo instrutor."}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {pendingStatus === "AUSENTE" && (
            <SimpleTextarea
              label="Motivo da ausência"
              required
              value={pendingMotivo}
              onChange={(e) =>
                onChangeMotivo((e.target as HTMLTextAreaElement).value)
              }
              maxLength={250}
              showCharCount
              size="lg"
            />
          )}
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={confirmDisabled}
            isLoading={isSaving}
          >
            Confirmar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
