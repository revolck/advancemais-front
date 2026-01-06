"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";
import { PENDING_CURSOS_PAYMENT_KEY } from "@/theme/dashboard/components/admin/pagamentos-cursos";

export default function PagamentosCursosSucessoPage() {
  const searchParams = useSearchParams();
  const [returnTo, setReturnTo] = useState<string>("/dashboard");

  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("collection_id") ||
    searchParams.get("paymentId");
  const status = searchParams.get("status") || searchParams.get("collection_status");

  useEffect(() => {
    const fromQuery = searchParams.get("returnTo");
    if (fromQuery) {
      setReturnTo(fromQuery);
      return;
    }
    try {
      const raw = localStorage.getItem(PENDING_CURSOS_PAYMENT_KEY);
      const parsed = raw ? (JSON.parse(raw) as any) : null;
      if (parsed?.returnTo) setReturnTo(String(parsed.returnTo));
    } catch {
      // ignore
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      localStorage.removeItem(PENDING_CURSOS_PAYMENT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const title = useMemo(() => {
    if (status && status !== "approved") return "Pagamento recebido";
    return "Pagamento aprovado";
  }, [status]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
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
                Prova de recuperação final
              </h1>
              <p className="mt-2 text-sm text-white/85">
                Assim que a aprovação for confirmada, sua prova será liberada.
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                <div className="text-xs font-semibold uppercase text-zinc-500">
                  Próximo passo
                </div>
                <div className="mt-1 text-base font-semibold text-zinc-900">
                  Voltar e acessar a prova
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  Caso o boleto esteja pendente, a liberação ocorre após compensação.
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
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Ir para o Dashboard
              </Link>

              <ButtonCustom asChild variant="default" className="rounded-full">
                <a href={returnTo}>Voltar</a>
              </ButtonCustom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

