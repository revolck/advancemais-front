"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpDown,
  Clock,
  CreditCard,
  DollarSign,
  Medal,
  Trophy,
  Award,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  getDashboardFinanceiro,
  getDashboardFinanceiroFiltros,
} from "@/api/dashboard";
import type {
  DashboardFinanceiroParams,
  DashboardFinanceiroPeriodo,
  DashboardFinanceiroRankingItem,
  DashboardFinanceiroTendencia,
  DashboardFinanceiroUltimaTransacao,
} from "@/api/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonCustom } from "@/components/ui/custom";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { SelectCustom } from "@/components/ui/custom/select";
import { Skeleton } from "@/components/ui/skeleton";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "month", label: "Mês" },
  { value: "custom", label: "Personalizado" },
] as const;

const ALLOWED_PERIODS = new Set<DashboardFinanceiroPeriodo>([
  "7d",
  "30d",
  "month",
  "custom",
]);

const STATUS_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];
const TYPE_COLORS = ["#1d4ed8", "#7c3aed", "#ec4899", "#14b8a6", "#f97316"];
const GATEWAY_COLORS = ["#0f766e", "#2563eb", "#9333ea", "#dc2626", "#ca8a04"];

interface RankingCardProps {
  title: string;
  items: DashboardFinanceiroRankingItem[];
}

interface FinanceiroDraftFilters {
  periodo: DashboardFinanceiroPeriodo;
  mesReferencia: string;
  dateRange: DateRange;
}

function formatVariation(value?: number | null) {
  if (value === null || value === undefined) return null;
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1).replace(".", ",")}%`;
}

function getTrendBadgeClass(tendencia?: DashboardFinanceiroTendencia | null) {
  switch (tendencia) {
    case "up":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "down":
      return "border-rose-200 text-rose-700 bg-rose-50";
    default:
      return "border-slate-200 text-slate-700 bg-slate-50";
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  try {
    return format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return value;
  }
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";

  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return value;
  }
}

function toMonthValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthName(month: number) {
  const date = new Date(2000, month - 1, 1);
  const label = format(date, "MMMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      value: String(month).padStart(2, "0"),
      label: formatMonthName(month),
    };
  });
}

function buildYearOptions(totalYears = 5) {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: totalYears }, (_, index) => {
    const year = String(currentYear - index);
    return {
      value: year,
      label: year,
    };
  });
}

function cloneDateRange(range: DateRange): DateRange {
  return {
    from: range.from ? new Date(range.from) : null,
    to: range.to ? new Date(range.to) : null,
  };
}

function createInitialDraftFilters(): FinanceiroDraftFilters {
  return {
    periodo: "month",
    mesReferencia: toMonthValue(),
    dateRange: {
      from: null,
      to: null,
    },
  };
}

function buildFinanceiroParams(
  filters: FinanceiroDraftFilters,
): DashboardFinanceiroParams {
  const rangeIso = toRangeIso(filters.dateRange);
  const params: DashboardFinanceiroParams = {
    periodo: filters.periodo,
    timezone: "America/Maceio",
    ultimasTransacoesLimit: 5,
  };

  if (filters.periodo === "month") {
    params.mesReferencia = filters.mesReferencia;
  }

  if (filters.periodo === "custom") {
    params.dataInicio = rangeIso.dataInicio;
    params.dataFim = rangeIso.dataFim;
  }

  return params;
}

function serializeDateValue(value: Date | null) {
  return value ? value.toISOString() : null;
}

function areDraftFiltersEqual(
  current: FinanceiroDraftFilters,
  applied: FinanceiroDraftFilters,
) {
  return (
    current.periodo === applied.periodo &&
    current.mesReferencia === applied.mesReferencia &&
    serializeDateValue(current.dateRange.from) ===
      serializeDateValue(applied.dateRange.from) &&
    serializeDateValue(current.dateRange.to) ===
      serializeDateValue(applied.dateRange.to)
  );
}

function toRangeIso(range: DateRange) {
  if (!range.from || !range.to) {
    return { dataInicio: undefined, dataFim: undefined };
  }

  const start = new Date(range.from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(range.to);
  end.setHours(23, 59, 59, 999);

  return {
    dataInicio: start.toISOString(),
    dataFim: end.toISOString(),
  };
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function DashboardFinanceiroSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-4 md:p-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`card-skeleton-${index}`}
              className="rounded-2xl border border-slate-100 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-36" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card
            key={`chart-skeleton-${index}`}
            className="border-none shadow-none"
          >
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={`distribution-skeleton-${index}`}
            className="border-none shadow-none"
          >
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div
                    key={`distribution-line-${index}-${itemIndex}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-4 space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`ranking-skeleton-${index}`}
              className="border-none shadow-none"
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((__, itemIndex) => (
                  <div
                    key={`ranking-line-${index}-${itemIndex}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <Card className="border-none shadow-none">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-72" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-52" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`signature-skeleton-${index}`}
                    className="h-24 w-full rounded-xl"
                  />
                ))}
              </div>
              <Skeleton className="h-28 w-full rounded-xl" />
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-52" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function RankingCard({ title, items }: RankingCardProps) {
  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return (
      <span className="text-sm font-semibold text-slate-400">{position}º</span>
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <h4 className="!mb-0 text-base font-semibold">{title}</h4>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyPanel message="Sem dados para o período selecionado." />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${title}-${item.position}-${item.name}`}
                className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex-shrink-0">
                    {getMedalIcon(item.position)}
                  </div>
                  <span className="truncate text-sm font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold text-slate-900">
                  {item.valorFormatado || currency.format(item.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusBadgeClass(status?: string | null) {
  switch (status) {
    case "APROVADA":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PENDENTE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PROCESSANDO":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "RECUSADA":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "ESTORNADA":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getTipoBadgeClass(tipo?: string | null) {
  switch (tipo) {
    case "PAGAMENTO":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ASSINATURA":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "REEMBOLSO":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "ESTORNO":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function UltimasTransacoesTable({
  items,
}: {
  items: DashboardFinanceiroUltimaTransacao[];
}) {
  if (items.length === 0) {
    return (
      <EmptyPanel message="Nenhuma transação encontrada para o período selecionado." />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-0 py-3 font-medium">ID</th>
            <th className="px-3 py-3 font-medium">Tipo</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Valor</th>
            <th className="px-3 py-3 font-medium">Gateway</th>
            <th className="px-3 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 last:border-b-0"
            >
              <td className="px-0 py-4 text-sm font-medium text-slate-900">
                <div>{item.codigoExibicao || "—"}</div>
                <div className="text-xs text-slate-500">
                  {item.descricao || "Sem descrição"}
                </div>
              </td>
              <td className="px-3 py-4">
                <Badge
                  variant="outline"
                  className={getTipoBadgeClass(item.tipo)}
                >
                  {item.tipoLabel || item.tipo}
                </Badge>
              </td>
              <td className="px-3 py-4">
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(item.status)}
                >
                  {item.statusLabel || item.status}
                </Badge>
              </td>
              <td className="px-3 py-4 text-sm font-semibold text-slate-900">
                {item.valorFormatado || currency.format(item.valor)}
              </td>
              <td className="px-3 py-4 text-sm text-slate-700">
                {item.gatewayLabel || item.gateway || "—"}
              </td>
              <td className="px-3 py-4 text-sm text-slate-600">
                {formatDateTime(item.criadoEm)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FinanceiroDashboardPage() {
  const [draftFilters, setDraftFilters] = useState<FinanceiroDraftFilters>(() =>
    createInitialDraftFilters(),
  );
  const [appliedFilters, setAppliedFilters] = useState<FinanceiroDraftFilters>(
    () => createInitialDraftFilters(),
  );

  const draftRangeIso = useMemo(
    () => toRangeIso(draftFilters.dateRange),
    [draftFilters.dateRange],
  );
  const isDraftCustomRangeReady =
    draftFilters.periodo !== "custom" ||
    (!!draftRangeIso.dataInicio && !!draftRangeIso.dataFim);
  const hasPendingChanges = useMemo(
    () => !areDraftFiltersEqual(draftFilters, appliedFilters),
    [appliedFilters, draftFilters],
  );
  const [selectedYear, selectedMonth] = useMemo(() => {
    const [year = String(new Date().getFullYear()), month = "01"] =
      draftFilters.mesReferencia.split("-");
    return [year, month];
  }, [draftFilters.mesReferencia]);
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const yearOptions = useMemo(() => buildYearOptions(), []);

  const financeiroParams = useMemo<DashboardFinanceiroParams>(() => {
    return buildFinanceiroParams(appliedFilters);
  }, [appliedFilters]);

  const financeiroQuery = useQuery({
    queryKey: ["dashboard", "financeiro", financeiroParams],
    queryFn: () => getDashboardFinanceiro(financeiroParams),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const filtrosQuery = useQuery({
    queryKey: ["dashboard", "financeiro", "filtros"],
    queryFn: () => getDashboardFinanceiroFiltros(),
    staleTime: 5 * 60 * 1000,
  });

  const data = financeiroQuery.data?.data;

  const periodOptions = useMemo(() => {
    const options = filtrosQuery.data?.data.periodos ?? [...PERIOD_OPTIONS];
    return options.filter((option) =>
      ALLOWED_PERIODS.has(option.value as DashboardFinanceiroPeriodo),
    );
  }, [filtrosQuery.data?.data.periodos]);

  const formattedPeriod = useMemo(() => {
    const dataInicio = data?.filtrosAplicados?.dataInicio;
    const dataFim = data?.filtrosAplicados?.dataFim;

    if (dataInicio && dataFim) {
      return `Dados de ${formatDateOnly(dataInicio)} a ${formatDateOnly(dataFim)}`;
    }

    if (appliedFilters.periodo === "month") {
      const [year, month] = appliedFilters.mesReferencia.split("-").map(Number);
      if (year && month) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        return `Dados de ${format(firstDay, "dd/MM/yyyy", { locale: ptBR })} a ${format(lastDay, "dd/MM/yyyy", { locale: ptBR })}`;
      }
    }

    return "Aguardando filtros válidos para carregar o dashboard financeiro.";
  }, [
    data?.filtrosAplicados?.dataFim,
    data?.filtrosAplicados?.dataInicio,
    appliedFilters.mesReferencia,
    appliedFilters.periodo,
  ]);

  const formattedLastUpdate = useMemo(() => {
    const baseDate = financeiroQuery.dataUpdatedAt
      ? new Date(financeiroQuery.dataUpdatedAt)
      : new Date();

    return `Última atualização: ${format(baseDate, "dd/MM/yyyy", { locale: ptBR })} às ${format(baseDate, "HH:mm", { locale: ptBR })}`;
  }, [financeiroQuery.dataUpdatedAt]);

  const statCards = useMemo<StatisticCard[]>(() => {
    if (!data) return [];

    const buildInfo = (
      variacaoPercentual?: number | null,
      tendencia?: DashboardFinanceiroTendencia | null,
    ) => {
      const label = formatVariation(variacaoPercentual);
      if (!label) return undefined;

      return (
        <Badge variant="outline" className={getTrendBadgeClass(tendencia)}>
          {label}
        </Badge>
      );
    };

    return [
      {
        icon: TrendingUp,
        iconBg: "bg-blue-100 text-blue-600",
        value:
          data.cards.receitaBruta.valorFormatado ||
          currency.format(data.cards.receitaBruta.valor),
        label: "Receita bruta",
        info: buildInfo(
          data.cards.receitaBruta.variacaoPercentual,
          data.cards.receitaBruta.tendencia,
        ),
        cardBg: "bg-blue-50/50",
      },
      {
        icon: Wallet,
        iconBg: "bg-emerald-100 text-emerald-600",
        value:
          data.cards.receitaLiquida.valorFormatado ||
          currency.format(data.cards.receitaLiquida.valor),
        label: "Receita líquida",
        info: buildInfo(
          data.cards.receitaLiquida.variacaoPercentual,
          data.cards.receitaLiquida.tendencia,
        ),
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: DollarSign,
        iconBg: "bg-violet-100 text-violet-600",
        value:
          data.cards.ticketMedio.valorFormatado ||
          currency.format(data.cards.ticketMedio.valor),
        label: "Ticket médio",
        info: buildInfo(
          data.cards.ticketMedio.variacaoPercentual,
          data.cards.ticketMedio.tendencia,
        ),
        cardBg: "bg-violet-50/50",
      },
      {
        icon: CreditCard,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: data.cards.transacoesAprovadas.valor,
        label: "Transações aprovadas",
        info: buildInfo(
          data.cards.transacoesAprovadas.variacaoPercentual,
          data.cards.transacoesAprovadas.tendencia,
        ),
        cardBg: "bg-indigo-50/50",
      },
      {
        icon: Clock,
        iconBg: "bg-amber-100 text-amber-600",
        value: data.cards.transacoesPendentes.valor,
        label: "Transações pendentes",
        info: buildInfo(
          data.cards.transacoesPendentes.variacaoPercentual,
          data.cards.transacoesPendentes.tendencia,
        ),
        cardBg: "bg-amber-50/50",
      },
      {
        icon: ArrowUpDown,
        iconBg: "bg-rose-100 text-rose-600",
        value:
          data.cards.estornosEReembolsos.valorFormatado ||
          currency.format(data.cards.estornosEReembolsos.valor),
        label: "Estornos e reembolsos",
        info: buildInfo(
          data.cards.estornosEReembolsos.variacaoPercentual,
          data.cards.estornosEReembolsos.tendencia,
        ),
        cardBg: "bg-rose-50/50",
      },
    ];
  }, [data]);

  const revenueChartData = data?.graficos.evolucaoReceita ?? [];
  const transactionsChartData = data?.graficos.evolucaoTransacoes ?? [];
  const statusDistribution = data?.graficos.distribuicaoPorStatus ?? [];
  const typeDistribution = data?.graficos.distribuicaoPorTipo ?? [];
  const gatewayDistribution = data?.graficos.distribuicaoPorGateway ?? [];
  const rankings = data?.rankings;
  const latestTransactions = data?.ultimasTransacoes ?? [];
  const assinaturas = data?.assinaturas;
  const acoesRapidas = data?.acoesRapidas;

  const isInitialLoading = financeiroQuery.isLoading && !data;
  const isRefreshing = financeiroQuery.isFetching && !isInitialLoading;
  const showRangeHint =
    draftFilters.periodo === "custom" && !isDraftCustomRangeReady;
  const errorMessage = financeiroQuery.error?.message;

  const handlePeriodoChange = (value: string) => {
    const nextPeriodo = ALLOWED_PERIODS.has(value as DashboardFinanceiroPeriodo)
      ? (value as DashboardFinanceiroPeriodo)
      : "30d";

    setDraftFilters((current) => ({
      ...current,
      periodo: nextPeriodo,
      dateRange:
        nextPeriodo === "custom"
          ? current.dateRange
          : {
              from: null,
              to: null,
            },
    }));
  };

  const handleAplicarFiltros = () => {
    if (!isDraftCustomRangeReady || isRefreshing) return;

    if (!hasPendingChanges) {
      void financeiroQuery.refetch();
      return;
    }

    setAppliedFilters({
      periodo: draftFilters.periodo,
      mesReferencia: draftFilters.mesReferencia,
      dateRange: cloneDateRange(draftFilters.dateRange),
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="space-y-1 xl:min-w-0 xl:pt-2">
            <span className="text-sm font-medium text-slate-700">
              {formattedPeriod}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formattedLastUpdate}</span>
              {isRefreshing && (
                <Badge
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-sky-700"
                >
                  Atualizando...
                </Badge>
              )}
              {hasPendingChanges && (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-700"
                >
                  Filtros pendentes
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3 xl:ml-auto xl:justify-end">
            <div className="w-full sm:w-[220px] [&_button]:bg-white">
              <SelectCustom
                mode="single"
                size="sm"
                label="Período"
                options={periodOptions}
                value={draftFilters.periodo}
                placeholder="Selecionar período"
                onChange={(value) => handlePeriodoChange(value || "30d")}
                fullWidth={false}
              />
            </div>

            {draftFilters.periodo === "month" && (
              <>
                <div className="w-full sm:w-[180px] [&_button]:bg-white">
                  <SelectCustom
                    mode="single"
                    size="sm"
                    label="Mês"
                    options={monthOptions}
                    value={selectedMonth}
                    placeholder="Selecionar mês"
                    onChange={(value) =>
                      setDraftFilters((current) => ({
                        ...current,
                        mesReferencia: `${selectedYear}-${value || selectedMonth}`,
                      }))
                    }
                    fullWidth={false}
                  />
                </div>

                <div className="w-full sm:w-[120px] [&_button]:bg-white">
                  <SelectCustom
                    mode="single"
                    size="sm"
                    label="Ano"
                    options={yearOptions}
                    value={selectedYear}
                    placeholder="Selecionar ano"
                    onChange={(value) =>
                      setDraftFilters((current) => ({
                        ...current,
                        mesReferencia: `${value || selectedYear}-${selectedMonth}`,
                      }))
                    }
                    fullWidth={false}
                  />
                </div>
              </>
            )}

            {draftFilters.periodo === "custom" && (
              <div className="w-full sm:w-[320px] [&_button]:bg-white [&_input]:bg-white">
                <DatePickerRangeCustom
                  value={draftFilters.dateRange}
                  onChange={(value) =>
                    setDraftFilters((current) => ({
                      ...current,
                      dateRange: value,
                    }))
                  }
                  label="Período personalizado"
                  placeholder="Selecionar período"
                  size="sm"
                  clearable
                  format="dd/MM/yyyy"
                />
              </div>
            )}

            <div className="w-full sm:w-auto">
              <ButtonCustom
                size="md"
                className="w-full sm:min-w-[140px]"
                onClick={handleAplicarFiltros}
                disabled={!isDraftCustomRangeReady}
                isLoading={isRefreshing}
                loadingText="Pesquisando..."
              >
                Pesquisar
              </ButtonCustom>
            </div>
          </div>
        </div>

        {showRangeHint && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Selecione `dataInicio` e `dataFim` para carregar o período
            personalizado.
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Erro ao carregar dashboard financeiro: {errorMessage}
        </div>
      )}

      {isInitialLoading ? (
        <DashboardFinanceiroSkeleton />
      ) : (
        <div
          className={`space-y-8 transition-opacity duration-200 ${
            isRefreshing ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="rounded-xl bg-white p-4 md:p-5">
            <CardsStatistics
              cards={statCards}
              gridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            />
          </div>

          <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none shadow-none">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Evolução da receita</h4>
              <p className="!text-sm">
                Receita aprovada consolidada no período.
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {revenueChartData.length === 0 ? (
              <EmptyPanel message="Sem dados de receita para o período selecionado." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" />
                  <YAxis
                    tickFormatter={(value) => currency.format(Number(value))}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => currency.format(value)}
                  />
                  <Bar
                    dataKey="valor"
                    fill="#2563eb"
                    radius={[8, 8, 0, 0]}
                    name="Receita"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-none">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Evolução das transações</h4>
              <p className="!text-sm">Volume por status ao longo do período.</p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {transactionsChartData.length === 0 ? (
              <EmptyPanel message="Sem dados de transações para o período selecionado." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar
                    dataKey="aprovadas"
                    fill="#10b981"
                    name="Aprovadas"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="pendentes"
                    fill="#f59e0b"
                    name="Pendentes"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="recusadas"
                    fill="#ef4444"
                    name="Recusadas"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="border-none shadow-none xl:col-span-1">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Distribuição por status</h4>
              <p className="!text-sm">
                Participação percentual por status financeiro.
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {statusDistribution.length === 0 ? (
              <EmptyPanel message="Sem distribuição de status para o período selecionado." />
            ) : (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={52}
                        outerRadius={88}
                        paddingAngle={4}
                      >
                        {statusDistribution.map((item, index) => (
                          <Cell
                            key={`${item.value}-${index}`}
                            fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => `${value} transações`}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {statusDistribution.map((item, index) => (
                    <div
                      key={item.value}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[index % STATUS_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.count} ·{" "}
                        {item.percentual?.toFixed(1).replace(".", ",") || "0,0"}
                        %
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-none">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Distribuição por tipo</h4>
              <p className="!text-sm">
                Receita aprovada por linha de transação.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {typeDistribution.length === 0 ? (
              <EmptyPanel message="Sem distribuição por tipo para o período selecionado." />
            ) : (
              <div className="space-y-3">
                {typeDistribution.map((item, index) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[index % TYPE_COLORS.length],
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.count} transações
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.valorFormatado || currency.format(item.valor)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-none">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Distribuição por gateway</h4>
              <p className="!text-sm">
                Volume financeiro por provedor de pagamento.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {gatewayDistribution.length === 0 ? (
              <EmptyPanel message="Sem distribuição por gateway para o período selecionado." />
            ) : (
              <div className="space-y-3">
                {gatewayDistribution.map((item, index) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            GATEWAY_COLORS[index % GATEWAY_COLORS.length],
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.count} transações
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.valorFormatado || currency.format(item.valor)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="!mb-0">Rankings</h3>
          <p className="!text-sm text-slate-500">
            Principais destaques financeiros do período.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <RankingCard title="Top Cursos" items={rankings?.topCursos ?? []} />
          <RankingCard title="Top Planos" items={rankings?.topPlanos ?? []} />
          <RankingCard
            title="Top Empresas"
            items={rankings?.topEmpresas ?? []}
          />
          <RankingCard title="Top Alunos" items={rankings?.topAlunos ?? []} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <Card className="border-none shadow-none">
          <CardHeader>
            <div>
              <h4 className="!mb-0">Últimas transações</h4>
              <p className="!text-sm">
                Preview das transações recentes no período filtrado.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <UltimasTransacoesTable items={latestTransactions} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-none">
            <CardHeader>
              <div>
                <h4 className="!mb-0">Assinaturas</h4>
                <p className="!text-sm">
                  Resumo do ciclo atual de assinaturas.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Ativas
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {assinaturas?.ativas ?? 0}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Novas
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {assinaturas?.novasNoPeriodo ?? 0}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Renovações
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {assinaturas?.renovacoesNoPeriodo ?? 0}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Canceladas
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">
                    {assinaturas?.canceladasNoPeriodo ?? 0}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Receita de assinaturas</span>
                  <span className="font-semibold text-slate-900">
                    {assinaturas?.receitaAssinaturasFormatada ||
                      currency.format(assinaturas?.receitaAssinaturas || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Taxa de retenção</span>
                  <span className="font-semibold text-slate-900">
                    {`${(assinaturas?.taxaRetencao || 0).toFixed(1).replace(".", ",")}%`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {acoesRapidas && (
            <Card className="border-none shadow-none">
              <CardHeader>
                <div>
                  <h4 className="!mb-0">Ações rápidas</h4>
                  <p className="!text-sm">
                    Acesse o drilldown detalhado quando precisar.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {acoesRapidas.detalhesTransacoesUrl && (
                  <ButtonCustom variant="outline" size="lg" fullWidth asChild>
                    <Link href={acoesRapidas.detalhesTransacoesUrl}>
                      Ver transações
                    </Link>
                  </ButtonCustom>
                )}
                {acoesRapidas.detalhesAssinaturasUrl && (
                  <ButtonCustom variant="outline" size="lg" fullWidth asChild>
                    <Link href={acoesRapidas.detalhesAssinaturasUrl}>
                      Ver assinaturas
                    </Link>
                  </ButtonCustom>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
        </div>
      )}
    </div>
  );
}
