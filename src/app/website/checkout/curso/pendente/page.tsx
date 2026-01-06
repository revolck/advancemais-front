"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { ButtonCustom } from "@/components/ui/custom";

const PENDING_COURSE_PURCHASE_KEY = "pending_course_purchase_v1";

type PendingCoursePurchase = {
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  valor: number;
  createdAt: number;
};

export default function CheckoutCursoPendentePage() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingCoursePurchase | null>(null);

  const status = searchParams.get("status") || searchParams.get("collection_status");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_COURSE_PURCHASE_KEY);
      setPending(raw ? JSON.parse(raw) : null);
    } catch {
      setPending(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-200/40 overflow-hidden">
          <div className="px-6 sm:px-8 py-10 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Clock className="h-10 w-10" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Pagamento em processamento
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
                Estamos aguardando confirmação
              </h1>
              <p className="mt-2 text-sm text-white/85">
                {pending
                  ? `${pending.cursoNome} • ${pending.turmaNome}`
                  : "Assim que for aprovado, seu acesso será liberado."}
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-6">
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-700">
              {status ? (
                <div>
                  Status: <span className="font-semibold">{status}</span>
                </div>
              ) : (
                "A confirmação pode levar alguns minutos (PIX) ou até 2 dias úteis (boleto)."
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para cursos
              </Link>

              <ButtonCustom asChild variant="default" className="rounded-full">
                <a href="/academia">Ir para Academia</a>
              </ButtonCustom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

