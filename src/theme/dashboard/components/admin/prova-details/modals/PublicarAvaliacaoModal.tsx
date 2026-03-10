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

interface PublicarAvaliacaoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacao: TurmaProva | null;
  isPublicada: boolean;
  onConfirm: (publicar: boolean) => void;
  isProcessing?: boolean;
  blockedReason?: string;
}

export function PublicarAvaliacaoModal({
  isOpen,
  onOpenChange,
  avaliacao,
  isPublicada,
  onConfirm,
  isProcessing = false,
  blockedReason,
}: PublicarAvaliacaoModalProps) {
  const canConfirm = !blockedReason && Boolean(avaliacao);
  const acao = isPublicada ? "despublicar" : "publicar";

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper hideCloseButton={isProcessing}>
        <ModalHeader>
          <ModalTitle>{isPublicada ? "Despublicar" : "Publicar"}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          {blockedReason ? (
            <p className="text-sm text-gray-600">{blockedReason}</p>
          ) : (
            <p className="text-sm text-gray-600">
              Tem certeza que deseja {acao} esta avaliação?
            </p>
          )}
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            size="md"
          >
            Cancelar
          </ButtonCustom>
          {canConfirm ? (
            <ButtonCustom
              variant="primary"
              onClick={() => onConfirm(!isPublicada)}
              isLoading={isProcessing}
              loadingText={isPublicada ? "Despublicando..." : "Publicando..."}
              size="md"
            >
              {isPublicada ? "Confirmar despublicação" : "Confirmar publicação"}
            </ButtonCustom>
          ) : null}
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

