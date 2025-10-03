"use client";

import { EmptyState } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";
import {
  CalendarDays,
  Tag,
  CheckCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "../utils";

export function AboutTab({ vaga }: AboutTabProps) {
  const vagaDescription = vaga.descricao?.trim();

  const vagaSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    { label: "Código da vaga", value: vaga.codigo ?? "—", icon: Tag },
    {
      label: "Status",
      value: vaga.status ?? "—",
      icon: CheckCircle,
    },
    {
      label: "Criada em",
      value: vaga.inseridaEm ? formatDate(vaga.inseridaEm) : "—",
      icon: CalendarDays,
    },
    {
      label: "Atualizada em",
      value: vaga.atualizadoEm ? formatDate(vaga.atualizadoEm) : "—",
      icon: CalendarDays,
    },
    {
      label: "Inscrições até",
      value: vaga.inscricoesAte
        ? formatDate(vaga.inscricoesAte)
        : "Não definida",
      icon: CalendarDays,
    },
    {
      label: "Vagas disponíveis",
      value: vaga.numeroVagas
        ? vaga.numeroVagas.toString().padStart(2, "0")
        : "—",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        {vagaDescription ? (
          <div>
            <h6 className="text-sm font-medium text-gray-900 mb-3">
              Descrição
            </h6>
            <p className="text-sm text-gray-700 leading-relaxed">
              {vagaDescription}
            </p>
          </div>
        ) : (
          <EmptyState
            illustration="companyDetails"
            illustrationAlt="Ilustração de descrição vazia da vaga"
            title="Descrição não adicionada"
            description="Até o momento, esta vaga não possui descrição detalhada."
            maxContentWidth="md"
          />
        )}

        {/* Observações */}
        {vaga.observacoes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h6 className="text-sm font-medium text-gray-900 mb-3">
              Observações
            </h6>
            <p className="text-sm text-gray-700 leading-relaxed">
              {vaga.observacoes}
            </p>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Informações
          </h4>
          <dl className="space-y-4 text-sm">
            {vagaSidebar
              .filter((info) => info.value !== null && info.value !== "—")
              .map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <info.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col">
                    <dt className="text-xs font-medium uppercase text-gray-600">
                      {info.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {info.value ?? "—"}
                    </dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
