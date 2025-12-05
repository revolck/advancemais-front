"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequisitoSectionProps {
  title: string;
  items: string[];
  variant: "obrigatorio" | "desejavel";
}

function RequisitoSection({ title, items, variant }: RequisitoSectionProps) {
  const styles = {
    obrigatorio: {
      badge: "bg-slate-100 text-slate-700",
      dot: "bg-slate-600",
      check: "text-slate-600",
    },
    desejavel: {
      badge: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      check: "text-emerald-600",
    },
  };

  const style = styles[variant];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("w-2 h-2 rounded-full", style.dot)} />
        <h4 className="!text-sm !font-medium !text-gray-900 !mb-0">{title}</h4>
        <span
          className={cn(
            "ml-auto px-2 py-0.5 rounded text-xs font-medium",
            style.badge,
          )}
        >
          {items.length}
        </span>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Check className={cn("h-4 w-4 mt-0.5 shrink-0", style.check)} />
            <p className="!text-sm !text-gray-700 !mb-0 !leading-relaxed">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RequisitosTab({ vaga }: AboutTabProps) {
  const obrigatorios = vaga.requisitos?.obrigatorios ?? [];
  const desejaveis = vaga.requisitos?.desejaveis ?? [];

  const hasObrigatorios = obrigatorios.length > 0;
  const hasDesejaveis = desejaveis.length > 0;
  const hasRequisitos = hasObrigatorios || hasDesejaveis;

  if (!hasRequisitos) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de requisitos vazios"
          title="Requisitos não definidos"
          description="Esta vaga ainda não possui requisitos definidos."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <div className="space-y-8">
        {hasObrigatorios && (
          <RequisitoSection
            title="Obrigatórios"
            items={obrigatorios}
            variant="obrigatorio"
          />
        )}

        {hasObrigatorios && hasDesejaveis && (
          <div className="border-t border-gray-100" />
        )}

        {hasDesejaveis && (
          <RequisitoSection
            title="Desejáveis"
            items={desejaveis}
            variant="desejavel"
          />
        )}
      </div>
    </div>
  );
}
