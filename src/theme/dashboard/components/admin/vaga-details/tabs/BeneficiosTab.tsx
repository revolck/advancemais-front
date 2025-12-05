"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";
import { Check, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export function BeneficiosTab({ vaga }: AboutTabProps) {
  const beneficios = vaga.beneficios?.lista ?? [];
  const observacoes = vaga.beneficios?.observacoes?.trim() ?? "";

  const hasBeneficios = beneficios.length > 0;
  const hasObservacoes = observacoes.length > 0;

  if (!hasBeneficios) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de benefícios vazios"
          title="Benefícios não definidos"
          description="Esta vaga ainda não possui benefícios definidos."
          maxContentWidth="md"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <div className="space-y-8">
        {/* Lista de Benefícios */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <h4 className="!text-sm !font-medium !text-gray-900 !mb-0">
              Benefícios Oferecidos
            </h4>
            <span className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700">
              {beneficios.length}
            </span>
          </div>

          <ul className="space-y-2">
            {beneficios.map((beneficio: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Check className="h-4 w-4 mt-0.5 shrink-0 text-violet-600" />
                <p className="!text-sm !text-gray-700 !mb-0 !leading-relaxed">
                  {beneficio}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Observações */}
        {hasObservacoes && (
          <>
            <div className="border-t border-gray-100" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="h-4 w-4 text-gray-500" />
                <h4 className="!text-sm !font-medium !text-gray-900 !mb-0">
                  Observações
                </h4>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="!text-sm !text-gray-600 !mb-0 whitespace-pre-line !leading-relaxed">
                  {observacoes}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
