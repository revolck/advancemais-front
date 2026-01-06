"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import { PENDING_CURSOS_PAYMENT_KEY } from "@/theme/dashboard/components/admin/pagamentos-cursos";

export default function PagamentosCursosFalhaPage() {
  const searchParams = useSearchParams();
  const [returnTo, setReturnTo] = useState<string>("/dashboard");
  const [retryHref, setRetryHref] = useState<string>("/dashboard/cursos/pagamentos");

  const statusDetail =
    searchParams.get("status_detail") || searchParams.get("statusDetail");

  useEffect(() => {
    const fromQuery = searchParams.get("returnTo");
    if (fromQuery) setReturnTo(fromQuery);

    try {
      const raw = localStorage.getItem(PENDING_CURSOS_PAYMENT_KEY);
      const parsed = raw ? (JSON.parse(raw) as any) : null;
      if (parsed?.returnTo) setReturnTo(String(parsed.returnTo));
      if (parsed?.tipo) {
        const sp = new URLSearchParams();
        sp.set("tipo", String(parsed.tipo));
        if (parsed?.titulo) sp.set("titulo", String(parsed.titulo));
        if (parsed?.valor) sp.set("valor", String(parsed.valor));
        if (parsed?.cursoId) sp.set("cursoId", String(parsed.cursoId));
        if (parsed?.turmaId) sp.set("turmaId", String(parsed.turmaId));
        if (parsed?.provaId) sp.set("provaId", String(parsed.provaId));
        if (parsed?.notificacaoId) sp.set("notificacaoId", String(parsed.notificacaoId));
        if (parsed?.returnTo) sp.set("returnTo", String(parsed.returnTo));
        setRetryHref(`/dashboard/cursos/pagamentos?${sp.toString()}`);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const reason = useMemo(() => {
    if (!statusDetail) return null;
    return String(statusDetail);
  }, [statusDetail]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden">
          <div className="px-6 sm:px-8 py-10 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <XCircle className="h-10 w-10" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Não foi possível concluir
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
                Falha no pagamento
              </h1>
              <p className="mt-2 text-sm text-white/85">
                Tente novamente ou escolha outro método.
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-6">
            {reason ? (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-700">
                Detalhe: <span className="font-semibold">{reason}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Ir para o Dashboard
              </Link>

              <div className="flex flex-col sm:flex-row gap-2">
                <ButtonCustom asChild variant="ghost" className="rounded-full">
                  <a href={returnTo}>Voltar</a>
                </ButtonCustom>
                <ButtonCustom asChild variant="default" className="rounded-full">
                  <a href={retryHref}>Tentar novamente</a>
                </ButtonCustom>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

