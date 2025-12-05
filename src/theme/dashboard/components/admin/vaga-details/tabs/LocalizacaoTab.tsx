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
import type { StatisticCard } from "@/components/ui/custom/cards-statistics/types";

export function LocalizacaoTab({ vaga }: AboutTabProps) {
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
          title="Informações não definidas"
          description="Esta vaga ainda não possui informações de localização e modalidade."
          maxContentWidth="md"
        />
      </div>
    );
  }

  const getKPIMetrics = (): StatisticCard[] => {
    return [
      {
        icon: MapPin,
        iconBg: "bg-blue-100 text-blue-600",
        cardBg: "bg-blue-50/50",
        value: vaga.localizacao
          ? formatLocation(vaga.localizacao)
          : "Não informado",
        label: "Localização",
      },
      {
        icon: Building2,
        iconBg: "bg-emerald-100 text-emerald-600",
        cardBg: "bg-emerald-50/50",
        value: vaga.modalidade
          ? formatModalidade(vaga.modalidade)
          : "Não informado",
        label: "Modalidade",
      },
      {
        icon: Clock,
        iconBg: "bg-amber-100 text-amber-600",
        cardBg: "bg-amber-50/50",
        value: vaga.jornada ? formatJornada(vaga.jornada) : "Não informado",
        label: "Jornada",
      },
      {
        icon: Briefcase,
        iconBg: "bg-violet-100 text-violet-600",
        cardBg: "bg-violet-50/50",
        value: vaga.regimeDeTrabalho
          ? formatRegimeTrabalho(vaga.regimeDeTrabalho)
          : "Não informado",
        label: "Regime de Trabalho",
      },
      {
        icon: Target,
        iconBg: "bg-indigo-100 text-indigo-600",
        cardBg: "bg-indigo-50/50",
        value: vaga.senioridade
          ? formatSenioridade(vaga.senioridade)
          : "Não informado",
        label: "Senioridade",
      },
      {
        icon: CalendarDays,
        iconBg: "bg-slate-100 text-slate-600",
        cardBg: "bg-slate-50/50",
        value: vaga.inseridaEm
          ? new Date(vaga.inseridaEm).toLocaleDateString("pt-BR")
          : "Não informado",
        label: "Criada em",
      },
    ];
  };

  return (
    <CardsStatistics
      cards={getKPIMetrics()}
      showBadges={false}
      gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    />
  );
}
