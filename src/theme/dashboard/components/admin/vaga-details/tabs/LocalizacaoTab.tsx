"use client";

import { EmptyState, CardsStatistics } from "@/components/ui/custom";
import type { AboutTabProps } from "../types";
import {
  formatModalidade,
  formatJornada,
  formatRegimeTrabalho,
  formatSenioridade,
} from "../utils";
import { formatLocation } from "../utils/formatters";
import {
  MapPin,
  Building2,
  Clock,
  Briefcase,
  Target,
  CalendarDays,
} from "lucide-react";

export function LocalizacaoTab({ vaga }: AboutTabProps) {
  // Verificar se há informações de localização
  const hasLocationInfo =
    vaga.localizacao ||
    vaga.modalidade ||
    vaga.jornada ||
    vaga.regimeDeTrabalho ||
    vaga.senioridade;

  if (!hasLocationInfo) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de localização vazia"
          title="Informações de localização não definidas"
          description="Esta vaga ainda não possui informações de localização definidas."
          maxContentWidth="md"
        />
      </div>
    );
  }

  // Métricas KPI no formato do CardsStatistics
  const getKPIMetrics = () => {
    return [
      {
        icon: MapPin,
        iconBg:
          "bg-blue-50 border-blue-200/20 text-blue-600 dark:bg-blue-950 dark:border-blue-800/20 dark:text-blue-400",
        value: vaga.localizacao
          ? formatLocation(vaga.localizacao)
          : "Não informado",
        label: "Localização",
      },
      {
        icon: Building2,
        iconBg:
          "bg-green-50 border-green-200/20 text-green-600 dark:bg-green-950 dark:border-green-800/20 dark:text-green-400",
        value: vaga.modalidade
          ? formatModalidade(vaga.modalidade)
          : "Não informado",
        label: "Modalidade",
      },
      {
        icon: Clock,
        iconBg:
          "bg-orange-50 border-orange-200/20 text-orange-600 dark:bg-orange-950 dark:border-orange-800/20 dark:text-orange-400",
        value: vaga.jornada ? formatJornada(vaga.jornada) : "Não informado",
        label: "Jornada",
      },
      {
        icon: Briefcase,
        iconBg:
          "bg-purple-50 border-purple-200/20 text-purple-600 dark:bg-purple-950 dark:border-purple-800/20 dark:text-purple-400",
        value: vaga.regimeDeTrabalho
          ? formatRegimeTrabalho(vaga.regimeDeTrabalho)
          : "Não informado",
        label: "Regime de Trabalho",
      },
      {
        icon: Target,
        iconBg:
          "bg-indigo-50 border-indigo-200/20 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800/20 dark:text-indigo-400",
        value: vaga.senioridade
          ? formatSenioridade(vaga.senioridade)
          : "Não informado",
        label: "Senioridade",
      },
      {
        icon: CalendarDays,
        iconBg:
          "bg-gray-50 border-gray-200/20 text-gray-600 dark:bg-gray-950 dark:border-gray-800/20 dark:text-gray-400",
        value: vaga.inseridaEm
          ? new Date(vaga.inseridaEm).toLocaleDateString("pt-BR")
          : "Não informado",
        label: "Criada em",
      },
    ];
  };

  const kpiMetrics = getKPIMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h5 className="!mb-0">Localização & Modalidade</h5>
        <p>
          Informações sobre localização, modalidade de trabalho e requisitos
        </p>
      </div>

      {/* KPI Cards Row */}
      <CardsStatistics cards={kpiMetrics} />
    </div>
  );
}
