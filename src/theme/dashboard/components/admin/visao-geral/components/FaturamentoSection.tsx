"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Award,
  BarChart3,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveLineChart } from "@/components/ui/custom/charts-custom/components/InteractiveLineChart";
import type { ChartConfig } from "@/components/ui/chart";
import type { MetricConfig } from "@/components/ui/custom/charts-custom/components/InteractiveLineChart";
import { getVisaoGeralFaturamento } from "@/api/cursos";
import type {
  VisaoGeralFaturamentoPeriod,
  VisaoGeralFaturamentoTendenciasData,
} from "@/api/cursos";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { format as formatDate } from "date-fns";

interface FaturamentoSectionProps {
  isLoading?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function FaturamentoSection({ isLoading }: FaturamentoSectionProps) {
  const [periodType, setPeriodType] =
    useState<VisaoGeralFaturamentoPeriod>("month");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const minSelectableDate = useMemo(() => new Date(2025, 0, 1), []);
  const maxSelectableDate = useMemo(() => new Date(), []);

  const customStartDate = dateRange.from
    ? formatDate(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const customEndDate = dateRange.to
    ? formatDate(dateRange.to, "yyyy-MM-dd")
    : undefined;

  const isCustomReady =
    periodType !== "custom" ||
    (Boolean(customStartDate) && Boolean(customEndDate));

  const {
    data: faturamentoResponse,
    isLoading: isLoadingFaturamento,
    isFetching: isFetchingFaturamento,
    error: faturamentoError,
    refetch: refetchFaturamento,
  } = useQuery({
    queryKey: [
      "cursos-visao-geral-faturamento",
      {
        periodType,
        customStartDate,
        customEndDate,
        tz: "America/Sao_Paulo",
        top: 10,
      },
    ],
    queryFn: async () => {
      const res = await getVisaoGeralFaturamento({
        period: periodType,
        startDate: periodType === "custom" ? customStartDate : undefined,
        endDate: periodType === "custom" ? customEndDate : undefined,
        tz: "America/Sao_Paulo",
        top: 10,
      });
      if (!res?.success || !res.data) {
        throw new Error("Resposta inválida da API de faturamento.");
      }
      return res.data;
    },
    enabled: !isLoading && isCustomReady,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const data: VisaoGeralFaturamentoTendenciasData | undefined =
    faturamentoResponse;
  const cursoMaiorFaturamento = data?.cursoMaiorFaturamento;
  const sectionIsLoading =
    Boolean(isLoading) ||
    isLoadingFaturamento ||
    (isFetchingFaturamento && !data);

  const historicalData = useMemo(() => {
    return data?.historicalData ?? [];
  }, [data]);

  const topCursosFaturamento = useMemo(() => {
    return data?.topCursosFaturamento ?? [];
  }, [data]);

  // Dados para gráfico de barras dos top cursos
  const topCursosChartData = useMemo(() => {
    if (sectionIsLoading || !data) return [];
    const cursos = topCursosFaturamento;
    return cursos.slice(0, 5).map((curso: any) => ({
      name:
        (curso.cursoNome ?? curso.nome ?? "").length > 20
          ? (curso.cursoNome ?? curso.nome ?? "").substring(0, 20) + "..."
          : curso.cursoNome ?? curso.nome ?? "",
      valor: curso.totalFaturamento ?? curso.faturamento ?? 0,
      transacoes: curso.totalTransacoes ?? 0,
    }));
  }, [sectionIsLoading, data, topCursosFaturamento]);

  if (sectionIsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (faturamentoError) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Tendências de Faturamento
            </h3>
            <p className="text-sm text-gray-600">
              Não foi possível carregar os dados de faturamento.
            </p>
          </div>
          <button
            onClick={() => refetchFaturamento()}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 transition-all font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Configuração de métricas para o gráfico interativo
  const faturamentoMetrics: MetricConfig[] = [
    {
      key: "faturamento",
      label: "Faturamento",
      value: data?.faturamentoMesAtual ?? 0,
      previousValue: data?.faturamentoMesAnterior ?? 0,
      format: (val) => formatCurrency(val),
      showChange: true,
      showComparison: true,
    },
    {
      key: "transacoes",
      label: "Transações",
      value: data?.totalTransacoes || 0,
      format: (val) => val.toLocaleString("pt-BR"),
      showChange: false,
      showComparison: false,
    },
    {
      key: "transacoesAprovadas",
      label: "Transações Aprovadas",
      value: data?.transacoesAprovadas || 0,
      format: (val) => val.toLocaleString("pt-BR"),
      showChange: false,
      showComparison: false,
    },
  ];

  const faturamentoChartConfig: ChartConfig = {
    faturamento: {
      label: "Faturamento",
      color: "#3b82f6",
    },
    transacoes: {
      label: "Transações",
      color: "#10b981",
    },
    transacoesAprovadas: {
      label: "Transações Aprovadas",
      color: "#8b5cf6",
    },
  };

  return (
    <div className="space-y-6">
      {/* Gráfico Interativo de Tendências */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <InteractiveLineChart
          data={historicalData as Array<Record<string, string | number>>}
          metrics={faturamentoMetrics}
          config={faturamentoChartConfig}
          dateKey="date"
          height={320}
          showPeriodFilter={true}
          periodType={periodType}
          onPeriodTypeChange={setPeriodType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          useServerPeriodData={true}
          datePickerMinDate={minSelectableDate}
          datePickerMaxDate={maxSelectableDate}
          datePickerYears="old"
          defaultPeriod="month"
          periodTitle="Tendências de Faturamento"
          periodDescription="Análise temporal dos principais indicadores financeiros"
        />
      </div>

      {/* Curso com Maior Faturamento */}
      {cursoMaiorFaturamento && (
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50/30 to-amber-50 rounded-xl p-6 border border-amber-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <Award className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Destaque do Período
              </h3>
              <p className="text-sm text-gray-600">
                Curso com maior faturamento
              </p>
            </div>
          </div>

          <Link href={`/dashboard/cursos/${cursoMaiorFaturamento.cursoId}`}>
            <div className="bg-white rounded-xl p-6 border-2 border-amber-200/50 hover:border-amber-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                    {cursoMaiorFaturamento.cursoNome}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">
                    {cursoMaiorFaturamento.cursoCodigo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-600 mb-1">
                    {formatCurrency(cursoMaiorFaturamento.totalFaturamento)}
                  </p>
                  <p className="text-xs text-gray-500">Total faturado</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="size-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Total
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    {cursoMaiorFaturamento.totalTransacoes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">transações</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Aprovadas
                    </p>
                  </div>
                  <p className="font-bold text-emerald-600 text-lg">
                    {cursoMaiorFaturamento.transacoesAprovadas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {cursoMaiorFaturamento.totalTransacoes > 0
                      ? (
                          (cursoMaiorFaturamento.transacoesAprovadas /
                            cursoMaiorFaturamento.totalTransacoes) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    % de aprovação
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="size-4 text-amber-500" />
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Pendentes
                    </p>
                  </div>
                  <p className="font-bold text-amber-600 text-lg">
                    {cursoMaiorFaturamento.transacoesPendentes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {cursoMaiorFaturamento.ultimaTransacao
                      ? formatDateTime(cursoMaiorFaturamento.ultimaTransacao)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Top 10 Cursos com Gráfico */}
      {topCursosFaturamento.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico dos Top 5 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="size-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Top 5 Cursos por Faturamento
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Ranking visual dos principais cursos
              </p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topCursosChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.3}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(value) => formatCurrencyCompact(value)}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                  width={115}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            {payload[0].payload.name}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm text-gray-600">
                                Faturamento:
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm text-gray-600">
                                Transações:
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {payload[0].payload.transacoes}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                  {topCursosChartData.map((_entry: any, index: number) => {
                    const colors = [
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                      "#ef4444",
                    ];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index] || "#6b7280"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista Completa Top 10 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Ranking Completo
              </h3>
              <p className="text-sm text-gray-600">
                Top 10 cursos por faturamento
              </p>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
              {topCursosFaturamento.map((curso: any, index: number) => (
                <Link
                  key={curso.cursoId ?? curso.id ?? index}
                  href={`/dashboard/cursos/${curso.cursoId ?? curso.id}`}
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm flex-shrink-0 transition-colors",
                          index === 0
                            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                            : index === 2
                            ? "bg-gradient-to-br from-amber-700 to-amber-800 text-white"
                            : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {curso.cursoNome ?? curso.nome}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {curso.cursoCodigo ?? curso.codigo ?? ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-gray-900 text-base">
                        {formatCurrency(
                          curso.totalFaturamento ?? curso.faturamento ?? 0
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {curso.totalTransacoes ?? 0} trans.
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
