import { AlertTriangle, Sparkles } from "lucide-react";

import type { PremiumResourcesNoticeProps } from "../types";

export function PremiumResourcesNotice({
  isActive,
}: PremiumResourcesNoticeProps) {
  if (isActive) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-0">
            <p className="!mb-0 !font-semibold">Impacto da remoção</p>
            <p className="!mb-0 !text-sm">
              As vagas publicadas serao retiradas do ar, todos os destaques
              ativos serão removidos e a empresa voltará a depender das regras
              normais de plano.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-0">
          <p className="!mb-0 !font-semibold">O que sera liberado</p>
          <p className="!mb-0 !text-sm">
            A empresa podera criar vagas e destaques ilimitados, inclusive sem
            plano comercial ativo. A assinatura e a cobranca nao serao
            alteradas.
          </p>
        </div>
      </div>
    </div>
  );
}
