// src/theme/website/components/checkout/components/ExpirationWarningModal.tsx

"use client";

import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
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

interface ExpirationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number;
}

export const ExpirationWarningModal: React.FC<ExpirationWarningModalProps> = ({
  isOpen,
  onClose,
  timeLeft,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContentWrapper hideCloseButton>
        <ModalHeader className="items-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <ModalTitle className="text-center">
            Sua sessão está expirando!
          </ModalTitle>
          <ModalDescription className="text-center">
            Você tem menos de{" "}
            <strong className="text-amber-600">1 minuto</strong> para concluir
            o pagamento. Caso não finalize, o checkout será encerrado
            automaticamente e seus dados não serão salvos por questões de
            segurança.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-lg font-mono font-bold text-amber-600">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        </ModalBody>

        <ModalFooter className="justify-center">
          <ButtonCustom
            variant="primary"
            size="lg"
            onClick={onClose}
            fullWidth
          >
            Entendi, vou finalizar agora
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};

