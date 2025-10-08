"use client";

import { cn } from "@/lib/utils";

export function VacancyUsageCard({
  published,
  total,
  statusCounts,
}: {
  published: number;
  total: number;
  statusCounts: {
    rascunho: number;
    emAnalise: number;
    publicado: number;
    despublicada: number;
    pausada: number;
    encerrada: number;
    expirado: number;
  };
}) {
  const percent =
    total > 0 ? Math.min(100, Math.round((published / total) * 100)) : 0;
  const remaining = Math.max(total - published, 0);
  const tone = percent >= 80 ? "success" : percent >= 40 ? "warning" : "danger";
  const palette: Record<string, { bar: string; chip: string }> = {
    success: {
      bar: "from-emerald-400 to-emerald-500",
      chip: "bg-emerald-100 text-emerald-700",
    },
    warning: {
      bar: "from-amber-300 to-amber-500",
      chip: "bg-amber-100 text-amber-700",
    },
    danger: {
      bar: "from-rose-300 to-rose-500",
      chip: "bg-rose-100 text-rose-600",
    },
  };
  const colors = palette[tone];

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <h3>Uso de vagas</h3>
      <div className="mt-4 rounded-2xl border border-gray-200/60 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            <span className="font-semibold text-gray-600">
              Em análise/Publicadas:
            </span>{" "}
            {published}
          </span>
          <span>
            <span className="font-semibold text-gray-600">Restantes:</span>{" "}
            {remaining}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/90">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-300",
                colors.bar
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              colors.chip
            )}
          >
            {percent}%
          </span>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Limite do plano: {total > 0 ? total : "—"}
        </div>
      </div>

      {/* Resumo por status */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Resumo por status
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-gray-50/60 px-3 py-2">
            <span className="font-medium text-gray-600">Em análise</span>
            <span className="text-gray-500">{statusCounts.emAnalise}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-gray-50/60 px-3 py-2">
            <span className="font-medium text-gray-600">Publicadas</span>
            <span className="text-gray-500">{statusCounts.publicado}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-gray-50/60 px-3 py-2">
            <span className="font-medium text-gray-600">Pausadas</span>
            <span className="text-gray-500">{statusCounts.pausada}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-gray-50/60 px-3 py-2">
            <span className="font-medium text-gray-600">Encerradas</span>
            <span className="text-gray-500">{statusCounts.encerrada}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200/60 bg-gray-50/60 px-3 py-2">
            <span className="font-medium text-gray-600">Expiradas</span>
            <span className="text-gray-500">{statusCounts.expirado}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
