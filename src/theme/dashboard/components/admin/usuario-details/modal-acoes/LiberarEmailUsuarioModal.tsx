"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom, SimpleTextarea } from "@/components/ui/custom";

interface LiberarEmailUsuarioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioNome: string;
  usuarioEmail: string;
  onConfirm: (payload?: { motivo?: string }) => Promise<void>;
}

export function LiberarEmailUsuarioModal({
  isOpen,
  onOpenChange,
  usuarioNome,
  usuarioEmail,
  onConfirm,
}: LiberarEmailUsuarioModalProps) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMotivo("Liberação manual pelo painel");
    setIsSubmitting(false);
  }, [isOpen]);

  const motivoNormalizado = useMemo(() => motivo.trim(), [motivo]);
  const motivoInvalido =
    motivoNormalizado.length > 0 &&
    (motivoNormalizado.length < 3 || motivoNormalizado.length > 500);

  const handleClose = () => {
    if (!isSubmitting) onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting || motivoInvalido) return;

    setIsSubmitting(true);
    try {
      await onConfirm(
        motivoNormalizado ? { motivo: motivoNormalizado } : undefined
      );
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Liberar acesso</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            <div className="text-sm text-gray-700">
              Você vai liberar manualmente o acesso de{" "}
              <strong>{usuarioNome}</strong>.
            </div>
            <div className="mt-1 text-sm text-gray-500">{usuarioEmail}</div>
            <div className="mt-3 text-sm text-gray-600">
              Essa ação ativa a conta pendente e conclui a liberação de acesso à
              plataforma.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">
              Motivo
            </div>
            <SimpleTextarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value.slice(0, 500))}
              placeholder="Liberação manual pelo painel"
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>
                Opcional. Use entre 3 e 500 caracteres quando informar um motivo.
              </span>
              <span>{motivo.length}/500</span>
            </div>
            {motivoInvalido ? (
              <div className="text-xs text-red-600">
                O motivo deve ter entre 3 e 500 caracteres.
              </div>
            ) : null}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex w-full justify-end gap-3">
            <ButtonCustom
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Liberando..."
              disabled={isSubmitting || motivoInvalido}
            >
              Confirmar liberação
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
