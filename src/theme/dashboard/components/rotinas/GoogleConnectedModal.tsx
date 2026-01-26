"use client";

import React from "react";
import {
  ButtonCustom,
  Icon,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface GoogleConnectedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleConnectedModal({
  isOpen,
  onClose,
}: GoogleConnectedModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled
      backdrop="blur"
      size="lg"
    >
      <ModalContentWrapper
        className="sm:max-w-xl"
        hideCloseButton
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name="CheckCircle2" size={18} />
            </div>
            <div className="min-w-0">
              <ModalTitle className="mb-0! pt-5!">Agenda conectada</ModalTitle>
              <ModalDescription className="text-sm!">
                Google Agenda/Meet está pronto para usar no sistema.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm text-gray-700">
            A partir de agora, sempre que o sistema precisar criar um evento:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 text-emerald-600" />
              <span>
                O evento será adicionado automaticamente ao seu Google Agenda.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="mt-0.5 text-emerald-600" />
              <span>
                Quando aplicável, o convite já sairá com link do Google Meet.
              </span>
            </li>
          </ul>
        </ModalBody>
        <ModalFooter className="mt-6">
          <ButtonCustom
            variant="primary"
            size="md"
            onClick={onClose}
            className="min-w-[120px]"
          >
            Ok, continuar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}









