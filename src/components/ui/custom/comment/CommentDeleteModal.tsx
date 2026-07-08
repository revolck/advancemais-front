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

interface CommentDeleteModalProps {
  isOpen: boolean;
  content?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CommentDeleteModal({
  isOpen,
  content,
  isDeleting = false,
  onClose,
  onConfirm,
}: CommentDeleteModalProps) {
  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Excluir nota</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <p className="!mb-0 !text-sm leading-6 text-slate-600">
            Esta anotação será excluída do histórico deste contato. Deseja
            continuar?{" "}
            <span className="font-medium text-slate-900">"{content}"</span>
          </p>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <ButtonCustom
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
            loadingText="Excluindo..."
          >
            Excluir nota
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
