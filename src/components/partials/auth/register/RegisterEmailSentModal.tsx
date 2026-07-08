"use client";

import React from "react";

import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";

interface RegisterEmailSentModalProps {
  email: string;
  isOpen: boolean;
  onConfirm: () => void;
}

export function RegisterEmailSentModal({
  email,
  isOpen,
  onConfirm,
}: RegisterEmailSentModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={() => undefined}
      size="md"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContentWrapper hideCloseButton>
        <ModalHeader className="space-y-3 text-left">
          <ModalTitle className="mb-1!">Confirme seu e-mail</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4 pt-0 mb-0!">
          <p className="!text-sm !leading-6 text-slate-600">
            Sua conta foi criada com sucesso. Para ativar o acesso à plataforma,
            confirme seu cadastro pelo link enviado para{" "}
            <span className="font-medium">{email}</span>.
          </p>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="w-full"
          >
            Eu entendi
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

export default RegisterEmailSentModal;
