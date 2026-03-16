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
import { AlertCircle } from "lucide-react";
import type { ExcluirTurmaModalProps } from "../types";

export function ExcluirTurmaModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
}: ExcluirTurmaModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) onOpenChange(false);
      }}
      size="md"
      backdrop="blur"
      isDismissable={!isPending}
    >
      <ModalContentWrapper hideCloseButton={isPending}>
        <ModalHeader>
          <ModalTitle>Excluir turma</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed mt-0!">
            A turma será removida do fluxo ativo e deixará de aparecer nas
            listagens padrão.
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="mb-0! text-xs! font-medium text-amber-800">
                Bloqueado para turmas já iniciadas ou com inscritos ativos.
              </p>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </ButtonCustom>

          <ButtonCustom
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={isPending}
            isLoading={isPending}
            loadingText="Excluindo..."
          >
            Confirmar exclusão
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
