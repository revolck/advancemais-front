"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        await apiFetch(usuarioRoutes.verification.verify(token), {
          cache: "no-cache",
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    }
    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground gap-6">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Verificando seu email...</p>
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium">Email verificado com sucesso!</p>
          <a
            href="/auth/login"
            className="px-4 py-2 rounded-md bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue)]/90 cursor-pointer"
          >
            Ir para login
          </a>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium">Token inválido ou expirado.</p>
          <a
            href="/auth/login"
            className="px-4 py-2 rounded-md bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue)]/90 cursor-pointer"
          >
            Voltar ao login
          </a>
        </div>
      )}
    </div>
  );
}
