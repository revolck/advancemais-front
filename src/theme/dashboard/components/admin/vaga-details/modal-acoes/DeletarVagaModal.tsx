"use client";

import React from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalDescription,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { VagaDetail } from "@/api/vagas/admin/types";

interface DeletarVagaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vaga: VagaDetail | null;
  onConfirmDelete: (vaga: VagaDetail) => void;
  isDeleting?: boolean;
}

export function DeletarVagaModal({
  isOpen,
  onOpenChange,
  vaga,
  onConfirmDelete,
  isDeleting = false,
}: DeletarVagaModalProps) {
  const handleConfirmDelete = () => {
    if (vaga) {
      onConfirmDelete(vaga);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const customDeleteContent = (vaga: VagaDetail) => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-red-800 !leading-normal">
              Esta ação é irreversível e pode impactar todo o sistema!
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              <li>• Todos os dados relacionados serão perdidos</li>
              <li>• Candidaturas existentes serão removidas permanentemente</li>
              <li>• A operação não poderá ser desfeita</li>
              <li>• A vaga será removida permanentemente do sistema</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Tem certeza absoluta que deseja continuar com esta exclusão?
      </p>
    </div>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Confirmar Exclusão</ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            Você está prestes a excluir a vaga{" "}
            <span className="font-semibold text-gray-900">
              "{vaga?.titulo || "N/A"}"
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {vaga && customDeleteContent(vaga)}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="secondary"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Excluindo..."
              size="md"
            >
              Sim, excluir
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
