"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { ButtonCustom, InputCustom, toastCustom } from "@/components/ui/custom";
import {
  validatePasswordRecoveryToken,
  resetPasswordWithToken,
} from "@/api/usuarios";

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
    id: "special",
    label: "Caractere especial (ex.: !@#$%)",
    validate: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

type PageState = "loading" | "ready" | "invalid" | "success";

type Requirement = (typeof PASSWORD_REQUIREMENTS)[number];

const isPasswordStrong = (
  value: string,
  requirements: Requirement[]
): boolean => requirements.every((rule) => rule.validate(value));

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get("tp") ?? "";
  const emailParam = searchParams?.get("ep") ?? undefined;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decodedEmail = useMemo(() => {
    if (!emailParam) return undefined;
    try {
      return decodeURIComponent(emailParam);
    } catch (error) {
      console.warn("Não foi possível decodificar o e-mail informado", error);
      return emailParam;
    }
  }, [emailParam]);

  useEffect(() => {
    if (!tokenParam) {
      setPageState("invalid");
      return;
    }

    let isActive = true;
    setPageState("loading");

    validatePasswordRecoveryToken(tokenParam)
      .then(() => {
        if (!isActive) return;
        setPageState("ready");
      })
      .catch((error) => {
        console.error("Erro ao validar token de recuperação", error);
        if (!isActive) return;
        setPageState("invalid");
      });

    return () => {
      isActive = false;
    };
  }, [tokenParam]);

  useEffect(() => {
    setFormError(null);
  }, [password, confirmPassword]);

  const satisfiedRequirements = PASSWORD_REQUIREMENTS.map((item) => ({
    id: item.id,
    label: item.label,
    satisfied: item.validate(password),
  }));

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !passwordMismatch &&
    isPasswordStrong(password, PASSWORD_REQUIREMENTS);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tokenParam) {
      setPageState("invalid");
      return;
    }

    if (!password || !confirmPassword) {
      setFormError("Preencha os dois campos de senha.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    if (!isPasswordStrong(password, PASSWORD_REQUIREMENTS)) {
      setFormError(
        "A senha precisa atender a todos os requisitos de segurança."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordWithToken({
        token: tokenParam,
        novaSenha: password,
      });
      setPageState("success");
      toastCustom.success(
        "Senha redefinida com sucesso! Faça login novamente."
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Erro ao redefinir senha", error);
      setFormError(
        "Não foi possível redefinir a senha. O link pode ter expirado ou já ter sido usado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (pageState === "loading") {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <Loader2
            className="h-8 w-8 animate-spin text-[var(--primary-color)]"
            aria-hidden
          />
          <p className="!font-medium">
            Validando seu link seguro. Aguarde alguns instantes...
          </p>
        </div>
      );
    }

    if (pageState === "invalid") {
      return (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <TriangleAlert className="h-12 w-12 text-destructive" aria-hidden />
          <div className="space-y-2">
            <h2>Link inválido ou expirado</h2>
            <p className="!leading-normal">
              Solicite um novo e-mail de recuperação para garantir sua
              segurança. O link pode ter sido usado ou expirou.
            </p>
          </div>
          <ButtonCustom asChild variant="secondary" size="md" className="px-6">
            <Link href="/login">Voltar para o login</Link>
          </ButtonCustom>
        </div>
      );
    }

    if (pageState === "success") {
      return (
        <div
          className="flex flex-col items-center gap-6 py-10 text-center"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden />
          <div className="space-y-2">
            <h1 className="!mb-0">Senha redefinida!</h1>
            <p className="!leading-normal">
              Estamos redirecionando você para a página de login. Caso não
              aconteça automaticamente, clique no botão abaixo.
            </p>
          </div>
          <ButtonCustom asChild variant="primary" size="md" className="px-6">
            <Link href="/login">Ir para o login</Link>
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
            <h2 className="!mb-0">Defina uma nova senha</h2>
            <p className="!leading-normal">
              {decodedEmail
                ? `Para continuar, escolha uma nova senha para ${decodedEmail}.`
                : "Para continuar, escolha uma nova senha segura."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
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
            label="Confirmar senha"
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
            <p className="!mb-0">Sua senha deve conter:</p>
            <ul className="mt-2 space-y-2 text-left">
              {satisfiedRequirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[11px] font-semibold transition ${
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
            Redefinir senha
          </ButtonCustom>

          <ButtonCustom asChild variant="ghost" size="lg" className="w-full">
            <Link href="/login">Voltar para o login</Link>
          </ButtonCustom>
        </div>
      </form>
    );
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white font-geist text-foreground">
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
          <div className="mt-3 flex flex-wrap items-center justify-center text-xs text-white/80 sm:text-sm">
            <a
              href="http://advancemais.com/politica-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 transition-colors hover:text-white"
            >
              Política de Privacidade
            </a>
            <span className="h-4 w-px bg-blue-800/50" aria-hidden />
            <a
              href="http://advancemais.com/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 transition-colors hover:text-white"
            >
              Termos de Uso
            </a>
            <span className="h-4 w-px bg-blue-800/20" aria-hidden />
            <a href="#" className="px-3 transition-colors hover:text-white">
              Preferências de Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
