"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
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
import { requestPasswordRecovery } from "@/api/usuarios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ResetarSenhaInstrutorModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null | undefined;
  allowManual?: boolean;
  onManualSubmit?: (password: string, confirmPassword: string) => Promise<void>;
}

const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    validate: (v: string) => v.length >= 8,
  },
  {
    id: "case",
    label: "Letras maiúsculas e minúsculas",
    validate: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  {
    id: "number",
    label: "Número (0-9)",
    validate: (v: string) => /[0-9]/.test(v),
  },
  {
    id: "special",
    label: "Caractere especial (ex.: !@#$%)",
    validate: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

const isStrong = (v: string) =>
  PASSWORD_REQUIREMENTS.every((r) => r.validate(v));

export function ResetarSenhaModal({
  isOpen,
  onOpenChange,
  email,
  allowManual = false,
  onManualSubmit,
}: ResetarSenhaInstrutorModalProps) {
  type ResetMethod = "email" | "manual";
  const [method, setMethod] = useState<ResetMethod>(
    allowManual ? "email" : "email"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  const resetFormState = useCallback(() => {
    setMethod(allowManual ? "email" : "email");
    setPassword("");
    setConfirmPassword("");
    setManualFormError(null);
    setIsSubmitting(false);
  }, [allowManual]);

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
    }
  }, [isOpen, resetFormState]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetFormState();
  }, [onOpenChange, resetFormState]);

  const handleMethodChange = useCallback((value: ResetMethod) => {
    setMethod(value);
    setManualFormError(null);
    if (value === "email") {
      setPassword("");
      setConfirmPassword("");
    }
  }, []);

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPassword(value);
      setManualFormError(null);
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setConfirmPassword(value);
      setManualFormError(null);
    },
    []
  );

  useEffect(() => {
    if (method === "manual") {
      setManualFormError(null);
    }
  }, [confirmPassword, method, password]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (method === "email") {
      if (!email) {
        toastCustom.error({
          title: "E-mail indisponível",
          description: "Não encontramos e-mail associado.",
        });
        return;
      }
      setIsSubmitting(true);
      try {
        await requestPasswordRecovery({ email });
        toastCustom.success({
          title: "Solicitação enviada",
          description: "O instrutor receberá um e-mail com instruções.",
        });
        handleClose();
      } catch (error) {
        console.error("Erro ao solicitar reset de senha (instrutor)", error);
        toastCustom.error({
          title: "Erro ao resetar senha",
          description: "Tente novamente em instantes.",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!allowManual || !onManualSubmit) return;

    const p = password.trim();
    const c = confirmPassword.trim();
    if (!p || !c) {
      setManualFormError("Preencha os dois campos de senha.");
      return;
    }
    if (p !== c) {
      setManualFormError(
        "As senhas não coincidem. Verifique e tente novamente."
      );
      return;
    }
    if (!isStrong(p)) {
      setManualFormError(
        "A senha precisa atender a todos os requisitos de segurança."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onManualSubmit(p, c);
      toastCustom.success({
        title: "Senha atualizada",
        description:
          "A senha do instrutor foi redefinida. Compartilhe a nova senha com o instrutor.",
      });
      handleClose();
    } catch (error) {
      console.error("Erro ao redefinir senha manualmente (instrutor)", error);
      toastCustom.error({
        title: "Erro ao atualizar senha",
        description: "Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allowManual,
    confirmPassword,
    email,
    handleClose,
    isSubmitting,
    method,
    onManualSubmit,
    password,
  ]);

  const satisfiedRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((r) => ({
        id: r.id,
        label: r.label,
        satisfied: r.validate(password.trim()),
      })),
    [password]
  );

  const passwordMismatch =
    confirmPassword.trim().length > 0 &&
    password.trim() !== confirmPassword.trim();
  const canSubmitManual =
    !isSubmitting &&
    isStrong(password.trim()) &&
    !passwordMismatch &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0;
  const isSubmitDisabled =
    isSubmitting || (method === "email" ? !email : !canSubmitManual);
  const submitButtonLabel =
    method === "email" ? "Enviar instruções" : "Atualizar senha";
  const submitLoadingText =
    method === "email" ? "Enviando..." : "Atualizando...";

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      backdrop="blur"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle className="!mb-0">Resetar senha</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6 p-1">
          <div className="space-y-4">
            <ModalDescription className="!text-sm !text-muted-foreground">
              Escolha como deseja redefinir a senha da conta do instrutor.
            </ModalDescription>

            <RadioGroup
              value={method}
              onValueChange={(v) => handleMethodChange(v as ResetMethod)}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleMethodChange("email")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleMethodChange("email");
                }}
                className={cn(
                  "group flex h-full cursor-pointer items-start gap-3 rounded-xl border px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
                  method === "email"
                    ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10 shadow-sm"
                    : "border-border hover:border-foreground/50 hover:bg-accent/5 hover:shadow-sm"
                )}
              >
                <RadioGroupItem
                  value="email"
                  id="reset-instrutor-email"
                  className="mt-1"
                />
                <div className="flex flex-1 flex-col gap-1 text-sm">
                  <Label
                    htmlFor="reset-instrutor-email"
                    className="cursor-pointer font-semibold text-foreground"
                  >
                    Enviar instruções por e-mail
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Dispara um e-mail para o instrutor definir uma nova senha.
                  </span>
                </div>
              </div>

              {allowManual && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMethodChange("manual")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleMethodChange("manual");
                  }}
                  className={cn(
                    "group flex h-full cursor-pointer items-start gap-3 rounded-xl border px-5 py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/40",
                    method === "manual"
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10 shadow-sm"
                      : "border-border hover:border-foreground/50 hover:bg-accent/5 hover:shadow-sm"
                  )}
                >
                  <RadioGroupItem
                    value="manual"
                    id="reset-instrutor-manual"
                    className="mt-1"
                  />
                  <div className="flex flex-1 flex-col gap-1 text-sm">
                    <Label
                      htmlFor="reset-instrutor-manual"
                      className="cursor-pointer font-semibold text-foreground"
                    >
                      Definir senha manualmente
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Permite que o administrador defina a nova senha agora.
                    </span>
                  </div>
                </div>
              )}
            </RadioGroup>
          </div>

          {method === "email" ? (
            <div className="space-y-4">
              <p className="!text-sm !leading-normal !text-muted-foreground">
                Enviaremos um e-mail com instruções para redefinir a senha.
              </p>
              <InputCustom label="E-mail" value={email ?? ""} disabled />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="!text-sm !leading-normal !text-muted-foreground">
                Defina manualmente uma nova senha para a conta do instrutor.
              </p>
              <InputCustom
                label="E-mail da conta"
                value={email ?? ""}
                disabled
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputCustom
                  label="Nova senha"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  showPasswordToggle
                  disabled={isSubmitting}
                  required
                />
                <InputCustom
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  showPasswordToggle
                  disabled={isSubmitting}
                  error={
                    passwordMismatch
                      ? "As senhas não são iguais. Confira os campos."
                      : undefined
                  }
                  required
                />
              </div>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                <p className="!mb-0 text-sm">Sua senha deve conter:</p>
                <ul className="mt-2 space-y-2 text-left text-sm">
                  {satisfiedRequirements.map((req) => (
                    <li key={req.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                          req.satisfied
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-[var(--primary-color)]/40 bg-white text-[var(--primary-color)]/70"
                        )}
                      >
                        {req.satisfied ? "✓" : ""}
                      </span>
                      <span
                        className={
                          req.satisfied
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {manualFormError && (
                <p
                  className="text-sm font-medium text-destructive"
                  role="alert"
                  aria-live="assertive"
                >
                  {manualFormError}
                </p>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter className="pt-4">
          <ButtonCustom
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText={submitLoadingText}
            disabled={isSubmitDisabled}
            size="md"
          >
            {submitButtonLabel}
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
