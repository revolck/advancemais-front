"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-color)]" aria-hidden />
          <p className="text-base font-medium text-muted-foreground">
            Validando seu link seguro. Aguarde alguns instantes...
          </p>
        </div>
      );
    }

    if (pageState === "invalid") {
      return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
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
            variant="secondary"
            size="md"
            className="px-6"
          >
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
            size="md"
            className="px-6"
          >
            <Link href="/login">Ir para o login</Link>
          </ButtonCustom>
        </div>
      );
    }

    return (
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside className="hidden rounded-2xl border border-[var(--primary-color)]/15 bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/90 to-[var(--secondary-color)]/90 p-6 text-white shadow-inner md:flex md:flex-col md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              <span>Recuperar acesso</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold leading-snug text-white">
                Sua segurança em primeiro lugar
              </h2>
              <p className="text-sm leading-relaxed text-white/80">
                {decodedEmail
                  ? `Estamos quase lá! Defina uma senha forte para ${decodedEmail} e mantenha sua conta protegida.`
                  : "Estamos quase lá! Defina uma senha forte e mantenha sua conta protegida."}
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-white" aria-hidden />
              <span>Use combinações únicas de letras, números e símbolos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-white" aria-hidden />
              <span>Evite reutilizar senhas utilizadas em outros serviços.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-white" aria-hidden />
              <span>Atualize seus dados sempre que notar qualquer atividade suspeita.</span>
            </li>
          </ul>
        </aside>

        <form
          className="flex flex-col gap-6 rounded-2xl border border-border/70 bg-white/80 p-6 backdrop-blur-sm sm:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-3 text-center md:text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)] md:mx-0">
              <Lock className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Defina uma nova senha
              </h1>
              <p className="text-sm text-muted-foreground">
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
            />

            <div className="rounded-2xl border border-[var(--primary-color)]/15 bg-[var(--primary-color)]/5 p-4 text-left">
              <p className="text-sm font-medium text-foreground">Sua senha deve conter:</p>
              <ul className="mt-3 space-y-2">
                {satisfiedRequirements.map((requirement) => (
                  <li key={requirement.id} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition ${requirement.satisfied ? "border-emerald-500 bg-emerald-500 text-white shadow-sm" : "border-[var(--primary-color)]/40 bg-white text-[var(--primary-color)]/70"}`}
                      aria-hidden
                    >
                      {requirement.satisfied ? "✓" : ""}
                    </span>
                    <span className={requirement.satisfied ? "text-foreground" : "text-muted-foreground"}>
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

            <ButtonCustom asChild variant="ghost" size="sm" className="w-full">
              <Link href="/login">Voltar para o login</Link>
            </ButtonCustom>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full bg-white font-geist text-foreground">
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

      <main className="flex min-h-[70dvh] items-center justify-center bg-[var(--background-color)] px-6 py-16 sm:py-24">
        <div className="w-full max-w-5xl">
          <div className="rounded-[32px] border border-gray-100/80 bg-white/90 shadow-xl backdrop-blur-sm">
            <div className="p-6 sm:p-10">{renderContent()}</div>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--color-blue)] py-8 text-white/80">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm tracking-wide !text-white">
            Todos os direitos reservados © {new Date().getFullYear()} {" "}
            <span className="font-semibold text-[var(--secondary-color)]">Advance+</span>
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
