// src/theme/dashboard/components/admin/lista-solicitacoes/components/RejeitarVagaModal.tsx

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { cn } from "@/lib/utils";

const MAX_CARACTERES = 1000;

interface RejeitarVagaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivoRejeicao: string) => void;
  vagaTitulo: string;
  empresaNome?: string;
  isLoading?: boolean;
}

export function RejeitarVagaModal({
  isOpen,
  onClose,
  onConfirm,
  vagaTitulo,
  empresaNome,
  isLoading = false,
}: RejeitarVagaModalProps) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset ao abrir/fechar modal
  useEffect(() => {
    if (!isOpen) {
      setMotivo("");
      setError(null);
    }
  }, [isOpen]);

  const handleMotivoChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMotivo(value);
      if (error) setError(null);
    },
    [error]
  );

  const handleConfirm = useCallback(() => {
    const motivoTrimmed = motivo.trim();

    if (!motivoTrimmed) {
      setError("O motivo da rejeição é obrigatório");
      return;
    }

    if (motivoTrimmed.length > MAX_CARACTERES) {
      setError(`O motivo não pode ter mais de ${MAX_CARACTERES} caracteres`);
      return;
    }

    onConfirm(motivoTrimmed);
  }, [motivo, onConfirm]);

  const isValid = motivo.trim().length > 0 && motivo.length <= MAX_CARACTERES;

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      backdrop="blur"
    >
      <ModalContentWrapper hideCloseButton={isLoading}>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <ModalTitle className="!mt-4 !text-lg !font-semibold !mb-0">
                Rejeitar Solicitação de Vaga
              </ModalTitle>
              <ModalDescription className="!text-sm !text-gray-500">
                A empresa receberá uma notificação com o motivo da rejeição.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-4 p-1">
          {/* Info da vaga */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <span className="text-gray-500">Vaga:</span>{" "}
              <span className="font-medium text-gray-900">{vagaTitulo}</span>
            </div>
            {empresaNome && (
              <div className="text-sm mt-1">
                <span className="text-gray-500">Empresa:</span>{" "}
                <span className="font-medium text-gray-900">{empresaNome}</span>
              </div>
            )}
          </div>

          {/* Campo de motivo */}
          <SimpleTextarea
            id="motivo-rejeicao"
            label="Motivo da Rejeição"
            value={motivo}
            onChange={handleMotivoChange}
            placeholder="Ex: A vaga não atende aos requisitos mínimos do sistema. Faltam informações sobre salário e benefícios..."
            rows={5}
            disabled={isLoading}
            maxLength={MAX_CARACTERES}
            showCharCount={true}
            error={error || undefined}
            required
            size="md"
          />
        </ModalBody>

        <ModalFooter className="gap-3">
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="danger"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? "Rejeitando..." : "Confirmar Rejeição"}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
