"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { requestUserPasswordReset } from "@/api/usuarios";

interface ResetarSenhaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null | undefined;
}

export function ResetarSenhaModal({
  isOpen,
  onOpenChange,
  email,
}: ResetarSenhaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!email) {
      toastCustom.error({
        title: "E-mail indisponível",
        description: "Não encontramos um e-mail associado para solicitar o reset.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestUserPasswordReset(email);

      toastCustom.success({
        title: "Solicitação enviada",
        description: "O usuário receberá um e-mail com as instruções para redefinir a senha.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao solicitar reset de senha", error);
      toastCustom.error({
        title: "Erro ao resetar senha",
        description: "Não foi possível solicitar a redefinição agora. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    email,
    handleClose,
    isSubmitting,
    requestUserPasswordReset,
    toastCustom,
  ]);

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Resetar senha</ModalTitle>
          <ModalDescription>
            Enviaremos um e-mail com instruções para que a empresa redefina a senha de acesso.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <InputCustom label="E-mail" value={email ?? ""} disabled />
          <p className="text-sm text-muted-foreground">
            Confirme a solicitação. A redefinição só será concluída quando o usuário acessar o link enviado para o e-mail cadastrado.
          </p>
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Enviando..."
            disabled={!email}
          >
            Enviar instruções
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
