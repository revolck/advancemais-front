"use client";

import { useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";

import { getUserProfile } from "@/api/usuarios";
import type { UsuarioProfileResponse } from "@/api/usuarios/types";
import { redirectToPrimeiroAcesso } from "@/lib/primeiro-acesso";

/**
 * Usuário com senha provisória não usa o painel até criar a própria senha:
 * em vez do conteúdo (e dos modais/controllers globais), redireciona para
 * a página de primeiro acesso.
 */
export function PasswordChangeGate({ children }: { children: ReactNode }) {
  const { data: profileResponse } = useQuery<UsuarioProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getUserProfile();
      if (
        !response ||
        !("success" in response) ||
        response.success !== true ||
        !("usuario" in response) ||
        !("stats" in response)
      ) {
        throw new Error("Erro ao carregar perfil");
      }
      return response as UsuarioProfileResponse;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const precisaTrocarSenha = Boolean(
    profileResponse?.usuario?.precisaTrocarSenha,
  );

  useEffect(() => {
    if (precisaTrocarSenha) {
      redirectToPrimeiroAcesso();
    }
  }, [precisaTrocarSenha]);

  if (precisaTrocarSenha) {
    return (
      <div
        className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-white text-center"
        role="status"
        aria-live="polite"
      >
        <KeyRound
          className="h-10 w-10 text-[var(--primary-color)]"
          aria-hidden
        />
        <p className="!mb-0 font-medium">Crie sua nova senha para continuar…</p>
      </div>
    );
  }

  return <>{children}</>;
}
