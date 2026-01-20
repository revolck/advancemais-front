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

export type SetPrincipalTarget = {
  id: string;
  titulo: string;
} | null;

type SetPrincipalConfirmModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  target: SetPrincipalTarget;
  currentPrincipal: SetPrincipalTarget;
  isBusy?: boolean;
  isSaving?: boolean;
  onConfirm: (id: string) => void;
};

export function SetPrincipalConfirmModal({
  isOpen,
  onOpenChange,
  target,
  currentPrincipal,
  isBusy = false,
  isSaving = false,
  onConfirm,
}: SetPrincipalConfirmModalProps) {
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
            Definir currículo principal?
          </ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-3">
          {target?.titulo ? (
            <>
              Você tem certeza que deseja definir{" "}
              <span className="font-medium">{target.titulo}</span> como
              currículo principal?
            </>
          ) : (
            "Você tem certeza que deseja definir este currículo como principal?"
          )}
          {currentPrincipal && currentPrincipal.id !== target?.id ? (
            <div className="mt-2 text-xs text-gray-600">
              Atual principal:{" "}
              <span className="font-medium">{currentPrincipal.titulo}</span>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="border-t border-gray-100 pt-6">
          <div className="flex w-full items-center justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={() => {
                if (!target?.id) return;
                onConfirm(target.id);
              }}
              disabled={isBusy || isSaving}
              isLoading={isSaving}
            >
              Sim, definir
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
