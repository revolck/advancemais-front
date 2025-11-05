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

interface DesbloquearUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioNome: string;
  onConfirm: (observacoes?: string) => Promise<void>;
}

export function DesbloquearUsuarioModal({
  isOpen,
  onOpenChange,
  usuarioNome,
  onConfirm,
}: DesbloquearUsuarioModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDesbloquear = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao desbloquear usuario", error);
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
          <ModalTitle>Desbloquear usuario</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p>
            Deseja desbloquear o usuario{" "}
            <strong className="text-[var(--secondary-color)]">
              {usuarioNome}
            </strong>
            ? O usuario terá acesso completo ao sistema novamente.
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
              Sim, desbloquear usuario
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
