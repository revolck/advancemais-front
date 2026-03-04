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

  const isAusente = pendingStatus === "AUSENTE";
  const isPresente = pendingStatus === "PRESENTE";
  const title = isPresente
    ? "Confirmar presença"
    : isAusente
      ? "Confirmar ausência"
      : !currentStatus
        ? "Confirmar frequência"
        : "Alterar frequência";

  const description = isPresente
    ? "Deseja confirmar a marcação de presença para este aluno?"
    : isAusente
      ? "Deseja confirmar a marcação de ausência? Informe o motivo obrigatoriamente."
      : isOverrideFlow
        ? "Você está alterando uma frequência já lançada. Deseja continuar?"
        : "Após confirmar, a frequência não poderá ser desfeita pelo instrutor.";

  const handleOpenChange = (open: boolean) => {
    if (isSaving) return;
    onOpenChange(open);
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      size="md"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription className="text-sm! mt-0! mb-0!">
            {description}
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {isAusente && (
            <SimpleTextarea
              label="Motivo da ausência"
              required
              value={pendingMotivo}
              onChange={(e) =>
                onChangeMotivo((e.target as HTMLTextAreaElement).value)
              }
              disabled={isSaving}
              maxLength={500}
              showCharCount
              size="lg"
              placeholder="Descreva o motivo da ausência (obrigatório)."
            />
          )}
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={confirmDisabled || isSaving}
            isLoading={isSaving}
          >
            Confirmar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
