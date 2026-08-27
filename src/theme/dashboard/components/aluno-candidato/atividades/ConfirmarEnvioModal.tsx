"use client";

import {
  ButtonCustom,
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/custom";
import { Lock, FileQuestion, Send } from "lucide-react";

interface ConfirmarEnvioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  titulo?: string;
  pergunta?: string;
  mensagemEdicao?: string;
  mensagemProfessor?: string;
  textoBotao?: string;
  isLoading?: boolean;
}

export function ConfirmarEnvioModal({
  isOpen,
  onOpenChange,
  onConfirmar,
  titulo = "Confirmar envio da resposta",
  pergunta = "Revise a resposta antes de enviar.",
  mensagemEdicao = "Você poderá editar enquanto houver entregas disponíveis.",
  mensagemProfessor = "O professor receberá sua resposta e dará a nota posteriormente.",
  textoBotao = "Enviar resposta",
  isLoading = false,
}: ConfirmarEnvioModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      isDismissable={!isLoading}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <ModalTitle className="mb-0!">{titulo}</ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm! text-gray-700 leading-relaxed mt-0!">
              {pergunta}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs! text-amber-800 font-medium">
                  {mensagemEdicao}
                </p>
              </div>
              <div className="flex items-start gap-2 mb-0!">
                <FileQuestion className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs! text-amber-800 font-medium">
                  {mensagemProfessor}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <ButtonCustom
              onClick={() => onOpenChange(false)}
              variant="outline"
              withAnimation={false}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              onClick={onConfirmar}
              variant="default"
              withAnimation={false}
              disabled={isLoading}
              isLoading={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {textoBotao}
            </ButtonCustom>
          </div>
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
