import React from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { CheckCircle2 } from "lucide-react";

interface ConfirmarAprovacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vagaTitulo: string;
  empresaNome?: string;
  isLoading?: boolean;
}

export function ConfirmarAprovacaoModal({
  isOpen,
  onClose,
  onConfirm,
  vagaTitulo,
  empresaNome,
  isLoading = false,
}: ConfirmarAprovacaoModalProps) {
  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader className="pb-1">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <ModalTitle className="!text-base !font-semibold !mb-1">
                Aprovar esta vaga?
              </ModalTitle>
              <ModalDescription className="!text-sm !text-gray-500">
                Depois de aprovada, a vaga ficará visível para os candidatos.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-2">
          <p className="text-sm text-gray-600">
            Você está prestes a aprovar a vaga{" "}
            <span className="font-semibold text-gray-800">{vagaTitulo}</span>
            {empresaNome ? (
              <>
                {" "}
                da empresa{" "}
                <span className="font-semibold text-gray-800">
                  {empresaNome}
                </span>
                .
              </>
            ) : (
              "."
            )}
          </p>
          <p className="text-xs text-gray-400">
            Essa ação não pode ser desfeita.
          </p>
        </ModalBody>

        <ModalFooter className="gap-2">
          <ButtonCustom
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Confirmar aprovação
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
