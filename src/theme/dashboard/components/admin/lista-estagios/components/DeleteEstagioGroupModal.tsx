"use client";

import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";

interface DeleteEstagioGroupModalProps {
  isOpen: boolean;
  groupLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteEstagioGroupModal({
  isOpen,
  groupLabel,
  onCancel,
  onConfirm,
}: DeleteEstagioGroupModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      size="sm"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Remover grupo</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <p>
            {" "}
            Essa ação não pode ser desfeita. Você tem certeza que deseja{" "}
            <b>
              {groupLabel ? `Remover ${groupLabel}?` : "Remover este grupo?"}?
            </b>
          </p>
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full justify-end gap-2">
            <ButtonCustom variant="outline" onClick={onCancel}>
              Cancelar
            </ButtonCustom>
            <ButtonCustom variant="danger" onClick={onConfirm}>
              Sim, remover
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
