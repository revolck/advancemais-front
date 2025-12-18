"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";
import { FormLoadingModal, EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [loadingStep, setLoadingStep] = useState<string>("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        setLoadingStep("Validando token...");
        await apiFetch(usuarioRoutes.verification.verify(token), {
          cache: "no-cache",
        });
        setLoadingStep("Confirmando conta...");
        toastCustom.success("Conta confirmada com sucesso");
        setLoadingStep("Redirecionando...");
        router.push("https://auth.advancemais.com/login");
      } catch (err) {
        setStatus("error");
        setLoadingStep("");
      }
    }
    verify();
  }, [token, router]);

  return (
    <div className="min-h-[100dvh] w-full bg-white font-geist flex flex-col">
      <FormLoadingModal
        isLoading={status === "loading"}
        title="Verificando seu email..."
        loadingStep={loadingStep || "Processando"}
        icon={Mail}
      />

      {/* Header com logo centralizada */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-center">
          <Image
            src="/images/logos/logo_padrao.webp"
            alt="Logo"
            width={120}
            height={40}
            priority
            className="object-contain"
          />
        </div>
      </header>

      <main className="flex-1">
        <section className="flex items-center justify-center px-4 py-18">
          <div className="w-full max-w-5xl">
            {status === "error" && (
              <EmptyState
                illustration="fileNotFound"
                illustrationAlt="Token inválido ou expirado"
                title="Token inválido ou expirado"
                description="O link de verificação não é válido ou já expirou. Por favor, solicite um novo link de verificação ou entre em contato com o suporte se o problema persistir."
                maxContentWidth="md"
                actions={
                  <ButtonCustom
                    asChild
                    variant="primary"
                    size="lg"
                    withAnimation
                    className="inline-flex items-center gap-2"
                  >
                    <Link href="https://auth.advancemais.com/login">
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao login
                    </Link>
                  </ButtonCustom>
                }
              />
            )}
          </div>
        </section>
      </main>

      {/* Footer minimalista */}
      <footer className="bg-[var(--color-blue)] text-white/80 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3">
          <p className="sm:text-sm tracking-wide !text-white">
            Todos os direitos reservados © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--secondary-color)]">
              Advance+
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center text-[12px] sm:text-sm text-white/80">
            <a
              href="/politica-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Política de Privacidade
            </a>
            <span
              className="h-4 w-px bg-blue-800/50 self-center"
              aria-hidden
            ></span>
            <a
              href="/termos-uso"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Termos de Uso
            </a>
            <span
              className="h-4 w-px bg-blue-800/20 self-center"
              aria-hidden
            ></span>
            <a
              href="/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors px-3"
            >
              Preferências de Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
