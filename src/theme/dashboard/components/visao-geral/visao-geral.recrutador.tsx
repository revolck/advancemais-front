"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Briefcase, Users, UserCheck, Link2Off, Link2 } from "lucide-react";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { getSetorDeVagasMetricas } from "@/api/vagas/solicitacoes";
import type { SetorDeVagasMetricas } from "@/api/vagas/solicitacoes/types";
import {
  connectGoogle,
  disconnectGoogle,
  getGoogleOAuthStatus,
  type GoogleOAuthStatus,
} from "@/api/aulas";

/**
 * Visão geral para Recrutador
 * Escopo: apenas empresas e vagas vinculadas ao recrutador.
 */
export function VisaoGeralRecrutador() {
  const {
    data: metricas,
    isLoading: isLoadingMetricas,
    error: metricasError,
    refetch: refetchMetricas,
    isFetching: isFetchingMetricas,
  } = useQuery<SetorDeVagasMetricas>({
    queryKey: ["recrutador-metricas"],
    queryFn: async () => {
      const response = await getSetorDeVagasMetricas();
      if (!response?.metricasGerais) {
        throw new Error("Resposta inválida da API");
      }
      return response.metricasGerais;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const {
    data: googleStatus,
    isLoading: isLoadingGoogle,
    isFetching: isFetchingGoogle,
    refetch: refetchGoogle,
  } = useQuery<GoogleOAuthStatus>({
    queryKey: ["google-oauth-status"],
    queryFn: () => getGoogleOAuthStatus(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!metricas) return [];

    return [
      {
        icon: Building2,
        iconBg: "bg-blue-100 text-blue-600",
        value: metricas.totalEmpresas,
        label: "Empresas Vinculadas",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricas.totalVagas,
        label: "Vagas Vinculadas",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-purple-100 text-purple-600",
        value: metricas.totalCandidatos,
        label: "Candidatos",
        cardBg: "bg-purple-50/50",
      },
      {
        icon: UserCheck,
        iconBg: "bg-amber-100 text-amber-600",
        value: metricas.candidatosEmProcesso,
        label: "Em Processo",
        cardBg: "bg-amber-50/50",
      },
    ];
  }, [metricas]);

  const isLoading = isLoadingMetricas || (isFetchingMetricas && !metricas);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
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
        <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-80 mt-2" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (metricasError || !metricas) {
    return (
      <EmptyState
        title="Erro ao carregar dados"
        description="Não foi possível carregar os dados da visão geral. Tente novamente."
        illustration="fileNotFound"
        actions={
          <button
            onClick={() => refetchMetricas()}
            className="text-sm font-semibold text-[var(--primary-color)] hover:underline"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  const isGoogleBusy = isLoadingGoogle || isFetchingGoogle;
  const isGoogleConnected = Boolean(googleStatus?.conectado);

  const handleConnectGoogle = async () => {
    const res = await connectGoogle();
    if (res?.authUrl) {
      window.location.href = res.authUrl;
    }
  };

  const handleDisconnectGoogle = async () => {
    await disconnectGoogle();
    await refetchGoogle();
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={primaryMetrics}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      <div className="rounded-xl bg-white p-4 md:p-5 border border-gray-200/60">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Google Calendar/Meet
            </h3>
            <p className="text-sm text-gray-600">
              Necessário para agendar entrevistas com link do Google Meet.
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                isGoogleConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              )}
            >
              {isGoogleBusy ? (
                <Skeleton className="h-3 w-24" />
              ) : isGoogleConnected ? (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Conectado{googleStatus?.email ? ` (${googleStatus.email})` : ""}
                </>
              ) : (
                <>
                  <Link2Off className="h-3.5 w-3.5" />
                  Não conectado
                </>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <ButtonCustom
            variant="primary"
            size="md"
            disabled={isGoogleBusy || isGoogleConnected}
            onClick={handleConnectGoogle}
            className="sm:w-auto"
          >
            Conectar Google
          </ButtonCustom>
          <ButtonCustom
            variant="danger"
            size="md"
            disabled={isGoogleBusy || !isGoogleConnected}
            onClick={handleDisconnectGoogle}
            className="sm:w-auto"
          >
            Desconectar
          </ButtonCustom>
        </div>
      </div>
    </div>
  );
}
