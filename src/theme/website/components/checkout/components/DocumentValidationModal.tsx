// src/theme/website/components/checkout/components/DocumentValidationModal.tsx

"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/custom/modal";

export interface DocumentValidationModalProps {
  /** Se a modal está aberta */
  isOpen: boolean;
  /** Callback para fechar a modal */
  onClose: () => void;
  /** Tipo de documento que falhou na validação */
  documentType: "CPF" | "CNPJ";
  /** Valor do documento inválido (para exibir mascarado) */
  documentValue?: string;
}

/**
 * Modal de erro de validação de documento (CPF/CNPJ)
 *
 * Exibe feedback claro e direto quando um documento é inválido,
 * seguindo princípios de UX writing.
 */
export const DocumentValidationModal: React.FC<
  DocumentValidationModalProps
> = ({ isOpen, onClose, documentType }) => {
  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="sm" backdrop="blur">
      <ModalContentWrapper hideCloseButton={false}>
        <ModalHeader className="pb-0">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <ModalTitle className="!text-lg !font-semibold text-zinc-900">
              {documentType === "CPF" ? "CPF inválido" : "CNPJ inválido"}
            </ModalTitle>
          </div>
        </ModalHeader>

        <ModalBody className="text-center space-y-4">
          <p className="!text-sm !text-zinc-600 !leading-relaxed">
            Verifique se o {documentType} informado está completo e correto,
            incluindo todos os dígitos verificadores.
          </p>
        </ModalBody>

        <ModalFooter className="pt-2">
          <ButtonCustom variant="primary" onClick={onClose} fullWidth>
            Corrigir documento
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
};

export default DocumentValidationModal;
