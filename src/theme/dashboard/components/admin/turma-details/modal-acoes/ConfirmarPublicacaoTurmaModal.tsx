"use client";

import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ButtonCustom,
} from "@/components/ui/custom";
import { AlertCircle } from "lucide-react";
import type { ConfirmarPublicacaoTurmaModalProps } from "../types";

/**
 * Modal do domínio turma-details: confirmação para publicar ou despublicar turma.
 * Contrato: apenas props definidas em types.ts; sem lógica de API.
 */
export function ConfirmarPublicacaoTurmaModal({
  isOpen,
  onOpenChange,
  isPublished,
  onConfirm,
  isPending,
}: ConfirmarPublicacaoTurmaModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      isDismissable={!isPending}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <ModalTitle className="mb-0!">
              {isPublished ? "Despublicar turma" : "Publicar turma"}
            </ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm! text-gray-700 leading-relaxed mt-0!">
              {isPublished
                ? "A turma voltará para rascunho e sairá do fluxo público."
                : "A turma ficará visível no site e poderá receber inscrições."}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs! text-amber-800 font-medium mb-0!">
                  {isPublished
                    ? "Bloqueado para turmas em andamento ou com inscritos ativos."
                    : "Só publique depois de concluir os pré-requisitos obrigatórios."}
                </p>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="gap-2">
          <ButtonCustom
            onClick={() => onOpenChange(false)}
            variant="outline"
            withAnimation={false}
            disabled={isPending}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            onClick={onConfirm}
            variant="default"
            withAnimation={false}
            disabled={isPending}
          >
            {isPending ? (
              <>{isPublished ? "Despublicando..." : "Publicando..."}</>
            ) : (
              <>
                {isPublished
                  ? "Confirmar despublicação"
                  : "Confirmar publicação"}
              </>
            )}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
