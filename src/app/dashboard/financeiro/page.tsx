"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  TrendingUp,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Trophy,
  Medal,
  Award,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectCustom } from "@/components/ui/custom/select";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { financeiroMockData, type RankingItem } from "@/mockData/financeiro";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
});

const percent = (value: number, digits = 1) =>
  `${value.toFixed(digits).replace(".", ",")}%`;

// Componente de Ranking
interface RankingCardProps {
  title: string;
  items: RankingItem[];
}

function RankingCard({ title, items }: RankingCardProps) {
  const getMedalIcon = (position: number) => {
    if (position === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
    if (position === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    }
    if (position === 3) {
      return <Award className="h-5 w-5 text-amber-600" />;
    }
    return (
      <span className="text-sm font-semibold text-gray-400">{position}º</span>
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3">
        <h4 className="!mb-0 text-base font-semibold">{title}</h4>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.position}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getMedalIcon(item.position)}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {currency.format(item.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type ViewMode = "day" | "week" | "month" | "year" | "period";

const viewOptions = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
  { value: "period", label: "Período" },
];

export default function FinanceiroDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const {
    resumo,
    cashflowTrend,
    distribuicaoReceita,
    top5Cursos,
    top5Planos,
    top5Empresas,
    top5Alunos,
  } = financeiroMockData;

  // Atualizar última atualização a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Formatar período selecionado
  const formattedPeriod = useMemo(() => {
    if (viewMode === "period" && dateRange.from && dateRange.to) {
      return `Dados de ${format(dateRange.from, "dd/MM/yyyy", {
        locale: ptBR,
      })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    if (viewMode === "month") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `Dados de ${format(firstDay, "dd/MM/yyyy", {
        locale: ptBR,
      })} a ${format(lastDay, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    // Para outros modos, usar período padrão do mês atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `Dados de ${format(firstDay, "dd/MM/yyyy", {
      locale: ptBR,
    })} a ${format(lastDay, "dd/MM/yyyy", { locale: ptBR })}`;
  }, [viewMode, dateRange]);

  // Formatar última atualização
  const formattedLastUpdate = useMemo(() => {
    return `Última atualização: ${format(lastUpdate, "dd/MM/yyyy", {
      locale: ptBR,
    })} às ${format(lastUpdate, "HH:mm", { locale: ptBR })}`;
  }, [lastUpdate]);

  const handleViewModeChange = (value: string | null) => {
    if (value) {
      setViewMode(value as ViewMode);
      if (value !== "period") {
        setDateRange({ from: null, to: null });
      }
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Dados para o gráfico de barras (planos recorrentes e cursos únicos)
  const receitaData = useMemo(() => {
    return cashflowTrend.map((item) => ({
      month: item.month,
      planos: item.planos,
      cursos: item.cursos,
    }));
  }, [cashflowTrend]);

  const statCards = useMemo((): StatisticCard[] => {
    return [
      {
        icon: TrendingUp,
        iconBg: "bg-blue-100 text-blue-600",
        value: currency.format(resumo.receitaMensal),
        label: "Receita mensal",
        info: (
          <Badge
            variant="outline"
            className="border-emerald-200 text-emerald-700 bg-emerald-50"
          >
            +{percent(resumo.crescimento)} vs mês anterior
          </Badge>
        ),
        cardBg: "bg-blue-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-purple-100 text-purple-600",
        value: currency.format(resumo.mrr),
        label: "MRR (planos)",
        info: (
          <span className="text-xs text-gray-500">
            {resumo.planosAtivos} planos ativos
          </span>
        ),
        cardBg: "bg-purple-50/50",
      },
      {
        icon: GraduationCap,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: currency.format(resumo.ticketMedio),
        label: "Ticket médio",
        info: (
          <span className="text-xs text-gray-500">
            {resumo.alunosPagantes} alunos pagantes
          </span>
        ),
        cardBg: "bg-indigo-50/50",
      },
      {
        icon: AlertTriangle,
        iconBg: "bg-amber-100 text-amber-600",
        value: percent(resumo.inadimplencia),
        label: "Inadimplência",
        info: <span className="text-xs text-gray-500">Meta &lt; 4%</span>,
        cardBg: "bg-amber-50/50",
      },
    ];
  }, [resumo]);

  return (
    <div className="space-y-8 pb-8">
      {/* Card de período e filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-700 font-medium">
            {formattedPeriod}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formattedLastUpdate}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === "period" && (
            <div className="w-[300px] [&_button]:bg-white [&_input]:bg-white">
              <DatePickerRangeCustom
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Selecionar período"
                size="sm"
                clearable={true}
                format="dd/MM/yyyy"
              />
            </div>
          )}
          <div className="w-[180px] [&_button]:bg-white">
            <SelectCustom
              mode="single"
              size="sm"
              options={viewOptions}
              value={viewMode}
              placeholder="Visualização"
              onChange={handleViewModeChange}
              fullWidth={false}
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={statCards}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      {/* Charts */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-none">
          <CardHeader className="pb-0">
            <div className="mt-0">
              <h4 className="!mb-0">Fluxo de receita</h4>
              <p className="!text-sm">
                Receita consolidada de planos corporativos e cursos.
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <RechartsTooltip
                  formatter={(value: number) => currency.format(value)}
                />
                <Legend />
                <Bar
                  dataKey="planos"
                  fill="#a78bfa"
                  name="Planos"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="cursos"
                  fill="#fb7185"
                  name="Cursos"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none">
          <CardHeader>
            <div className="mt-0">
              <h4 className="!mb-0">Distribuição da receita</h4>
              <p className="!text-sm">
                Participação de cada linha de receita no mês
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={distribuicaoReceita}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {distribuicaoReceita.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => currency.format(value)}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {distribuicaoReceita.map((segmento) => (
                <div
                  key={segmento.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: segmento.color }}
                    />
                    <span className="text-sm text-slate-600">
                      {segmento.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {currency.format(segmento.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Rankings */}
      <section>
        <div className="mb-4">
          <h3 className="!mb-0">Rankings</h3>
          <p className="!text-sm text-gray-500">
            Principais destaques de receita e engajamento
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <RankingCard title="Top 5 Cursos" items={top5Cursos} />
          <RankingCard title="Top 5 Planos" items={top5Planos} />
          <RankingCard title="Top 5 Empresas" items={top5Empresas} />
          <RankingCard title="Top 5 Alunos" items={top5Alunos} />
        </div>
      </section>
    </div>
  );
}
