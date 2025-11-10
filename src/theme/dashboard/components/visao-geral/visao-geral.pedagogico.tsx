"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BookOpen, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { getPlataformaOverviewPedagogico } from "@/api/dashboard/pedagogico";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { QuickActionsPedagogico } from "./components/QuickActionsPedagogico";
import {
  DonutChartComponent,
  type DonutChartSegment,
} from "@/components/ui/custom/charts-custom/components/DonutChartComponent";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  PlataformaOverviewData,
  PlataformaUsuariosStats,
  PlataformaCursosStats,
} from "@/api/dashboard/types";

/**
 * Métricas gerais filtradas para pedagógico (sem empresas/vagas/financeiro)
 */
interface PedagogicoMetricasGerais {
  // Cursos
  totalCursos: number;
  cursosPublicados: number;
  cursosRascunho: number;
  totalTurmas: number;
  turmasAtivas: number;
  turmasInscricoesAbertas: number;
  // Alunos
  totalAlunos: number;
  totalAlunosAtivos: number;
  totalAlunosInscritos: number;
  totalAlunosConcluidos: number;
  // Instrutores
  totalInstrutores: number;
  totalInstrutoresAtivos: number;
  // Usuários
  totalUsuarios: number;
  // Candidatos
  totalCandidatos: number;
  totalCandidatosAtivos: number;
}

/**
 * Tipo filtrado para pedagógico - apenas cursos e usuários (sem empresas/vagas)
 */
interface PedagogicoOverviewData {
  metricasGerais: PedagogicoMetricasGerais;
  usuarios: PlataformaUsuariosStats;
  cursos: PlataformaCursosStats;
}

// Cores para cada tipo de usuário (constante, não precisa estar no componente)
const usuarioTipoColors: Record<string, string> = {
  Alunos: "#3b82f6",
  Instrutores: "#10b981",
  Candidatos: "#f59e0b",
  Admins: "#ef4444",
  Moderadores: "#06b6d4",
};

export function VisaoGeralPedagogico() {
  const [hoveredSegment, setHoveredSegment] =
    useState<DonutChartSegment | null>(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery<PedagogicoOverviewData>({
    queryKey: ["plataforma-overview-pedagogico"],
    queryFn: async () => {
      const result = await getPlataformaOverviewPedagogico();
      if (!result.success || !result.data) {
        throw new Error("Resposta inválida da API");
      }
      // Criar objeto filtrado APENAS com cursos e usuários (sem empresas/vagas)
      const data = result.data;

      // Retorna apenas os dados permitidos para pedagógico (cursos e usuários)
      return {
        metricasGerais: {
          // Cursos
          totalCursos: data.metricasGerais?.totalCursos || 0,
          cursosPublicados: data.metricasGerais?.cursosPublicados || 0,
          cursosRascunho: data.metricasGerais?.cursosRascunho || 0,
          totalTurmas: data.metricasGerais?.totalTurmas || 0,
          turmasAtivas: data.metricasGerais?.turmasAtivas || 0,
          turmasInscricoesAbertas:
            data.metricasGerais?.turmasInscricoesAbertas || 0,
          // Alunos
          totalAlunos: data.metricasGerais?.totalAlunos || 0,
          totalAlunosAtivos: data.metricasGerais?.totalAlunosAtivos || 0,
          totalAlunosInscritos: data.metricasGerais?.totalAlunosInscritos || 0,
          totalAlunosConcluidos:
            data.metricasGerais?.totalAlunosConcluidos || 0,
          // Instrutores
          totalInstrutores: data.metricasGerais?.totalInstrutores || 0,
          totalInstrutoresAtivos:
            data.metricasGerais?.totalInstrutoresAtivos || 0,
          // Usuários
          totalUsuarios: data.metricasGerais?.totalUsuarios || 0,
          // Candidatos
          totalCandidatos: data.metricasGerais?.totalCandidatos || 0,
          totalCandidatosAtivos:
            data.metricasGerais?.totalCandidatosAtivos || 0,
        },
        usuarios: data.usuarios || {
          porTipo: {
            alunos: 0,
            instrutores: 0,
            candidatos: 0,
            admins: 0,
            moderadores: 0,
          },
          porStatus: {
            ativos: 0,
            inativos: 0,
            bloqueados: 0,
            pendentes: 0,
          },
          crescimentoMensal: [],
        },
        cursos: data.cursos || {
          porStatus: {
            publicados: 0,
            rascunho: 0,
            despublicados: 0,
          },
          porCategoria: [],
          crescimentoMensal: [],
        },
        // NÃO incluir empresas, vagas ou faturamento
      };
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
        icon: Users,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricasGerais.totalAlunos,
        label: "Total de Alunos",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-purple-100 text-purple-600",
        value: metricasGerais.totalInstrutores,
        label: "Total de Instrutores",
        cardBg: "bg-purple-50/50",
      },
    ];
  }, [response]);

  // Dados formatados para o DonutChart (apenas tipos relevantes para pedagógico)
  const usuariosPorTipoDonutData = useMemo(() => {
    if (!response?.usuarios?.porTipo) return [];
    return [
      {
        label: "Alunos",
        value: response.usuarios.porTipo.alunos,
        color: usuarioTipoColors.Alunos,
      },
      {
        label: "Instrutores",
        value: response.usuarios.porTipo.instrutores,
        color: usuarioTipoColors.Instrutores,
      },
      {
        label: "Candidatos",
        value: response.usuarios.porTipo.candidatos,
        color: usuarioTipoColors.Candidatos,
      },
      {
        label: "Admins",
        value: response.usuarios.porTipo.admins,
        color: usuarioTipoColors.Admins,
      },
      {
        label: "Moderadores",
        value: response.usuarios.porTipo.moderadores,
        color: usuarioTipoColors.Moderadores,
      },
    ].filter((item) => item.value > 0);
  }, [response?.usuarios?.porTipo]);

  const totalUsuarios = useMemo(
    () => usuariosPorTipoDonutData.reduce((sum, item) => sum + item.value, 0),
    [usuariosPorTipoDonutData]
  );

  // Calcular valores para o centro do donut
  const activeSegment = usuariosPorTipoDonutData.find(
    (segment) => segment.label === hoveredSegment?.label
  );
  const displayValue = activeSegment?.value ?? totalUsuarios;
  const displayLabel = activeSegment?.label ?? "Total de Usuários";
  const displayPercentage = activeSegment
    ? (activeSegment.value / totalUsuarios) * 100
    : 100;

  // Dados para gráfico de status de cursos
  // Ordem invertida para gráfico horizontal (aparece de cima para baixo)
  const cursosStatusData = useMemo(() => {
    if (!response?.cursos?.porStatus) return [];
    const data = [
      {
        name: "Despublicados",
        value: Number(response.cursos.porStatus.despublicados || 0),
        color: "#ef4444", // vermelho
      },
      {
        name: "Rascunho",
        value: Number(response.cursos.porStatus.rascunho || 0),
        color: "#f59e0b", // laranja
      },
      {
        name: "Publicados",
        value: Number(response.cursos.porStatus.publicados || 0),
        color: "#10b981", // verde
      },
    ];

    // Debug em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Status Cursos] Dados do gráfico:",
        JSON.stringify(data, null, 2)
      );
      console.log(
        "[Status Cursos] Dados brutos:",
        JSON.stringify(response.cursos.porStatus, null, 2)
      );
      console.log("[Status Cursos] Valores:", {
        publicados: data[2].value,
        rascunho: data[1].value,
        despublicados: data[0].value,
      });
    }

    return data;
  }, [response?.cursos?.porStatus]);

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
            <BookOpen className="size-8 text-red-600" />
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
      {/* Primary Metrics - 4 Cards Principais (apenas Usuários, Cursos, Alunos, Instrutores) */}
      <div className="rounded-xl bg-white p-4 md:p-5 space-y-4">
        <CardsStatistics
          cards={primaryMetrics}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        />
      </div>

      {/* Quick Actions - Links Rápidos (apenas Cursos, Alunos e Instrutores) */}
      <QuickActionsPedagogico
        data={{
          metricasGerais: response.metricasGerais,
          usuarios: response.usuarios,
          cursos: response.cursos,
        }}
      />

      {/* Layout de 2 colunas: Usuários por Tipo | Status de Cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Gráfico de Usuários por Tipo - DonutChart */}
        {usuariosPorTipoDonutData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Users className="size-5" />
              </div>
              <div className="mt-5">
                <h4 className="!mb-0">Usuários por Tipo</h4>
                <p className="!text-sm">
                  Distribuição de usuários na plataforma
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-6">
              {/* DonutChart */}
              <div className="flex items-center justify-center flex-shrink-0">
                <DonutChartComponent
                  data={usuariosPorTipoDonutData}
                  size={260}
                  strokeWidth={35}
                  animationDuration={1.2}
                  animationDelayPerSegment={0.05}
                  highlightOnHover={true}
                  onSegmentHover={setHoveredSegment}
                  centerContent={
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={displayLabel}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center text-center px-3"
                      >
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                          {displayLabel}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 leading-none mb-1">
                          {displayValue.toLocaleString("pt-BR")}
                        </p>
                        {activeSegment && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-sm font-semibold"
                            style={{ color: activeSegment.color }}
                          >
                            {displayPercentage.toFixed(1)}%
                          </motion.p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  }
                />
              </div>

              {/* Legenda */}
              <div className="flex flex-col w-full space-y-1 pt-4 border-t border-gray-200">
                {usuariosPorTipoDonutData.map((segment, index) => {
                  const isHovered = hoveredSegment?.label === segment.label;
                  const percentage = (segment.value / totalUsuarios) * 100;

                  return (
                    <div key={segment.label}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 1.2 + index * 0.05,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className={cn(
                          "group relative flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                          isHovered
                            ? "bg-gray-50 shadow-sm"
                            : "hover:bg-gray-50/50"
                        )}
                        onMouseEnter={() => setHoveredSegment(segment)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <span
                              className="block h-3.5 w-3.5 rounded-full transition-transform duration-200"
                              style={{
                                backgroundColor: segment.color,
                                transform: isHovered
                                  ? "scale(1.15)"
                                  : "scale(1)",
                              }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium text-gray-900 truncate transition-colors",
                              isHovered && "text-gray-950"
                            )}
                          >
                            {segment.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
                          <span
                            className={cn(
                              "text-xs font-medium text-gray-500 tabular-nums transition-colors",
                              isHovered && "text-gray-600"
                            )}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold text-gray-900 tabular-nums min-w-[2rem] text-right transition-colors",
                              isHovered && "text-gray-950"
                            )}
                          >
                            {segment.value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        {isHovered && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full"
                            style={{ backgroundColor: segment.color }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.div>
                      {index < usuariosPorTipoDonutData.length - 1 && (
                        <div className="h-px bg-gray-100 mx-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Coluna 2: Gráfico de Status de Cursos - BarChart Horizontal */}
        {cursosStatusData.length > 0 && response?.cursos?.porStatus && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center size-10 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                <BookOpen className="size-5" />
              </div>
              <div className="mt-5">
                <h4 className="!mb-0">Status dos Cursos</h4>
                <p className="!text-sm">Distribuição de cursos por status</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cursosStatusData}
                  layout="horizontal"
                  margin={{ top: 5, right: 20, bottom: 20, left: 20 }}
                  barSize={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    interval={0}
                    height={60}
                    tickMargin={10}
                  />
                  <YAxis
                    type="number"
                    axisLine={true}
                    tickLine={true}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    formatter={(value: number) => [
                      `${value} curso${value !== 1 ? "s" : ""}`,
                      "Quantidade",
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {cursosStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda - ordem invertida para corresponder ao gráfico */}
            <div className="flex flex-col w-full space-y-2 pt-4 border-t border-gray-200 mt-4">
              {[...cursosStatusData]
                .reverse()
                .map((item, index, reversedArray) => {
                  const totalCursos = cursosStatusData.reduce(
                    (sum, i) => sum + i.value,
                    0
                  );
                  const percentage =
                    totalCursos > 0 ? (item.value / totalCursos) * 100 : 0;

                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <span
                              className="block h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500 tabular-nums">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm font-bold text-gray-900 tabular-nums min-w-[2rem] text-right">
                            {item.value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      {index < reversedArray.length - 1 && (
                        <div className="h-px bg-gray-100 mx-3" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
