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

interface DesbloquearAlunoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alunoNome: string;
  onConfirm: (observacoes?: string) => Promise<void>;
}

export function DesbloquearAlunoModal({
  isOpen,
  onOpenChange,
  alunoNome,
  onConfirm,
}: DesbloquearAlunoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDesbloquear = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao desbloquear aluno", error);
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
          <ModalTitle>Desbloquear aluno</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p>
            Deseja desbloquear o aluno{" "}
            <strong className="text-[var(--secondary-color)]">{alunoNome}</strong>
            ? O aluno terá acesso completo ao sistema novamente.
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
              Sim, desbloquear aluno
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
