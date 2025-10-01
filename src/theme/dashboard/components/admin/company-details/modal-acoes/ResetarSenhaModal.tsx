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
import { updateAdminCompany } from "@/api/empresas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  id: string;
  label: string;
  validate: (value: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    validate: (value) => value.length >= 8,
  },
  {
    id: "case",
    label: "Letras maiúsculas e minúsculas",
    validate: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Número (0-9)",
    validate: (value) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "Caractere especial (ex.: !@#$%)",
    validate: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const isPasswordStrong = (value: string): boolean =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.validate(value));

interface ResetarSenhaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string | null | undefined;
  companyId: string;
}

export function ResetarSenhaModal({
  isOpen,
  onOpenChange,
  email,
  companyId,
}: ResetarSenhaModalProps) {
  type ResetMethod = "email" | "manual";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [method, setMethod] = useState<ResetMethod>("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  const resetFormState = useCallback(() => {
    setMethod("email");
    setPassword("");
    setConfirmPassword("");
    setManualFormError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetFormState();
    }
  }, [isOpen, resetFormState]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetFormState();
  }, [onOpenChange, resetFormState]);

  const validateManualReset = useCallback(() => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      setManualFormError("Preencha os dois campos de senha.");
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setManualFormError(
        "As senhas não coincidem. Verifique e tente novamente."
      );
      return false;
    }

    if (!isPasswordStrong(trimmedPassword)) {
      setManualFormError(
        "A senha precisa atender a todos os requisitos de segurança."
      );
      return false;
    }

    return true;
  }, [confirmPassword, password]);

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
          description:
            "Não encontramos um e-mail associado para solicitar o reset.",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        await requestPasswordRecovery({ email });

        toastCustom.success({
          title: "Solicitação enviada",
          description:
            "O usuário receberá um e-mail com as instruções para redefinir a senha.",
        });

        handleClose();
      } catch (error) {
        console.error("Erro ao solicitar reset de senha", error);
        toastCustom.error({
          title: "Erro ao resetar senha",
          description:
            "Não foi possível solicitar a redefinição agora. Tente novamente.",
        });
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (!validateManualReset()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAdminCompany(companyId, {
        senha: password.trim(),
        confirmarSenha: confirmPassword.trim(),
      });

      toastCustom.success({
        title: "Senha atualizada",
        description:
          "A senha da empresa foi redefinida. Compartilhe a nova senha com a conta responsável.",
      });

      handleClose();
    } catch (error) {
      console.error("Erro ao redefinir senha manualmente", error);
      toastCustom.error({
        title: "Erro ao atualizar senha",
        description:
          "Não foi possível atualizar a senha agora. Tente novamente em instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    companyId,
    confirmPassword,
    email,
    handleClose,
    isSubmitting,
    method,
    password,
    validateManualReset,
  ]);

  const submitButtonLabel =
    method === "email" ? "Enviar instruções" : "Atualizar senha";
  const submitLoadingText =
    method === "email" ? "Enviando..." : "Atualizando...";
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();
  const passwordMismatch =
    trimmedConfirmPassword.length > 0 &&
    trimmedPassword !== trimmedConfirmPassword;

  const satisfiedRequirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        id: requirement.id,
        label: requirement.label,
        satisfied: requirement.validate(trimmedPassword),
      })),
    [trimmedPassword]
  );

  const canSubmitManual =
    trimmedPassword.length > 0 &&
    trimmedConfirmPassword.length > 0 &&
    !passwordMismatch &&
    isPasswordStrong(trimmedPassword);

  const isSubmitDisabled =
    isSubmitting || (method === "email" ? !email : !canSubmitManual);

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
              Escolha como deseja redefinir a senha da conta da empresa.
            </ModalDescription>

            <RadioGroup
              value={method}
              onValueChange={(value) =>
                handleMethodChange(value as ResetMethod)
              }
              className="grid gap-4 sm:grid-cols-2"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleMethodChange("email")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleMethodChange("email");
                  }
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
                  id="reset-method-email"
                  className="mt-1"
                />
                <div className="flex flex-1 flex-col gap-1 text-sm">
                  <Label
                    htmlFor="reset-method-email"
                    className="cursor-pointer font-semibold text-foreground"
                  >
                    Enviar instruções por e-mail
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Dispara um e-mail para que a própria empresa defina uma nova
                    senha.
                  </span>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => handleMethodChange("manual")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleMethodChange("manual");
                  }
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
                  id="reset-method-manual"
                  className="mt-1"
                />
                <div className="flex flex-1 flex-col gap-1 text-sm">
                  <Label
                    htmlFor="reset-method-manual"
                    className="cursor-pointer font-semibold text-foreground"
                  >
                    Definir nova senha manualmente
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Permite que o administrador escolha uma nova senha e aplique
                    imediatamente para a empresa.
                  </span>
                </div>
              </div>
            </RadioGroup>
          </div>

          {method === "email" ? (
            <div className="space-y-4">
              <p className="!text-sm !leading-normal !text-muted-foreground">
                Enviaremos um e-mail com instruções para que a empresa redefina
                a senha de acesso.
              </p>
              <InputCustom label="E-mail" value={email ?? ""} disabled />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="!text-sm !leading-normal !text-muted-foreground">
                Defina manualmente uma nova senha para a conta da empresa. A
                alteração é aplicada imediatamente.
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
                  {satisfiedRequirements.map((requirement) => (
                    <li
                      key={requirement.id}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                          requirement.satisfied
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-[var(--primary-color)]/40 bg-white text-[var(--primary-color)]/70"
                        )}
                        aria-hidden
                      >
                        {requirement.satisfied ? "✓" : ""}
                      </span>
                      <span
                        className={
                          requirement.satisfied
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {requirement.label}
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
