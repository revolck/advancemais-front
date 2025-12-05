"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtividadeSectionProps {
  title: string;
  items: string[];
  variant: "principal" | "extra";
}

function AtividadeSection({ title, items, variant }: AtividadeSectionProps) {
  const styles = {
    principal: {
      badge: "bg-indigo-50 text-indigo-700",
      dot: "bg-indigo-500",
      check: "text-indigo-600",
    },
    extra: {
      badge: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      check: "text-amber-600",
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

export function AtividadesTab({ vaga }: AboutTabProps) {
  const principais = vaga.atividades?.principais ?? [];
  const extras = vaga.atividades?.extras ?? [];

  const hasPrincipais = principais.length > 0;
  const hasExtras = extras.length > 0;
  const hasAtividades = hasPrincipais || hasExtras;

  if (!hasAtividades) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de atividades vazias"
          title="Atividades não definidas"
          description="Esta vaga ainda não possui atividades definidas."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <div className="space-y-8">
        {hasPrincipais && (
          <AtividadeSection
            title="Atividades Principais"
            items={principais}
            variant="principal"
          />
        )}

        {hasPrincipais && hasExtras && (
          <div className="border-t border-gray-100" />
        )}

        {hasExtras && (
          <AtividadeSection
            title="Atividades Extras"
            items={extras}
            variant="extra"
          />
        )}
      </div>
    </div>
  );
}
