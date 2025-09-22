"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  ButtonCustom,
  InputCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  toastCustom,
} from "@/components/ui/custom";
import { Icon } from "@/components/ui/custom/Icons";
import { requestPasswordRecovery } from "@/api/usuarios";
import type { UsuarioPasswordRecoveryRequestPayload } from "@/api/usuarios";
import { MaskService } from "@/services";

interface PasswordRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RecoveryMode = "email" | "document";

const animationVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function PasswordRecoveryModal({ open, onOpenChange }: PasswordRecoveryModalProps) {
  const maskService = useMemo(() => MaskService.getInstance(), []);
  const [mode, setMode] = useState<RecoveryMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIdentifier("");
      setMode("email");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const isEmailMode = mode === "email";

  const validateIdentifier = (value: string): boolean => {
    if (!value) {
      setError("Informe um valor para continuar.");
      return false;
    }

    if (isEmailMode) {
      if (!maskService.validate(value, "email")) {
        setError("Digite um e-mail válido.");
        return false;
      }
      return true;
    }

    const maskedValue = maskService.processInput(value, "cpfCnpj");
    const isValid = maskService.validate(maskedValue, "cpfCnpj");

    if (!isValid) {
      setError("Informe um CPF ou CNPJ válido.");
      return false;
    }

    return true;
  };

  const buildPayload = (value: string): UsuarioPasswordRecoveryRequestPayload => {
    if (isEmailMode) {
      const normalized = value.trim().toLowerCase();
      return {
        identificador: normalized,
        email: normalized,
      };
    }

    const digits = maskService.removeMask(value, "cpfCnpj");
    if (digits.length === 11) {
      return {
        identificador: digits,
        cpf: digits,
      };
    }

    return {
      identificador: digits,
      cnpj: digits,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmed = identifier.trim();

    if (!validateIdentifier(trimmed)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordRecovery(buildPayload(trimmed));
      toastCustom.success("Se existir uma conta, enviaremos as instruções por e-mail.");
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao solicitar recuperação de senha:", err);
      const status = (err as { status?: number }).status;
      if (status === 404) {
        setError("Não encontramos uma conta com esses dados. Verifique e tente novamente.");
      } else if (status === 429) {
        setError("Muitas tentativas. Aguarde alguns instantes para tentar novamente.");
      } else {
        setError("Ocorreu um erro ao enviar a solicitação. Tente novamente mais tarde.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeToggle = () => {
    setMode((prev) => (prev === "email" ? "document" : "email"));
    setIdentifier("");
    setError(null);
  };

  const description = isEmailMode
    ? "Digite o e-mail cadastrado e enviaremos um link seguro para criar uma nova senha."
    : "Informe o CPF ou CNPJ vinculado à conta. Vamos localizar seu cadastro e orientar o próximo passo por e-mail.";

  return (
    <ModalCustom isOpen={open} onOpenChange={onOpenChange}>
      <ModalContentWrapper className="sm:max-w-md p-6 sm:p-8" placement="center">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <ModalHeader className="items-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <Icon name={isEmailMode ? "MailCheck" : "IdCard"} className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <ModalTitle className="text-2xl font-semibold text-foreground">
                Recuperar acesso
              </ModalTitle>
              <ModalDescription className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </ModalDescription>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {isEmailMode ? (
                  <motion.div
                    key="email"
                    {...animationVariants}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <InputCustom
                      label="E-mail"
                      type="email"
                      mask="email"
                      placeholder="seuemail@email.com"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      size="lg"
                      helperText="Enviaremos as instruções para o endereço informado."
                      required
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="document"
                    {...animationVariants}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <InputCustom
                      label="CPF ou CNPJ"
                      mask="cpfCnpj"
                      placeholder="000.000.000-00"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      size="lg"
                      helperText="Usaremos o documento para localizar sua conta e enviar as orientações."
                      required
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ButtonCustom
              type="button"
              variant="link"
              className="justify-start px-0 text-sm font-semibold text-[var(--primary-color)]"
              onClick={handleModeToggle}
            >
              {isEmailMode
                ? "Não tenho acesso ao e-mail. Usar CPF ou CNPJ"
                : "Prefiro tentar com meu e-mail"}
            </ButtonCustom>

            {error && (
              <p className="text-sm text-destructive" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
          </ModalBody>

          <ModalFooter className="gap-3 sm:flex-row sm:items-center">
            <ButtonCustom
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="font-medium"
              fullWidth
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || !identifier.trim()}
              size="lg"
              fullWidth
            >
              Enviar instruções
            </ButtonCustom>
          </ModalFooter>
        </form>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

export default PasswordRecoveryModal;
