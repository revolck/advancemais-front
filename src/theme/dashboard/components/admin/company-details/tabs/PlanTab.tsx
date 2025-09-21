"use client";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/custom";
import type { PlanTabProps } from "../types";
import { CreditCard } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime, formatPaymentStatus, getPaymentStatusBadgeClasses } from "../utils";
import { paymentStatusBadgeBaseClasses } from "../utils/formatters";

export function PlanTab({ isCompanyActive, plan, payment, payments }: PlanTabProps) {
  const planExists = Boolean(
    plan && (plan.nome || plan.valor || plan.tipo || plan.modeloPagamento || plan.metodoPagamento || plan.inicio || plan.fim)
  );

  const planTypeLabel = plan?.tipo ? (plan.tipo === "parceiro" ? "Parceiro" : plan.tipo) : null;
  const nextChargeLabel = formatDate(plan?.fim);
  const paymentMethodLabel = payment?.metodo ?? plan?.metodoPagamento ?? null;
  const planStartLabel = formatDate(plan?.inicio);
  const planCardTypeLabel = planTypeLabel || "Assinatura";
  const planCardStatusLabel = isCompanyActive ? "Ativo" : "Inativo";
  const planCardStatusClasses = isCompanyActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700";
  const planCardDetails: { label: string; value: string }[] = [
    { label: "Início do plano", value: planStartLabel },
    { label: "Próxima cobrança", value: nextChargeLabel },
    { label: "Dias restantes", value: plan?.diasRestantes != null ? `${plan.diasRestantes} dias` : "—" },
    { label: "Método de pagamento", value: paymentMethodLabel ?? "—" },
  ];

  const recentPayments = payments.slice(0, 3);

  const planMainSection = planExists ? (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
        <div className="absolute inset-0" />
        <div className="relative flex justify-center p-6 md:p-8">
          <div className="relative flex w-full flex-col overflow-hidden text-slate-900">
            <div className="pointer-events-none absolute inset-y-4 right-4 w-32 rounded-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="!text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 !mb-1">{planCardTypeLabel}</p>
                  <div className="space-y-2">
                    <h4 className="!mb-0">{plan?.nome ?? "Plano não informado"}</h4>
                    <h4 className="!text-[1.75rem] !font-bold !leading-none !text-green-900">{plan?.valor ? formatCurrency(plan.valor) : "R$ —"}</h4>
                  </div>
                  <span className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide", planCardStatusClasses)}>
                    {planCardStatusLabel}
                  </span>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-white">
                  <CreditCard className="h-5 w-5" />
                </span>
              </div>

              <dl className="space-y-2 text-sm">
                {planCardDetails.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-gray-600">{item.label}</dt>
                    <dd className="text-sm text-gray-600">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <EmptyState
      illustration="companyDetails"
      illustrationAlt="Ilustração de informações de assinatura"
      title="Plano não informado"
      description="Ainda não identificamos um plano ativo para esta empresa. Assim que houver uma assinatura, os detalhes aparecerão aqui."
      maxContentWidth="sm"
      className="rounded-2xl border border-gray-200/60 bg-white p-6"
    />
  );

  const planSidebar = (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3>Histórico recente</h3>
        {recentPayments.length > 0 ? (
          <ol className="mt-4 space-y-3">
            {recentPayments.map((log) => (
              <li key={log.id} className="rounded-2xl border border-gray-200/70 bg-gray-50/80 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">{formatDateTime(log.criadoEm)}</span>
                  <span className={cn(paymentStatusBadgeBaseClasses, getPaymentStatusBadgeClasses(log.status))}>
                    {formatPaymentStatus(log.status)}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  {log.plano?.nome && (
                    <div>
                      Plano: <span className="font-medium text-gray-600">{log.plano.nome}</span>
                    </div>
                  )}
                  {log.tipo && (
                    <div>
                      Método: <span className="font-medium text-gray-600">{log.tipo}</span>
                    </div>
                  )}
                  {log.mensagem && (
                    <div>
                      Detalhe: <span className="font-medium text-gray-600">{log.mensagem}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Nenhum pagamento registrado.</p>
        )}
      </div>
    </aside>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      {planMainSection}
      {planSidebar}
    </div>
  );
}
