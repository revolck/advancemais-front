"use client";

import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  GraduationCap,
  Layers,
  Users,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState } from "@/components/ui/custom";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { Skeleton } from "@/components/ui/skeleton";
import { getInstrutorOverview } from "@/api/instrutor";
import type { InstrutorOverviewResponse } from "@/api/instrutor";
import {
  listFrequenciasGlobal,
  type ListFrequenciasParams,
  type ListFrequenciasResponse,
} from "@/api/cursos";
import { cn } from "@/lib/utils";

type ApiLikeError = Error & {
  status?: number;
  code?: string;
  details?: {
    code?: string;
    message?: string;
  };
};

type StatusItem = {
  label: string;
  value: number;
  barClassName: string;
};

interface StatusSummaryCardProps {
  title: string;
  total: number;
  icon: LucideIcon;
  items: StatusItem[];
}

function toCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getFrequenciasTotal(response: ListFrequenciasResponse): number {
  const raw = response as unknown as {
    pagination?: { total?: number };
    data?:
      | unknown[]
      | {
          items?: unknown[];
          pagination?: { total?: number };
          data?: {
            items?: unknown[];
            pagination?: { total?: number };
          };
        };
  };

  const total =
    raw.pagination?.total ??
    (typeof raw.data === "object" && raw.data && !Array.isArray(raw.data)
      ? raw.data.pagination?.total ?? raw.data.data?.pagination?.total
      : undefined);

  if (typeof total === "number") return total;

  if (Array.isArray(raw.data)) return raw.data.length;

  const nestedItems =
    (typeof raw.data === "object" &&
      raw.data &&
      !Array.isArray(raw.data) &&
      (raw.data.items ??
        raw.data.data?.items)) ||
    [];

  return Array.isArray(nestedItems) ? nestedItems.length : 0;
}

async function getInstrutorFrequenciasCount(
  params?: Pick<ListFrequenciasParams, "status">
): Promise<number> {
  const response = await listFrequenciasGlobal({
    page: 1,
    pageSize: 1,
    ...(params ?? {}),
  });

  return getFrequenciasTotal(response);
}

function resolveErrorCopy(error: unknown): {
  title: string;
  description: string;
} {
  const apiError = error as ApiLikeError | undefined;
  const status = apiError?.status;
  const code = String(
    apiError?.details?.code ?? apiError?.code ?? "",
  ).toUpperCase();
  const backendMessage =
    apiError?.details?.message ||
    apiError?.message ||
    "Não foi possível carregar os dados agora.";

  if (status === 401 || code === "UNAUTHORIZED") {
    return {
      title: "Sessão expirada",
      description:
        "Faça login novamente para acessar a visão geral do instrutor.",
    };
  }

  if (status === 403 || code === "FORBIDDEN") {
    return {
      title: "Acesso não permitido",
      description: backendMessage,
    };
  }

  if (
    (status === 500 && code === "INSTRUTOR_SCOPE_ERROR") ||
    code === "INSTRUTOR_SCOPE_ERROR"
  ) {
    return {
      title: "Erro ao aplicar escopo do instrutor",
      description: backendMessage,
    };
  }

  return {
    title: "Erro ao carregar visão geral",
    description: backendMessage,
  };
}

function StatusSummaryCard({
  title,
  total,
  icon: Icon,
  items,
}: StatusSummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm! font-semibold! text-gray-900! mb-0!">
            {title}
          </p>
          <p className="text-xs! text-gray-500! mb-0!">
            {total.toLocaleString("pt-BR")} total
          </p>
        </div>
        <div className="rounded-lg bg-gray-100 p-2 text-gray-700">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const percentage =
            total > 0
              ? Math.max(
                  0,
                  Math.min(100, Math.round((item.value / total) * 100)),
                )
              : 0;

          return (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600">
                <span>{item.label}</span>
                <span className="font-medium text-gray-700">
                  {item.value.toLocaleString("pt-BR")} ({percentage}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    item.barClassName,
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VisaoGeralInstrutor() {
  const {
    data: response,
    isLoading: isOverviewLoading,
    error,
    refetch,
  } = useQuery<InstrutorOverviewResponse>({
    queryKey: ["instrutor-overview"],
    queryFn: () => getInstrutorOverview(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: (failureCount, err) => {
      const apiError = err as ApiLikeError | undefined;
      const status = apiError?.status;
      const code = String(
        apiError?.details?.code ?? apiError?.code ?? "",
      ).toUpperCase();

      if (
        status === 401 ||
        status === 403 ||
        code === "INSTRUTOR_SCOPE_ERROR"
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const overview = response?.data;
  const { data: totalFrequencias = 0, isLoading: isTotalFrequenciasLoading } =
    useQuery<number>({
      queryKey: ["instrutor-overview", "frequencias", "total"],
      queryFn: () => getInstrutorFrequenciasCount(),
      enabled: Boolean(overview),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    });

  const {
    data: frequenciasPendentes = 0,
    isLoading: isFrequenciasPendentesLoading,
  } = useQuery<number>({
    queryKey: ["instrutor-overview", "frequencias", "pendentes"],
    queryFn: () => getInstrutorFrequenciasCount({ status: "PENDENTE" }),
    enabled: Boolean(overview),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isLoading =
    isOverviewLoading ||
    (Boolean(overview) &&
      (isTotalFrequenciasLoading || isFrequenciasPendentesLoading));

  const totalNotas =
    Math.max(
      toCount(overview?.statusPorCategoria.notas.total),
      toCount(overview?.metricasGerais.totalNotasPendentes) +
        toCount(overview?.metricasGerais.totalNotasLancadas),
    ) || 0;

  const totalFrequenciasEscopo = Math.max(totalFrequencias, frequenciasPendentes);

  const atualizadoEmLabel = (() => {
    if (!overview?.atualizadoEm) return null;

    const parsedDate = new Date(overview.atualizadoEm);
    if (Number.isNaN(parsedDate.getTime())) return null;

    return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  })();

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="rounded-xl border border-gray-200/60 bg-white p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200/60 bg-white p-6"
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

        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    const feedback = resolveErrorCopy(error);

    return (
      <EmptyState
        title={feedback.title}
        description={feedback.description}
        illustration="fileNotFound"
        actions={
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-[var(--primary-color)] hover:underline"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  const overviewCards: StatisticCard[] = [
    {
      icon: GraduationCap,
      iconBg: "bg-emerald-100 text-emerald-600",
      value: overview.cards.cursos.total || overview.metricasGerais.totalCursos,
      label: "Cursos",
      cardBg: "bg-emerald-50/50",
      info: (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Escopo atual
        </span>
      ),
    },
    {
      icon: Layers,
      iconBg: "bg-violet-100 text-violet-600",
      value: overview.metricasGerais.totalTurmas,
      label: "Turmas",
      cardBg: "bg-violet-50/50",
      info: (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
          Vinculadas ao instrutor
        </span>
      ),
    },
    {
      icon: Users,
      iconBg: "bg-blue-100 text-blue-600",
      value: overview.cards.alunos.total,
      label: "Alunos",
      cardBg: "bg-blue-50/50",
      info: (
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          Ativos: {overview.cards.alunos.ativos.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      icon: Video,
      iconBg: "bg-indigo-100 text-indigo-600",
      value: overview.cards.aulas.total,
      label: "Aulas",
      cardBg: "bg-indigo-50/50",
      info: (
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          Hoje: {overview.cards.aulas.hoje.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      icon: ClipboardList,
      iconBg: "bg-amber-100 text-amber-600",
      value: overview.cards.provas.total,
      label: "Provas",
      cardBg: "bg-amber-50/50",
      info: (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Pendentes correção:{" "}
          {overview.cards.provas.pendentesCorrecao.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      icon: ClipboardCheck,
      iconBg: "bg-rose-100 text-rose-600",
      value: totalNotas,
      label: "Notas",
      cardBg: "bg-rose-50/50",
      info: (
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
          Pendentes: {overview.cards.notas.pendentes.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      icon: AlertTriangle,
      iconBg: "bg-orange-100 text-orange-600",
      value: totalFrequenciasEscopo,
      label: "Frequências",
      cardBg: "bg-orange-50/50",
      info: (
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
          Pendentes: {frequenciasPendentes.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      icon: CalendarDays,
      iconBg: "bg-cyan-100 text-cyan-600",
      value: overview.cards.agenda.eventos || overview.metricasGerais.totalEventosAgenda,
      label: "Eventos",
      cardBg: "bg-cyan-50/50",
      info: (
        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
          Próx. 7 dias: {overview.cards.agenda.proximos7Dias.toLocaleString("pt-BR")}
        </span>
      ),
    },
  ];

  const statusData = [
    {
      key: "alunos",
      title: "Alunos",
      total: overview.statusPorCategoria.alunos.total,
      icon: Users,
      items: [
        {
          label: "Ativos",
          value: overview.statusPorCategoria.alunos.ativos,
          barClassName: "bg-emerald-500",
        },
        {
          label: "Inativos",
          value: overview.statusPorCategoria.alunos.inativos,
          barClassName: "bg-slate-400",
        },
      ],
    },
    {
      key: "provas",
      title: "Provas",
      total: overview.statusPorCategoria.provas.total,
      icon: ClipboardList,
      items: [
        {
          label: "Abertas",
          value: overview.statusPorCategoria.provas.abertas,
          barClassName: "bg-amber-500",
        },
        {
          label: "Encerradas",
          value: overview.statusPorCategoria.provas.encerradas,
          barClassName: "bg-slate-400",
        },
      ],
    },
    {
      key: "notas",
      title: "Notas",
      total: overview.statusPorCategoria.notas.total,
      icon: ClipboardCheck,
      items: [
        {
          label: "Pendentes",
          value: overview.statusPorCategoria.notas.pendentes,
          barClassName: "bg-red-500",
        },
        {
          label: "Concluídas",
          value: overview.statusPorCategoria.notas.concluidas,
          barClassName: "bg-emerald-500",
        },
      ],
    },
    {
      key: "aulas",
      title: "Aulas",
      total: overview.statusPorCategoria.aulas.total,
      icon: Video,
      items: [
        {
          label: "Agendadas",
          value: overview.statusPorCategoria.aulas.agendadas,
          barClassName: "bg-blue-500",
        },
        {
          label: "Realizadas",
          value: overview.statusPorCategoria.aulas.realizadas,
          barClassName: "bg-indigo-500",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-xl border border-gray-200/60 bg-white p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {atualizadoEmLabel ? (
            <div className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Clock3 className="size-3.5" />
              Atualizado em {atualizadoEmLabel}
            </div>
          ) : null}
        </div>

        <CardsStatistics
          cards={overviewCards}
          gridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-base! mb-0! font-semibold! text-gray-900!">
            Status por categoria
          </h3>
          <p className="text-sm! text-gray-500!">
            Distribuição atual dentro do escopo do instrutor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {statusData.map((group) => (
            <StatusSummaryCard
              key={group.key}
              title={group.title}
              total={group.total}
              icon={group.icon}
              items={group.items}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
