"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, KeyRound, LogOut } from "lucide-react";

import {
  ButtonCustom,
  InputCustom,
  toastCustom,
  FormLoadingModal,
} from "@/components/ui/custom";
import { changeUserPassword, getUserProfile } from "@/api/usuarios";
import { logoutUser } from "@/lib/auth";
import { getDashboardUrl } from "@/lib/primeiro-acesso";

// Mesmas regras de validarSenha() na API
const API_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>]/;

const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    validate: (value: string) => value.length >= 8,
  },
  {
    id: "case",
    label: "Letras maiúsculas e minúsculas",
    validate: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "Pelo menos um número",
    validate: (value: string) => /\d/.test(value),
  },
  {
    id: "special",
    label: 'Caractere especial: ! @ # $ % ^ & * ( ) , . ? " : { } | < >',
    validate: (value: string) => API_SPECIAL_CHARS.test(value),
  },
];

type PageState = "loading" | "ready" | "success";

function hasSessionToken(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith("token="));
}

function errorMessageFor(error: unknown): string {
  const details = (
    error as { details?: { code?: string; detalhes?: string[] } }
  )?.details;
  switch (details?.code) {
    case "INVALID_CURRENT_PASSWORD":
      return "Senha provisória incorreta. Confira a senha que você recebeu por e-mail.";
    case "SAME_PASSWORD":
      return "A nova senha precisa ser diferente da senha provisória.";
    case "PASSWORD_MISMATCH":
      return "As senhas não coincidem. Verifique e tente novamente.";
    case "WEAK_PASSWORD":
      return details.detalhes?.length
        ? details.detalhes.join(". ")
        : "A senha precisa atender a todos os requisitos de segurança.";
    default:
      return "Não foi possível trocar a senha agora. Tente novamente em instantes.";
  }
}

export default function PrimeiroAcessoPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [firstName, setFirstName] = useState<string | null>(null);
  const [senhaProvisoria, setSenhaProvisoria] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!hasSessionToken()) {
      window.location.href = "/login";
      return;
    }

    let isActive = true;
    getUserProfile()
      .then((profile) => {
        if (!isActive) return;
        if (profile.success && "usuario" in profile) {
          if (!profile.usuario.precisaTrocarSenha) {
            // Senha já trocada: segue para o painel
            window.location.href = getDashboardUrl();
            return;
          }
          const [nome] = (profile.usuario.nomeCompleto || "").split(" ");
          setFirstName(nome || null);
        }
        setPageState("ready");
      })
      .catch(() => {
        if (isActive) setPageState("ready");
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    setFormError(null);
  }, [senhaProvisoria, password, confirmPassword]);

  const requirements = PASSWORD_REQUIREMENTS.map((item) => ({
    id: item.id,
    label: item.label,
    satisfied: item.validate(password),
  }));
  const isStrong = requirements.every((item) => item.satisfied);
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    senhaProvisoria.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !passwordMismatch &&
    isStrong;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setFormError("Preencha os campos e atenda a todos os requisitos.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changeUserPassword({
        senhaAntiga: senhaProvisoria,
        senhaNova: password,
        confirmarSenha: confirmPassword,
      });
      setPageState("success");
      toastCustom.success(
        "Senha criada com sucesso! Bem-vindo à nova Advance+.",
      );
      setTimeout(() => {
        window.location.href = getDashboardUrl();
      }, 1500);
    } catch (error) {
      setFormError(errorMessageFor(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (pageState === "loading") return null;

    if (pageState === "success") {
      return (
        <div
          className="flex flex-col items-center gap-6 py-10 text-center"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden />
          <div className="space-y-2">
            <h1 className="!mb-0">Tudo pronto!</h1>
            <p className="!leading-normal">
              Sua nova senha foi criada. Estamos levando você para a plataforma.
            </p>
          </div>
          <ButtonCustom asChild variant="primary" size="md" className="px-6">
            <a href={getDashboardUrl()}>Ir para a plataforma</a>
          </ButtonCustom>
        </div>
      );
    }

    return (
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="space-y-2">
            <h2 className="!mb-0">
              {firstName
                ? `Olá, ${firstName}! Crie sua senha`
                : "Crie sua senha"}
            </h2>
            <p className="!leading-normal">
              Este é o seu primeiro acesso à nova Advance+. Por segurança,
              troque a senha provisória por uma senha só sua.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InputCustom
            label="Senha provisória"
            type="password"
            name="senhaProvisoria"
            value={senhaProvisoria}
            onChange={(event) => setSenhaProvisoria(event.target.value)}
            required
            showPasswordToggle
            autoComplete="current-password"
          />

          <InputCustom
            label="Nova senha"
            type="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            showPasswordToggle
            autoComplete="new-password"
          />

          <InputCustom
            label="Confirmar nova senha"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            showPasswordToggle
            autoComplete="new-password"
            error={
              passwordMismatch
                ? "As senhas não são iguais. Confira os campos."
                : undefined
            }
          />

          <div className="rounded-2xl border border-gray-200 bg-gray-100/30 p-4">
            <p className="!mb-0">Sua nova senha deve conter:</p>
            <ul className="mt-2 space-y-2 text-left">
              {requirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition ${
                      requirement.satisfied
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[var(--primary-color)]/40 bg-white text-[var(--primary-color)]/70"
                    }`}
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

          {formError && (
            <p
              className="text-sm font-medium text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonCustom
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting || !canSubmit}
          >
            Criar minha senha
          </ButtonCustom>

          <ButtonCustom
            type="button"
            variant="ghost"
            size="lg"
            className="inline-flex w-full items-center justify-center gap-2"
            onClick={() => logoutUser()}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </ButtonCustom>
        </div>
      </form>
    );
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white font-geist text-foreground">
      <FormLoadingModal
        isLoading={pageState === "loading"}
        title="Preparando seu primeiro acesso..."
        loadingStep="Carregando"
        icon={KeyRound}
      />

      <header className="w-full border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl justify-center px-6 py-6">
          <Image
            src="/images/logos/logo_padrao.webp"
            alt="Logo Advance+"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
        </div>
      </header>

      <main className="flex w-full flex-1 items-center justify-center px-6 py-10 sm:py-10">
        <div className="w-full max-w-lg">
          <div className="p-6 sm:p-10">{renderContent()}</div>
        </div>
      </main>

      <footer className="bg-[var(--color-blue)] py-8 text-white/80">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm tracking-wide !text-white">
            Todos os direitos reservados © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--secondary-color)]">
              Advance+
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
