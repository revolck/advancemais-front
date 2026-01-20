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
}

export function ConfirmarEnvioModal({
  isOpen,
  onOpenChange,
  onConfirmar,
  titulo = "Confirmar envio da resposta",
  pergunta = "Você tem certeza que deseja enviar sua resposta?",
  mensagemEdicao = "Importante: Após enviar, você não poderá mais editar sua resposta.",
  mensagemProfessor = "O professor receberá sua resposta e dará a nota posteriormente.",
  textoBotao = "Sim, enviar resposta",
}: ConfirmarEnvioModalProps) {
  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      backdrop="blur"
      isDismissable={true}
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
              <div className="flex items-start gap-2">
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
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              onClick={onConfirmar}
              variant="default"
              withAnimation={false}
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
