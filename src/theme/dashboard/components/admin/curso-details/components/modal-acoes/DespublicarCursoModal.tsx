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

interface DespublicarCursoModalProps {
  isOpen: boolean;
  isPublished: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DespublicarCursoModal({
  isOpen,
  isPublished,
  isLoading = false,
  onClose,
  onConfirm,
}: DespublicarCursoModalProps) {
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
          <ModalTitle>{isPublished ? "Despublicar" : "Publicar"}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm! text-gray-600!">
            {isPublished
              ? "Tem certeza que deseja despublicar? O item voltará para rascunho."
              : "Tem certeza que deseja publicar?"}
          </p>
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
            variant="primary"
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText={isPublished ? "Despublicando..." : "Publicando..."}
          >
            {isPublished ? "Confirmar despublicação" : "Confirmar publicação"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
