"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";

export function BeneficiosTab({ vaga }: AboutTabProps) {
  const hasBeneficios = vaga.beneficios?.lista?.length > 0;
  const hasObservacoes = vaga.beneficios?.observacoes?.trim();

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
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Benefícios</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Lista de Benefícios
            </h4>
            <ul className="space-y-3">
              {vaga.beneficios.lista.map((beneficio: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <span className="text-purple-500 mt-1 text-xs font-bold">
                    •
                  </span>
                  <span className="flex-1">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          {hasObservacoes && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Observações
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {vaga.beneficios.observacoes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
