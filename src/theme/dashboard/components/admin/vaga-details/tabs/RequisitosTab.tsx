"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";

export function RequisitosTab({ vaga }: AboutTabProps) {
  const hasObrigatorios = vaga.requisitos?.obrigatorios?.length > 0;
  const hasDesejaveis = vaga.requisitos?.desejaveis?.length > 0;
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Requisitos</h3>

        <div className="space-y-6">
          {hasObrigatorios && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Obrigatórios
              </h4>
              <ul className="space-y-3">
                {vaga.requisitos.obrigatorios.map(
                  (req: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="text-red-500 mt-1 text-xs font-bold">
                        •
                      </span>
                      <span className="flex-1">{req}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {hasDesejaveis && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Desejáveis
              </h4>
              <ul className="space-y-3">
                {vaga.requisitos.desejaveis.map(
                  (req: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="text-blue-500 mt-1 text-xs font-bold">
                        •
                      </span>
                      <span className="flex-1">{req}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
