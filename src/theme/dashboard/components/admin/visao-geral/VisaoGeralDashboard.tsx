"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  UserPlus,
  Award,
  Trophy,
  BarChart3,
} from "lucide-react";
import { getVisaoGeral } from "@/api/cursos";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartsCustom } from "@/components/ui/custom/charts-custom";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type {
  ChartData,
  ChartConfig,
} from "@/components/ui/custom/charts-custom";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { CursosProximos } from "./components/CursosProximos";
import { FaturamentoSection } from "./components/FaturamentoSection";
import { PerformanceSection } from "./components/PerformanceSection";
import { CursosCardsGrid } from "./components/CursosCardsGrid";

export function VisaoGeralDashboard() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cursos-visao-geral"],
    queryFn: async () => {
      const result = await getVisaoGeral();
      if (!result.success || !result.data) {
        throw new Error("Resposta inválida da API");
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (aumentado para aproveitar cache da API)
    gcTime: 15 * 60 * 1000, // Mantém em cache por 15 minutos
    retry: 1, // Reduz retries para evitar espera desnecessária
    refetchOnWindowFocus: false, // Não refaz fetch ao focar na janela
  });

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!response?.metricasGerais) return [];

    const { metricasGerais } = response;

    return [
      {
        icon: BookOpen,
        iconBg: "bg-blue-100 text-blue-600",
        value: metricasGerais.totalCursos,
        label: "Total de Cursos",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: GraduationCap,
        iconBg: "bg-purple-100 text-purple-600",
        value: metricasGerais.totalTurmas,
        label: "Total de Turmas",
        cardBg: "bg-purple-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: metricasGerais.totalAlunosInscritos,
        label: "Alunos Inscritos",
        cardBg: "bg-indigo-50/50",
      },
      {
        icon: Trophy,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricasGerais.totalAlunosConcluidos,
        label: "Alunos Concluídos",
        cardBg: "bg-emerald-50/50",
      },
    ];
  }, [response]);

  const secondaryMetrics = useMemo((): StatisticCard[] => {
    if (!response?.metricasGerais) return [];

    const { metricasGerais } = response;

    return [
      {
        icon: CheckCircle,
        iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        value: metricasGerais.cursosPublicados,
        label: "Cursos Publicados",
      },
      {
        icon: FileText,
        iconBg: "bg-amber-100 text-amber-700 border-amber-200",
        value: metricasGerais.cursosRascunho,
        label: "Em Rascunho",
      },
      {
        icon: Calendar,
        iconBg: "bg-cyan-100 text-cyan-700 border-cyan-200",
        value: metricasGerais.turmasAtivas,
        label: "Turmas Ativas",
      },
      {
        icon: UserPlus,
        iconBg: "bg-green-100 text-green-700 border-green-200",
        value: metricasGerais.turmasInscricoesAbertas,
        label: "Inscrições Abertas",
      },
      {
        icon: Award,
        iconBg: "bg-rose-100 text-rose-700 border-rose-200",
        value: metricasGerais.totalAlunosAtivos,
        label: "Alunos Ativos",
      },
    ];
  }, [response]);

  if (isLoading) {
    return (
      <div className="space-y-10 pb-8">
        {/* Primary Metrics Skeleton */}
        <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-6 border border-gray-200/60 bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="size-14 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faturamento Section Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200/60 p-4"
                >
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>

            {/* Chart Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Cursos Cards Grid Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
          {/* Tabs Skeleton */}
          <div className="border-b border-gray-200/60 bg-gray-50/50 p-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-12 shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <BarChart3 className="size-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Erro ao carregar visão geral
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error instanceof Error
              ? error.message
              : "Ocorreu um erro ao buscar os dados. Tente novamente."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <EmptyState
        title="Nenhum dado disponível"
        description="Não foi possível carregar os dados da visão geral."
        illustration="fileNotFound"
      />
    );
  }

  return (
    <div className="space-y-10 pb-8">
      {/* Primary Metrics - 4 Cards Principais */}
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={primaryMetrics}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      {/* Faturamento - Full Width */}
      <div>
        <FaturamentoSection data={response.faturamento} isLoading={isLoading} />
      </div>

      {/* Cursos Cards Grid with Tabs */}
      <div>
        <CursosCardsGrid
          cursosPopulares={response.performance.cursosMaisPopulares}
          cursosMaisPopulares={response.performance.cursosMaisPopulares}
          cursosTaxaConclusao={response.performance.cursosComMaiorTaxaConclusao}
          cursosProximos={[
            ...(response.cursosProximosInicio.proximos7Dias || []),
            ...(response.cursosProximosInicio.proximos15Dias || []).slice(0, 3),
          ].slice(0, 5)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
