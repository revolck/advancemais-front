"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, GraduationCap, Lock, ArrowLeft } from "lucide-react";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { getUserProfile } from "@/api/usuarios";
import { createInscricao } from "@/api/cursos";
import { PENDING_COURSE_PURCHASE_KEY } from "@/lib/pending-storage-keys";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie?.split("=")[1] || null;
}

type PendingCoursePurchase = {
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  valor: number;
  createdAt: number;
};

export default function CheckoutCursoSucessoPage() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingCoursePurchase | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(true);

  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    searchParams.get("paymentId");
  const status = searchParams.get("status") || searchParams.get("collection_status");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_COURSE_PURCHASE_KEY);
      if (!raw) {
        setPending(null);
        setIsFinalizing(false);
        return;
      }
      setPending(JSON.parse(raw));
    } catch {
      setPending(null);
    } finally {
      setIsFinalizing(false);
    }
  }, []);

  const title = useMemo(() => {
    if (status && status !== "approved") return "Compra recebida";
    return "Compra aprovada";
  }, [status]);

  useEffect(() => {
    const finalize = async () => {
      if (!pending) return;

      const token = getCookieValue("token");
      if (!token) return;

      try {
        const profile = await getUserProfile(token);
        if (!profile?.success || !("usuario" in profile)) return;
        const userId = (profile.usuario as any)?.id as string | undefined;
        if (!userId) return;

        await createInscricao(pending.cursoId, pending.turmaId, { alunoId: userId });

        toastCustom.success({
          title: "Matrícula confirmada",
          description: "Seu acesso foi liberado. Você já pode entrar na Academia.",
        });

        localStorage.removeItem(PENDING_COURSE_PURCHASE_KEY);
      } catch {
        // Evita bloquear a tela se a matrícula já existir ou se o backend finalizar via webhook.
      }
    };

    finalize();
  }, [pending]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden">
          <div className="px-6 sm:px-8 py-10 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                {title}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
                Acesso liberado para sua turma
              </h1>
              <p className="mt-2 text-sm text-white/85">
                {pending
                  ? `${pending.cursoNome} • ${pending.turmaNome}`
                  : "Sua compra foi concluída com sucesso."}
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-6">
            {isFinalizing ? (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-700 flex items-start gap-3">
                <Lock className="h-5 w-5 mt-0.5 text-zinc-500" />
                <div>
                  <div className="font-semibold">Finalizando matrícula…</div>
                  <div className="text-zinc-600">
                    Estamos liberando seu acesso. Você pode continuar navegando.
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                <div className="text-xs font-semibold uppercase text-zinc-500">
                  Próximo passo
                </div>
                <div className="mt-1 text-base font-semibold text-zinc-900">
                  Acessar a Academia
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  Sua turma fica disponível no seu painel de estudos.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                <div className="text-xs font-semibold uppercase text-zinc-500">
                  Identificador
                </div>
                <div className="mt-1 text-base font-semibold text-zinc-900">
                  {paymentId || "—"}
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  Guarde para suporte, se precisar.
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para cursos
              </Link>

              <ButtonCustom asChild variant="default" className="rounded-full">
                <a href="/academia">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Ir para Academia
                </a>
              </ButtonCustom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
