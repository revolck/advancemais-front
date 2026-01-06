"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
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

export default function CheckoutCursoFalhaPage() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingCoursePurchase | null>(null);

  const statusDetail =
    searchParams.get("status_detail") || searchParams.get("statusDetail");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_COURSE_PURCHASE_KEY);
      setPending(raw ? JSON.parse(raw) : null);
    } catch {
      setPending(null);
    }
  }, []);

  const backToCourseHref = useMemo(() => {
    if (!pending?.cursoId) return "/cursos";
    return `/cursos/${encodeURIComponent(pending.cursoId)}#turmas`;
  }, [pending?.cursoId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/70 via-white to-zinc-50 flex items-center justify-center p-4 sm:p-8">
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
                {pending
                  ? `${pending.cursoNome} • ${pending.turmaNome}`
                  : "Tente novamente ou escolha outra turma."}
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-8 space-y-6">
            {statusDetail ? (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-700">
                Detalhe: <span className="font-semibold">{statusDetail}</span>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para cursos
              </Link>

              <ButtonCustom asChild variant="default" className="rounded-full">
                <a href={backToCourseHref}>Tentar novamente</a>
              </ButtonCustom>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

