"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";

export function AtividadesTab({ vaga }: AboutTabProps) {
  const hasPrincipais = vaga.atividades?.principais?.length > 0;
  const hasExtras = vaga.atividades?.extras?.length > 0;
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividades</h3>

        <div className="space-y-6">
          {hasPrincipais && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Principais
              </h4>
              <ul className="space-y-3">
                {vaga.atividades.principais.map(
                  (atividade: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="text-green-500 mt-1 text-xs font-bold">
                        •
                      </span>
                      <span className="flex-1">{atividade}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {hasExtras && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Extras
              </h4>
              <ul className="space-y-3">
                {vaga.atividades.extras.map(
                  (atividade: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="text-orange-500 mt-1 text-xs font-bold">
                        •
                      </span>
                      <span className="flex-1">{atividade}</span>
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
