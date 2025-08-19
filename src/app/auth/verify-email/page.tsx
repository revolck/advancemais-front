"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { toastCustom } from "@/components/ui/custom/toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error">("loading");

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
        toastCustom.success("Conta confirmada com sucesso");
        router.push("https://auth.advancemais.com/login");
      } catch (err) {
        setStatus("error");
      }
    }
    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground gap-6">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Verificando seu email...</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium">Token inválido ou expirado.</p>
          <a
            href="https://auth.advancemais.com/login"
            className="px-4 py-2 rounded-md bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue)]/90 cursor-pointer"
          >
            Voltar ao login
          </a>
        </div>
      )}
    </div>
  );
}
