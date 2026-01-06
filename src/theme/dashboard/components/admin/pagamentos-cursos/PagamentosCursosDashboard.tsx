"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldAlert, Clock } from "lucide-react";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { createSinglePayment } from "@/api/mercadopago";
import { getUserProfile } from "@/api/usuarios";
import { cn } from "@/lib/utils";

const PENDING_CURSOS_PAYMENT_KEY = "pending_dashboard_cursos_payment_v1";

type PaymentContext = {
  tipo: "recuperacao-final";
  titulo?: string | null;
  valor: number;
  cursoId?: string | null;
  turmaId?: string | null;
  provaId?: string | null;
  notificacaoId?: string | null;
  returnTo?: string | null;
  createdAt: number;
};

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie?.split("=")[1] || null;
}

function readNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function PagamentosCursosDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isStarting, setIsStarting] = useState(false);

  const context = useMemo<PaymentContext>(() => {
    const tipo =
      (searchParams.get("tipo") as PaymentContext["tipo"] | null) ??
      "recuperacao-final";

    const titulo = searchParams.get("titulo");
    const valor = readNumber(searchParams.get("valor"), 50);

    return {
      tipo,
      titulo,
      valor,
      cursoId: searchParams.get("cursoId"),
      turmaId: searchParams.get("turmaId"),
      provaId: searchParams.get("provaId"),
      notificacaoId: searchParams.get("notificacaoId"),
      returnTo: searchParams.get("returnTo"),
      createdAt: Date.now(),
    };
  }, [searchParams]);

  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(context.valor);
  }, [context.valor]);

  const pageTitle = useMemo(() => {
    if (context.tipo === "recuperacao-final") return "Pagamento • Recuperação final";
    return "Pagamento";
  }, [context.tipo]);

  const handleStartPayment = useCallback(async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      const token = getCookieValue("token");
      if (!token) {
        const redirect = `${window.location.pathname}${window.location.search}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
        setIsStarting(false);
        return;
      }

      const profile = await getUserProfile();
      if (!profile?.success || !("usuario" in profile)) {
        throw new Error("Não foi possível identificar o usuário.");
      }

      const userId = profile.usuario?.id;
      if (!userId) throw new Error("Usuário inválido.");

      const baseUrl = window.location.origin;
      const returnTo = context.returnTo || "/dashboard";
      const queryReturnTo = `?returnTo=${encodeURIComponent(returnTo)}`;

      const externalReferenceParts = [
        `tipo:${context.tipo}`,
        context.cursoId ? `curso:${context.cursoId}` : null,
        context.turmaId ? `turma:${context.turmaId}` : null,
        context.provaId ? `prova:${context.provaId}` : null,
        context.notificacaoId ? `notificacao:${context.notificacaoId}` : null,
        `aluno:${userId}`,
      ].filter(Boolean) as string[];

      const title =
        context.titulo?.trim() || "Prova de recuperação final (pagamento único)";

      localStorage.setItem(PENDING_CURSOS_PAYMENT_KEY, JSON.stringify(context));

      const response = await createSinglePayment(
        {
          usuarioId: userId,
          items: [
            {
              id:
                context.provaId ||
                context.turmaId ||
                context.cursoId ||
                "recuperacao-final",
              title,
              description:
                context.tipo === "recuperacao-final"
                  ? "Liberação de prova de recuperação final (pagamento único)"
                  : "Pagamento único",
              quantity: 1,
              unit_price: context.valor,
              currency_id: "BRL",
            },
          ],
          successUrl: `${baseUrl}/dashboard/cursos/pagamentos/sucesso${queryReturnTo}`,
          failureUrl: `${baseUrl}/dashboard/cursos/pagamentos/falha${queryReturnTo}`,
          pendingUrl: `${baseUrl}/dashboard/cursos/pagamentos/pendente${queryReturnTo}`,
          externalReference: externalReferenceParts.join(":"),
          metadata: {
            tipo: context.tipo,
            cursoId: context.cursoId,
            turmaId: context.turmaId,
            provaId: context.provaId,
            notificacaoId: context.notificacaoId,
            returnTo,
          },
        },
        token
      );

      if (!response?.initPoint) {
        throw new Error("Não foi possível iniciar o pagamento.");
      }

      window.location.href = response.initPoint;
    } catch (error: any) {
      toastCustom.error({
        title: "Erro ao iniciar pagamento",
        description:
          error?.message || "Não foi possível iniciar o pagamento. Tente novamente.",
      });
      setIsStarting(false);
    }
  }, [context, isStarting, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-600">
            Pagamento único via Mercado Pago (Pix, boleto ou cartão).
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-gray-200/80 bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {context.titulo?.trim() || "Recuperação final"}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Para alunos com média abaixo de 7. Após a aprovação, a prova é liberada
                automaticamente.
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 text-amber-800 px-3 py-2 text-xs font-semibold">
              {formattedAmount}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CreditCard className="h-4 w-4 text-gray-600" />
                Cartão
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Crédito ou débito (via Checkout Pro).
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pix
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Confirmação rápida, geralmente em minutos.
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock className="h-4 w-4 text-amber-600" />
                Boleto
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Pode levar até 2 dias úteis para compensar.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <ButtonCustom
              variant="ghost"
              onClick={() => router.push(context.returnTo || "/dashboard")}
              disabled={isStarting}
            >
              Voltar
            </ButtonCustom>
            <ButtonCustom
              variant="primary"
              onClick={handleStartPayment}
              disabled={isStarting}
              icon={isStarting ? "Loader2" : "CreditCard"}
              className={cn(isStarting && "[&_svg]:animate-spin")}
            >
              Pagar agora
            </ButtonCustom>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 space-y-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-gray-700 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Importante
              </div>
              <div className="text-xs text-gray-600">
                Guarde o identificador do pagamento caso precise de suporte.
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            A liberação pode ocorrer imediatamente (Pix/cartão) ou após compensação
            (boleto).
          </div>
        </div>
      </div>
    </div>
  );
}

export { PENDING_CURSOS_PAYMENT_KEY };
