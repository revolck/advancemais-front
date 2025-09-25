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
import { Icon } from "@/components/ui/custom/Icons";
import type { PlanoEmpresarialBackendResponse } from "@/api/empresas/planos-empresariais/types";

interface DeletePlanoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plano: PlanoEmpresarialBackendResponse | null;
  onConfirmDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function DeletePlanoModal({
  isOpen,
  onOpenChange,
  plano,
  onConfirmDelete,
  isDeleting = false,
}: DeletePlanoModalProps) {
  const handleConfirmDelete = () => {
    if (plano) {
      onConfirmDelete(plano.id);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

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
            Você está prestes a excluir o plano empresarial{" "}
            <strong className="text-foreground">"{plano?.nome}"</strong>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium !text-red-800 !leading-normal">
                    Esta ação é irreversível e pode impactar todo o sistema!
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 ml-3">
                    <li>
                      • Empresas com assinatura ativa neste plano serão afetadas
                    </li>
                    <li>
                      • Todas as configurações e dados relacionados serão
                      perdidos
                    </li>
                    <li>• O plano será removido permanentemente do sistema</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="!text-base text-gray-600 !leading-normal !mb-0">
              Tem certeza absoluta que deseja continuar com esta exclusão?
            </p>
          </div>
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="ghost"
              onClick={handleCancel}
              disabled={isDeleting}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Excluindo..."
              size="md"
            >
              <span className="inline-flex items-center gap-2">
                Sim, excluir plano
              </span>
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
