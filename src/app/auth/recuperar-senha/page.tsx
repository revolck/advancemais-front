"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Lock, TriangleAlert } from "lucide-react";

import {
  ButtonCustom,
  InputCustom,
  toastCustom,
} from "@/components/ui/custom";
import { validatePasswordRecoveryToken, resetPasswordWithToken } from "@/api/usuarios";

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

const isPasswordStrong = (value: string, requirements: Requirement[]): boolean =>
  requirements.every((rule) => rule.validate(value));

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

  const canSubmit =
    password.length > 0 &&
    password === confirmPassword &&
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
      setFormError("A senha precisa atender a todos os requisitos de segurança.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordWithToken({
        token: tokenParam,
        novaSenha: password,
      });
      setPageState("success");
      toastCustom.success("Senha redefinida com sucesso! Faça login novamente.");
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
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" aria-hidden />
          <p className="text-base font-medium text-muted-foreground">
            Validando seu link seguro. Aguarde alguns instantes...
          </p>
        </div>
      );
    }

    if (pageState === "invalid") {
      return (
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <TriangleAlert className="h-12 w-12 text-destructive" aria-hidden />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Link inválido ou expirado
            </h1>
            <p className="text-sm text-muted-foreground">
              Solicite um novo e-mail de recuperação para garantir sua segurança. O link pode ter sido usado ou expirou.
            </p>
          </div>
          <ButtonCustom
            asChild
            variant="primary"
            size="lg"
            className="px-6"
          >
            <Link href="/login">Voltar para o login</Link>
          </ButtonCustom>
        </div>
      );
    }

    if (pageState === "success") {
      return (
        <div className="flex flex-col items-center gap-6 py-12 text-center" role="status" aria-live="polite">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Senha redefinida!
            </h1>
            <p className="text-sm text-muted-foreground">
              Estamos redirecionando você para a página de login. Caso não aconteça automaticamente, clique no botão abaixo.
            </p>
          </div>
          <ButtonCustom
            asChild
            variant="primary"
            size="lg"
            className="px-6"
          >
            <Link href="/login">Ir para o login</Link>
          </ButtonCustom>
        </div>
      );
    }

    return (
      <form className="space-y-8" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-color)]/5">
            <Lock className="h-6 w-6 text-[var(--primary-color)]" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Defina uma nova senha
          </h1>
          <p className="text-sm text-muted-foreground">
            {decodedEmail
              ? `Para continuar, escolha uma nova senha para ${decodedEmail}.`
              : "Para continuar, escolha uma nova senha segura."}
          </p>
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
          />

          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-left">
            <p className="text-sm font-medium text-foreground">Sua senha deve conter:</p>
            <ul className="mt-3 space-y-2">
              {satisfiedRequirements.map((requirement) => (
                <li
                  key={requirement.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${requirement.satisfied ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/40 text-muted-foreground"}`}
                    aria-hidden
                  >
                    {requirement.satisfied ? "✓" : ""}
                  </span>
                  <span
                    className={requirement.satisfied ? "text-foreground" : "text-muted-foreground"}
                  >
                    {requirement.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {formError && (
            <p className="text-sm font-medium text-destructive" role="alert" aria-live="assertive">
              {formError}
            </p>
          )}
        </div>

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
      </form>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background-color)] px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--primary-color)] transition hover:text-[var(--primary-color)]/80"
          >
            &larr; Voltar para o login
          </Link>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
