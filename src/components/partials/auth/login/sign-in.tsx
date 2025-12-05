"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { InputCustom, ButtonCustom } from "@/components/ui/custom";
import { Checkbox } from "@/components/ui/radix-checkbox";
import Image from "next/image";

// --- TYPE DEFINITIONS ---

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  heroImageLink?: string;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  /**
   * Estado de carregamento externo, usado para bloquear o botão enquanto a
   * requisição de login está em andamento.
   */
  isLoading?: boolean;
}

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-light text-foreground tracking-tighter">Welcome</span>
  ),
  description,
  heroImageSrc,
  heroImageLink,
  onSignIn,
  onResetPassword,
  onCreateAccount,
  isLoading = false,
}) => {
  const [documento, setDocumento] = useState("");
  const [senha, setSenha] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Estado interno de submissão - controlado pelo componente pai via isLoading
  // Não resetamos automaticamente aqui - o pai controla quando desbloquear
  const isSubmitting = isLoading;

  // Determina se é CPF (11 dígitos) ou CNPJ (14 dígitos)
  const documentoDigits = documento.replace(/\D/g, "");

  // Validação do formulário
  const isFormValid =
    (documentoDigits.length === 11 || documentoDigits.length === 14) &&
    senha.length > 0;

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="animate-element animate-delay-50 flex justify-center mb-4">
              <Image
                src="/images/logos/logo_padrao.webp"
                alt="Logo"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </div>

            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-center">
              {title}
            </h1>
            {description && (
              <p className="animate-element animate-delay-200 text-muted-foreground text-center">
                {description}
              </p>
            )}

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSignIn?.(e);
              }}
            >
              <div className="animate-element animate-delay-300 space-y-1">
                <Label
                  htmlFor="documento"
                  className="required text-sm font-medium text-muted-foreground"
                >
                  CPF ou CNPJ
                </Label>
                <InputCustom
                  label=""
                  id="documento"
                  name="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  mask="cpfCnpj"
                  placeholder="Digite seu CPF ou CNPJ"
                  required
                  size="md"
                  className="bg-foreground/5 rounded-sm"
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="animate-element animate-delay-400 space-y-1">
                <Label
                  htmlFor="senha"
                  className="required text-sm font-medium text-muted-foreground"
                >
                  Senha
                </Label>
                <InputCustom
                  label=""
                  id="senha"
                  name="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  showPasswordToggle
                  required
                  size="md"
                  className="bg-foreground/5 rounded-sm"
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v === true)}
                    className="cursor-pointer bg-gray-200"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-foreground/90 cursor-pointer"
                  >
                    Me mantenha conectado
                  </Label>
                </div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetPassword?.();
                  }}
                  className="hover:text-gray-800 transition-colors text-muted-foreground cursor-pointer"
                >
                  Recuperar senha
                </a>
              </div>

              <input
                type="hidden"
                name="rememberMe"
                value={rememberMe ? "true" : "false"}
              />

              <ButtonCustom
                type="submit"
                isLoading={isLoading || isSubmitting}
                disabled={!isFormValid || isSubmitting || isLoading}
                fullWidth
                size="lg"
                variant="primary"
                withAnimation
              >
                Entrar
              </ButtonCustom>
            </form>

            <p className="animate-element animate-delay-700 text-center text-sm text-muted-foreground">
              Novo na plataforma?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCreateAccount?.();
                }}
                className="hover:opacity-100 transition-colors text-[var(--primary-color)] cursor-pointer opacity-70"
              >
                Crie sua conta
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          {heroImageLink ? (
            <a
              href={heroImageLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <div
                className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageSrc})` }}
              ></div>
            </a>
          ) : (
            <div
              className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImageSrc})` }}
            ></div>
          )}
        </section>
      )}
    </div>
  );
};
