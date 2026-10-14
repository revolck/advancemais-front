"use client";

import React from "react";
import { Building2, GraduationCap, Lock, Megaphone } from "lucide-react";

import { UserRole } from "@/config/roles";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { BonificacaoInauguracaoAdminCard } from "./BonificacaoInauguracaoAdminCard";
import { ComunicadoPrimeiroAcessoPanel } from "./ComunicadoPrimeiroAcessoPanel";

type Publico = "alunos" | "empresas";

const PUBLICOS: { valor: Publico; rotulo: string; Icone: typeof Megaphone }[] = [
  { valor: "alunos", rotulo: "Alunos", Icone: GraduationCap },
  { valor: "empresas", rotulo: "Empresas", Icone: Building2 },
];

/**
 * Aba "Comunicado" das configurações: só administrador e moderador chegam aqui
 * (rota e aba). A parte de empresas (mês grátis) é só do administrador.
 */
export function ComunicadoTab() {
  const role = useUserRole();
  const isAdmin = role === UserRole.ADMIN;
  const [publico, setPublico] = React.useState<Publico>("alunos");
  // O papel vem do cookie: só existe no navegador (evita divergência na hidratação)
  const [montado, setMontado] = React.useState(false);
  React.useEffect(() => setMontado(true), []);
  const mostrarEmpresas = isAdmin && publico === "empresas";

  if (!montado) return null;
  if (role !== UserRole.ADMIN && role !== UserRole.MODERADOR) return null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 sm:gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-color)] text-white shadow-sm sm:size-12">
            <Megaphone className="size-5 sm:size-6" />
          </span>
          <div className="min-w-0">
            <div className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">
              Comunicado da nova plataforma
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Acompanhe o primeiro acesso de quem veio da plataforma antiga.
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
              <Lock className="size-3" />
              Visível só para administradores e moderadores
            </span>
          </div>
        </div>

        {isAdmin ? (
          <div
            role="tablist"
            aria-label="Público do comunicado"
            className="grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1 sm:w-auto sm:min-w-[280px]"
          >
            {PUBLICOS.map(({ valor, rotulo, Icone }) => {
              const ativo = publico === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  role="tab"
                  id={`comunicado-tab-${valor}`}
                  aria-selected={ativo}
                  aria-controls={`comunicado-painel-${valor}`}
                  onClick={() => setPublico(valor)}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                    ativo
                      ? "bg-white text-[var(--primary-color)] shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  <Icone className="size-4" />
                  {rotulo}
                </button>
              );
            })}
          </div>
        ) : null}
      </header>

      <div
        role={isAdmin ? "tabpanel" : undefined}
        id={`comunicado-painel-${mostrarEmpresas ? "empresas" : "alunos"}`}
        aria-labelledby={
          isAdmin ? `comunicado-tab-${mostrarEmpresas ? "empresas" : "alunos"}` : undefined
        }
      >
        {mostrarEmpresas ? (
          <BonificacaoInauguracaoAdminCard />
        ) : (
          <ComunicadoPrimeiroAcessoPanel />
        )}
      </div>
    </div>
  );
}
