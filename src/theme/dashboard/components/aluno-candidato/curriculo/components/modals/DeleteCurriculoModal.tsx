"use client";

import React from "react";
import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

export type DeleteCurriculoTarget = {
  id: string;
  titulo: string;
  principal?: boolean;
} | null;

type DeleteCurriculoModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  target: DeleteCurriculoTarget;
  isBusy?: boolean;
  isDeleting?: boolean;
  onConfirmDelete: (id: string) => void;
};

export function DeleteCurriculoModal({
  isOpen,
  onOpenChange,
  target,
  isBusy = false,
  isDeleting = false,
  onConfirmDelete,
}: DeleteCurriculoModalProps) {
  const isPrincipal = Boolean(target?.principal);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="pb-4">
          <ModalTitle className="mb-0!">
            {isPrincipal
              ? "Não é possível remover o currículo principal"
              : "Remover currículo?"}
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-3">
          {isPrincipal ? (
            <>
              Defina outro currículo como principal (ícone de estrela) para
              poder remover este currículo.
            </>
          ) : (
            <>
              Tem certeza que deseja remover{" "}
              <span className="font-medium">
                {target?.titulo || "este currículo"}
              </span>
              ? Esta ação não pode ser desfeita.
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 pt-6">
          <div className="flex w-full items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              {isPrincipal ? "Fechar" : "Cancelar"}
            </ButtonCustom>

            {!isPrincipal ? (
              <ButtonCustom
                variant="danger"
                onClick={() => {
                  if (!target?.id) return;
                  onConfirmDelete(target.id);
                }}
                disabled={isBusy || isDeleting}
                isLoading={isDeleting}
              >
                Remover
              </ButtonCustom>
            ) : null}
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
