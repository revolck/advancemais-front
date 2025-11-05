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

interface DespublicarVagaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vaga: VagaDetail | null;
  onConfirmUnpublish: (vaga: VagaDetail) => void;
  isUnpublishing?: boolean;
}

export function DespublicarVagaModal({
  isOpen,
  onOpenChange,
  vaga,
  onConfirmUnpublish,
  isUnpublishing = false,
}: DespublicarVagaModalProps) {
  const handleConfirmUnpublish = () => {
    if (vaga) {
      onConfirmUnpublish(vaga);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const customUnpublishContent = (vaga: VagaDetail) => (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium !text-amber-800 !leading-normal">
              Ao despublicar esta vaga:
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-3">
              <li>• A vaga não será mais visível para candidatos</li>
              <li>• Candidatos existentes não poderão mais se candidatar</li>
              <li>• A vaga ainda poderá ser republicada posteriormente</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="!text-base text-gray-600 !leading-normal !mb-0">
        Tem certeza que deseja despublicar esta vaga?
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
          <ModalTitle>Confirmar Despublicação</ModalTitle>
          <ModalDescription className="!mb-0 !leading-normal">
            Você está prestes a despublicar a vaga{" "}
            <span className="font-semibold text-gray-900">
              "{vaga?.titulo || "N/A"}"
            </span>
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          {vaga && customUnpublishContent(vaga)}
        </ModalBody>

        <ModalFooter className="px-1 py-2">
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleCancel}
              disabled={isUnpublishing}
              size="md"
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="secondary"
              onClick={handleConfirmUnpublish}
              isLoading={isUnpublishing}
              loadingText="Despublicando..."
              size="md"
            >
              Sim, despublicar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
