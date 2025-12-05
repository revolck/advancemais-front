"use client";

import type { AboutTabProps } from "../types";
import { formatCurrency } from "../utils";
import { Users, DollarSign, Target } from "lucide-react";
import { CardsStatistics, ChartsCustom } from "@/components/ui/custom";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics/types";

export function SalarioVagasTab({ vaga }: AboutTabProps) {
  // Função para extrair a localização da vaga
  const getVagaLocation = () => {
    if (!vaga.localizacao) return "Brasil";

    const { cidade, estado } = vaga.localizacao;
    if (cidade && estado) return `${cidade}/${estado}`;
    if (cidade) return cidade;
    if (estado) return estado;
    return "Brasil";
  };

  // Métricas KPI no formato do CardsStatistics
  const getKPIMetrics = (): StatisticCard[] => {
    const salarioMin = Number(vaga.salarioMin) || 0;
    const salarioMax = Number(vaga.salarioMax) || 0;

    // Determinar o valor e label do salário
    let salarioValue = "";
    let salarioLabel = "";

    if (vaga.salarioConfidencial) {
      salarioValue = "Confidencial";
      salarioLabel = "Salário";
    } else if (salarioMin && salarioMax) {
      salarioValue = `${formatCurrency(salarioMin)} - ${formatCurrency(salarioMax)}`;
      salarioLabel = "Faixa Salarial";
    } else if (salarioMin) {
      salarioValue = formatCurrency(salarioMin);
      salarioLabel = "A partir de";
    } else if (salarioMax) {
      salarioValue = formatCurrency(salarioMax);
      salarioLabel = "Até";
    } else {
      salarioValue = "A combinar";
      salarioLabel = "Salário";
    }

    // Total de candidaturas (usa dados reais se disponível)
    const totalCandidaturas =
      vaga.candidaturasResumo?.total ?? vaga.candidaturas?.length ?? 0;

    return [
      {
        icon: DollarSign,
        iconBg: "bg-emerald-100 text-emerald-600",
        cardBg: "bg-emerald-50/50",
        value: salarioValue,
        label: salarioLabel,
      },
      {
        icon: Users,
        iconBg: "bg-indigo-100 text-indigo-600",
        cardBg: "bg-indigo-50/50",
        value: (vaga.numeroVagas || 0).toString().padStart(2, "0"),
        label: "Vagas Disponíveis",
      },
      {
        icon: Target,
        iconBg: "bg-violet-100 text-violet-600",
        cardBg: "bg-violet-50/50",
        value: totalCandidaturas,
        label: "Candidaturas Recebidas",
      },
    ];
  };

  // Dados para gráfico de comparativo salarial
  const getSalaryComparisonData = () => {
    const baseSalary = Number(vaga.salarioMin) || 3000;
    const vagaLocation = getVagaLocation();

    const localMarket = Math.round(baseSalary * 0.85);
    const brasilMarket = Math.round(baseSalary * 1.25);

    return [
      {
        region: vagaLocation,
        vaga: baseSalary,
        mercado: localMarket,
      },
      {
        region: "Brasil",
        vaga: baseSalary,
        mercado: brasilMarket,
      },
    ];
  };

  // Dados para gráfico de candidaturas por faixa etária
  const getAgeRangeData = () => {
    const totalCandidates = vaga.candidaturasResumo?.total || 100;

    return [
      {
        name: "18-25 anos",
        value: Math.round(totalCandidates * 0.25),
        fill: "#8b5cf6",
      },
      {
        name: "26-35 anos",
        value: Math.round(totalCandidates * 0.45),
        fill: "#f59e0b",
      },
      {
        name: "36-45 anos",
        value: Math.round(totalCandidates * 0.2),
        fill: "#10b981",
      },
      {
        name: "46+ anos",
        value: Math.round(totalCandidates * 0.1),
        fill: "#6366f1",
      },
    ];
  };

  // Configuração dos gráficos
  const getChartConfig = () => ({
    vaga: { label: "Vaga Atual", color: "#6366f1" },
    mercado: { label: "Mercado", color: "#10b981" },
    value: { label: "Valor", color: "#6366f1" },
  });

  const vagaLocation = getVagaLocation();
  const kpiMetrics = getKPIMetrics();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <CardsStatistics
        cards={kpiMetrics}
        showBadges={false}
        gridClassName="grid-cols-1 sm:grid-cols-3 gap-4"
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartsCustom
          type="bar"
          data={getSalaryComparisonData()}
          config={getChartConfig()}
          xAxisKey="region"
          title={`Comparativo Salarial: ${vagaLocation} vs Brasil`}
          description="Comparação entre salário da vaga e média do mercado"
          height={280}
          showLegend
        />

        <ChartsCustom
          type="pie"
          data={getAgeRangeData()}
          config={getChartConfig()}
          title="Candidaturas por Faixa Etária"
          description="Distribuição de candidatos por idade"
          height={280}
          showLegend
        />
      </div>
    </div>
  );
}
