"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  BookOpen,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { getPlataformaOverview } from "@/api/dashboard";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { PlataformaChartsSection } from "./components/PlataformaChartsSection";
import { PlataformaQuickActions } from "./components/PlataformaQuickActions";

export function PlataformaOverviewDashboard() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["plataforma-overview"],
    queryFn: async () => {
      const result = await getPlataformaOverview();
      if (!result.success || !result.data) {
        throw new Error("Resposta inválida da API");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!response?.metricasGerais) return [];

    const { metricasGerais } = response;

    return [
      {
        icon: Users,
        iconBg: "bg-blue-100 text-blue-600",
        value: metricasGerais.totalUsuarios,
        label: "Total de Usuários",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: BookOpen,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: metricasGerais.totalCursos,
        label: "Total de Cursos",
        cardBg: "bg-indigo-50/50",
      },
      {
        icon: Building2,
        iconBg: "bg-purple-100 text-purple-600",
        value: metricasGerais.totalEmpresas,
        label: "Total de Empresas",
        cardBg: "bg-purple-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricasGerais.totalVagas,
        label: "Total de Vagas",
        cardBg: "bg-emerald-50/50",
      },
    ];
  }, [response]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
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

        {/* Charts Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-80 rounded-xl" />
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
    <div className="space-y-8 pb-8">
      {/* Primary Metrics - 4 Cards Principais */}
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={primaryMetrics}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      {/* Faturamento Destaque */}
      {response.metricasGerais.faturamentoMesAtual > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 via-green-50/30 to-emerald-50 rounded-xl p-6 border border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <DollarSign className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Faturamento do Mês
                </h3>
                <p className="text-sm text-gray-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(response.metricasGerais.faturamentoMesAtual)}
                </p>
              </div>
            </div>
            {response.metricasGerais.faturamentoMesAnterior > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="size-4" />
                  <span className="text-sm font-medium">
                    {(
                      ((response.metricasGerais.faturamentoMesAtual -
                        response.metricasGerais.faturamentoMesAnterior) /
                        response.metricasGerais.faturamentoMesAnterior) *
                      100
                    ).toFixed(1)}
                    % vs mês anterior
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Links Rápidos */}
      <PlataformaQuickActions data={response} />

      {/* Charts Section - Apenas os principais */}
      <PlataformaChartsSection data={response} />
    </div>
  );
}
