"use client";

import React from "react";
import {
  ButtonCustom,
  Icon,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface PlanoGratuitoExpiradoModalProps {
  isOpen: boolean;
  /** true = mês grátis da inauguração; false = período de teste comum */
  inauguracao: boolean;
  onVerPlanos: () => void;
  onClose: () => void;
}

export function PlanoGratuitoExpiradoModal({
  isOpen,
  inauguracao,
  onVerPlanos,
  onClose,
}: PlanoGratuitoExpiradoModalProps) {
  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} backdrop="blur" size="lg">
      <ModalContentWrapper className="sm:max-w-xl">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Icon name="Hourglass" size={18} />
            </div>
            <ModalTitle className="mb-0! pt-5!">
              {inauguracao
                ? "Seu mês grátis chegou ao fim"
                : "Seu período gratuito chegou ao fim"}
            </ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm text-gray-700">
            Esperamos que a nova Advance+ tenha ajudado a sua empresa a encontrar
            ótimos talentos!
          </p>
          <p className="text-sm text-gray-700">
            Suas vagas foram salvas como <strong>rascunho</strong>, então nada foi
            perdido. Escolha um plano para republicá-las e continuar recebendo
            candidatos.
          </p>
        </ModalBody>
        <ModalFooter className="mt-6">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonCustom variant="outline" size="md" onClick={onClose}>
              Agora não
            </ButtonCustom>
            <ButtonCustom variant="primary" size="md" onClick={onVerPlanos}>
              Ver planos
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
