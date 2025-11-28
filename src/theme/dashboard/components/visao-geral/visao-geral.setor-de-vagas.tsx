"use client";

import { useMemo } from "react";
import { Building2, Briefcase, Users, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import {
  QuickActionsSetorDeVagas,
  type SetorDeVagasMetricasGerais,
} from "./components/QuickActionsSetorDeVagas";

// Dados mockados (posteriormente serão substituídos por chamadas à API)
const mockMetricasGerais: SetorDeVagasMetricasGerais = {
  // Empresas
  totalEmpresas: 45,
  empresasAtivas: 38,
  novasEmpresasSemana: 3,
  // Vagas
  totalVagas: 127,
  vagasAbertas: 42,
  vagasPendentes: 8,
  vagasEncerradas: 77,
  // Candidatos
  totalCandidatos: 892,
  candidatosEmProcesso: 156,
  candidatosContratados: 234,
  // Solicitações
  solicitacoesPendentes: 8,
  solicitacoesAprovadasHoje: 5,
  solicitacoesRejeitadasHoje: 2,
};

/**
 * Visão geral para o Setor de Vagas
 * Inclui: empresas, vagas, candidatos e solicitações de aprovação
 */
export function VisaoGeralSetorDeVagas() {
  // TODO: Substituir por chamada à API quando disponível
  // const { data, isLoading, error, refetch } = useQuery({
  //   queryKey: ["setor-de-vagas-overview"],
  //   queryFn: getSetorDeVagasOverview,
  // });

  // TODO: Substituir por useQuery quando a API estiver disponível
  const isLoading = false;
  const dataToDisplay = { metricasGerais: mockMetricasGerais };

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!dataToDisplay?.metricasGerais) return [];

    const { metricasGerais } = dataToDisplay;

    return [
      {
        icon: ClipboardList,
        iconBg: "bg-amber-100 text-amber-600",
        value: metricasGerais.solicitacoesPendentes,
        label: "Solicitações Pendentes",
        cardBg: "bg-amber-50/50",
      },
      {
        icon: Building2,
        iconBg: "bg-blue-100 text-blue-600",
        value: metricasGerais.totalEmpresas,
        label: "Total de Empresas",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricasGerais.vagasAbertas,
        label: "Vagas Abertas",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-purple-100 text-purple-600",
        value: metricasGerais.totalCandidatos,
        label: "Total de Candidatos",
        cardBg: "bg-purple-50/50",
      },
    ];
  }, [dataToDisplay]);

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

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white p-4 md:p-5 space-y-4 border border-gray-200"
            >
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dataToDisplay) {
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

      {/* Quick Actions - Links Rápidos */}
      <QuickActionsSetorDeVagas data={dataToDisplay} />
    </div>
  );
}
