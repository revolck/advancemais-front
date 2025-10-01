"use client";

import Link from "next/link";

import { ButtonCustom, EmptyState } from "@/components/ui/custom";

export default function EmpresaAssinaturaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Assinatura</h1>
        <p className="text-sm text-slate-600">
          Consulte o status do seu plano e gerencie atualizações de assinatura.
        </p>
      </div>

      <EmptyState
        illustration="subscription"
        title="Recursos da assinatura em breve"
        description="Aqui você poderá acompanhar detalhes do plano atual, histórico de pagamentos e realizar upgrades."
        actions={
          <ButtonCustom variant="primary" size="md" asChild icon="Sparkles">
            <Link href="/contato">Fale com o nosso time</Link>
          </ButtonCustom>
        }
      />
    </div>
  );
}
