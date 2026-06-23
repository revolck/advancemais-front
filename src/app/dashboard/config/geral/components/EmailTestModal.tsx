"use client";

import React from "react";

import { ButtonCustom, InputCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";

interface EmailTestModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  recipient: string;
  onRecipientChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function EmailTestModal({
  isOpen,
  isLoading = false,
  recipient,
  onRecipientChange,
  onClose,
  onSubmit,
}: EmailTestModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      onClose={onClose}
      size="md"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader className="space-y-2">
          <ModalTitle>Testar envio de e-mail</ModalTitle>
        </ModalHeader>

        <ModalBody className="pt-1">
          <InputCustom
            label="E-mail de destino"
            type="email"
            value={recipient}
            onChange={(event) => onRecipientChange(event.target.value)}
            placeholder="nome@empresa.com"
            required
            className="bg-white"
          />
        </ModalBody>

        <ModalFooter className="pt-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="button"
              variant="primary"
              onClick={onSubmit}
              isLoading={isLoading}
              loadingText="Enviando..."
            >
              Enviar teste
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

export default EmailTestModal;
