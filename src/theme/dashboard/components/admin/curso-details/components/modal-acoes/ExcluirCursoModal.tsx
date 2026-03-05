"use client";

import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";
import { AlertTriangle } from "lucide-react";

interface ExcluirCursoModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExcluirCursoModal({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: ExcluirCursoModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
      size="md"
      backdrop="blur"
    >
      <ModalContentWrapper hideCloseButton={isLoading}>
        <ModalHeader>
          <ModalTitle>Excluir</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir este item?{" "}
              <span className="font-medium text-red-700">
                Esta ação é definitiva e não pode ser desfeita.
              </span>
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </ButtonCustom>

          <ButtonCustom
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Excluindo..."
          >
            Confirmar exclusão
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
