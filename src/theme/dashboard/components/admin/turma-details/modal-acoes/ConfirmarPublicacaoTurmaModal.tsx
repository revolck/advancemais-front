"use client";

import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ButtonCustom,
} from "@/components/ui/custom";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
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
              {isPublished ? "Colocar turma em rascunho?" : "Publicar turma?"}
            </ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm! text-gray-700 leading-relaxed mt-0!">
              {isPublished
                ? "Ao colocar esta turma em rascunho, ela deixará de aparecer no site e não estará mais visível para os usuários."
                : "Ao publicar esta turma, ela ficará visível no site e poderá receber inscrições de usuários."}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs! text-amber-800 font-medium mb-0!">
                  {isPublished
                    ? "Esta ação não afetará as inscrições já realizadas."
                    : "Certifique-se de que a turma está configurada corretamente antes de publicar."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
                    ? "Sim, colocar em rascunho"
                    : "Sim, publicar turma"}
                </>
              )}
            </ButtonCustom>
          </div>
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
