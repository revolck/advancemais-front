"use client";

import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { TurmaProva } from "@/api/cursos";

interface DeleteAvaliacaoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacao: TurmaProva | null;
  onConfirmDelete: (avaliacao: TurmaProva) => void;
  isDeleting?: boolean;
  blockedReason?: string;
}

export function DeleteAvaliacaoModal({
  isOpen,
  onOpenChange,
  avaliacao,
  onConfirmDelete,
  isDeleting = false,
  blockedReason,
}: DeleteAvaliacaoModalProps) {
  const canDelete = !blockedReason;

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper hideCloseButton={isDeleting}>
        <ModalHeader>
          <ModalTitle>Excluir</ModalTitle>
        </ModalHeader>

        <ModalBody>
          {!avaliacao ? (
            <p className="text-sm text-gray-600">
              Avaliação não encontrada.
            </p>
          ) : blockedReason ? (
            <p className="text-sm text-gray-600">{blockedReason}</p>
          ) : (
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir esta avaliação?{" "}
              <span className="font-medium text-red-700">
                Esta ação é definitiva e não pode ser desfeita.
              </span>
            </p>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          {avaliacao && canDelete ? (
            <ButtonCustom
              variant="danger"
              onClick={() => onConfirmDelete(avaliacao)}
              isLoading={isDeleting}
              loadingText="Excluindo..."
              size="md"
            >
              Confirmar exclusão
            </ButtonCustom>
          ) : null}
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

