"use client";

import { useEffect, useState } from "react";

import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface AddPopupLeadInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (label: string) => Promise<void> | void;
}

export function AddPopupLeadInterestModal({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}: AddPopupLeadInterestModalProps) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLabel("");
  }, [isOpen]);

  const normalizedLabel = label.trim();

  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Adicionar interesse</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-5 p-1">
          <InputCustom
            label="Descrição do interesse"
            value={label}
            placeholder="Ex.: Newsletter, graduação, recolocação"
            maxLength={120}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && normalizedLabel) {
                event.preventDefault();
                onSubmit(normalizedLabel);
              }
            }}
          />
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            withAnimation={false}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={() => onSubmit(normalizedLabel)}
            disabled={!normalizedLabel}
            isLoading={isSubmitting}
            withAnimation={false}
          >
            Adicionar interesse
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
