"use client";

import { useState } from "react";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";

interface DesbloquearCandidatoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidatoNome: string;
  onConfirm: (observacoes?: string) => Promise<void>;
}

export function DesbloquearCandidatoModal({
  isOpen,
  onOpenChange,
  candidatoNome,
  onConfirm,
}: DesbloquearCandidatoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDesbloquear = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao desbloquear candidato", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) onOpenChange(false);
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Desbloquear candidato</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p>
            Deseja desbloquear o candidato{" "}
            <strong className="text-[var(--secondary-color)]">{candidatoNome}</strong>
            ? O candidato terá acesso completo ao sistema novamente.
          </p>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              size="md"
              onClick={handleDesbloquear}
              isLoading={isLoading}
              loadingText="Desbloqueando..."
              disabled={isLoading}
            >
              Sim, desbloquear candidato
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
