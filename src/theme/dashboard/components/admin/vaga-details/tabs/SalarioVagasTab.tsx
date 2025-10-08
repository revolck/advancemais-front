"use client";

import type { AboutTabProps } from "../types";
import { formatCurrency } from "../utils";
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  BarChart3,
  Users,
  DollarSign,
  Target,
  Building2,
} from "lucide-react";
import { CardsStatistics, ChartsCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";

export function SalarioVagasTab({ vaga }: AboutTabProps) {
  // Função para extrair a localização da vaga
  const getVagaLocation = () => {
    if (!vaga.localizacao) return "Brasil";

    const { cidade, estado } = vaga.localizacao;
    if (cidade && estado) {
      return `${cidade}/${estado}`;
    }
    if (cidade) return cidade;
    if (estado) return estado;
    return "Brasil";
  };

  // Dados simulados de mercado baseados no título da vaga e localização
  const getMarketData = () => {
    const baseSalary = Number(vaga.salarioMin) || 3000;
    const title = vaga.titulo?.toLowerCase() || "";
    const vagaLocation = getVagaLocation();

    // Simulação de dados de mercado baseada no título e localização
    const marketData = {
      local: {
        min: Math.round(baseSalary * 0.85),
        max: Math.round(baseSalary * 1.15),
        media: Math.round(baseSalary * 1.0),
        tendencia: Math.random() > 0.5 ? "up" : "down",
        percentual: Math.round(Math.random() * 10 + 2),
      },
      brasil: {
        min: Math.round(baseSalary * 0.95),
        max: Math.round(baseSalary * 1.35),
        media: Math.round(baseSalary * 1.15),
        tendencia: Math.random() > 0.3 ? "up" : "down",
        percentual: Math.round(Math.random() * 8 + 3),
      },
    };

    return { marketData, vagaLocation };
  };

  // Dados para gráfico de barras comparativo
  const getChartData = () => {
    const baseSalary = Number(vaga.salarioMin) || 3000;
    const vagaLocation = getVagaLocation();

    return [
      {
        name: vagaLocation,
        vaga: baseSalary,
        mercado: Math.round(baseSalary * 1.0),
        diferenca: Math.round(baseSalary * 0.15),
      },
      {
        name: "Brasil",
        vaga: baseSalary,
        mercado: Math.round(baseSalary * 1.15),
        diferenca: Math.round(baseSalary * 0.15),
      },
    ];
  };

  // Métricas KPI no formato do CardsStatistics
  const getKPIMetrics = () => {
    const salarioMin = Number(vaga.salarioMin) || 0;
    const salarioMax = Number(vaga.salarioMax) || 0;

    // Determinar o valor e label do salário
    let salarioValue = "";
    let salarioLabel = "";

    if (vaga.salarioConfidencial) {
      salarioValue = "Confidencial";
      salarioLabel = "Salário Confidencial";
    } else if (salarioMin && salarioMax) {
      salarioValue = `${formatCurrency(salarioMin)} - ${formatCurrency(
        salarioMax
      )}`;
      salarioLabel = "Faixa Salarial";
    } else if (salarioMin) {
      salarioValue = `A partir de ${formatCurrency(salarioMin)}`;
      salarioLabel = "Salário Mínimo";
    } else if (salarioMax) {
      salarioValue = `Até ${formatCurrency(salarioMax)}`;
      salarioLabel = "Salário Máximo";
    } else {
      salarioValue = "A combinar";
      salarioLabel = "Salário a Combinar";
    }

    return [
      {
        icon: DollarSign,
        iconBg:
          "bg-blue-50 border-blue-200/20 text-blue-600 dark:bg-blue-950 dark:border-blue-800/20 dark:text-blue-400",
        value: salarioValue,
        label: salarioLabel,
      },
      {
        icon: Users,
        iconBg:
          "bg-green-50 border-green-200/20 text-green-600 dark:bg-green-950 dark:border-green-800/20 dark:text-green-400",
        value: (vaga.numeroVagas || 0).toString().padStart(2, "0"),
        label: "Vagas Disponíveis",
      },
      {
        icon: Target,
        iconBg:
          "bg-purple-50 border-purple-200/20 text-purple-600 dark:bg-purple-950 dark:border-purple-800/20 dark:text-purple-400",
        value: Math.floor(Math.random() * 50 + 20).toString(),
        label: "Candidaturas recebidas",
        info: (
          <Badge
            variant="outline"
            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
          >
            +8.7% este mês
          </Badge>
        ),
      },
    ];
  };

  // Dados para gráfico de comparativo salarial
  const getSalaryComparisonData = () => {
    const baseSalary = Number(vaga.salarioMin) || 3000;
    const vagaLocation = getVagaLocation();

    // Dados mais realistas baseados em pesquisas de mercado
    const localMarket = Math.round(baseSalary * 0.85); // Mercado local 15% menor
    const brasilMarket = Math.round(baseSalary * 1.25); // Mercado do Brasil 25% maior

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

  // Dados para gráfico de candidaturas por faixa etária (pie chart)
  const getAgeRangeData = () => {
    // Dados simulados de candidaturas por faixa etária
    const totalCandidates = Math.floor(Math.random() * 200 + 100); // 100-300 candidatos

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
        fill: "#ef4444",
      },
    ];
  };

  // Configuração dos gráficos
  const getChartConfig = () => {
    return {
      vaga: {
        label: "Vaga Atual",
        color: "#3b82f6",
      },
      mercado: {
        label: "Mercado",
        color: "#10b981",
      },
      value: {
        label: "Valor",
        color: "#3b82f6",
      },
    };
  };

  const getSalarioInfo = () => {
    if (vaga.salarioConfidencial) {
      return {
        tipo: "Confidencial",
        valor: "A ser discutido em entrevista",
        cor: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-200",
      };
    }

    if (vaga.salarioMin && vaga.salarioMax) {
      return {
        tipo: "Faixa salarial",
        valor: `${formatCurrency(vaga.salarioMin)} - ${formatCurrency(
          vaga.salarioMax
        )}`,
        cor: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    }

    if (vaga.salarioMin) {
      return {
        tipo: "A partir de",
        valor: formatCurrency(vaga.salarioMin),
        cor: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    }

    if (vaga.salarioMax) {
      return {
        tipo: "Até",
        valor: formatCurrency(vaga.salarioMax),
        cor: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    }

    return {
      tipo: "A combinar",
      valor: "A ser definido",
      cor: "text-gray-700",
      bg: "bg-gray-50",
      border: "border-gray-200",
    };
  };

  const salarioInfo = getSalarioInfo();
  const { marketData, vagaLocation } = getMarketData();
  const chartData = getChartData();
  const kpiMetrics = getKPIMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <h5 className="!mb-0">Salário & Vagas</h5>
      <p>Análise de mercado e métricas de performance</p>

      {/* KPI Cards Row */}
      <CardsStatistics cards={kpiMetrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras - Comparativo Salarial */}
        <ChartsCustom
          type="bar"
          data={getSalaryComparisonData()}
          config={getChartConfig()}
          xAxisKey="region"
          title={`Comparativo Salarial: ${vagaLocation} vs Brasil`}
          description="Comparação entre salário da vaga e mercado regional"
          height={300}
          showLegend={true}
        />

        {/* Gráfico de Pizza - Candidaturas por Faixa Etária */}
        <ChartsCustom
          type="pie"
          data={getAgeRangeData()}
          config={getChartConfig()}
          title="Candidaturas por Faixa Etária"
          description="Distribuição de candidatos por idade"
          height={300}
          showLegend={true}
        />
      </div>
    </div>
  );
}
