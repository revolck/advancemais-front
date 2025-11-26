"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { PlataformaOverviewData } from "@/api/dashboard/types";
import { Users, Building2, BookOpen, Briefcase, BarChart3 } from "lucide-react";
import {
  DonutChartComponent,
  type DonutChartSegment,
} from "@/components/ui/custom/charts-custom/components/DonutChartComponent";
import { motion, AnimatePresence } from "framer-motion";

interface PlataformaChartsSectionProps {
  data: PlataformaOverviewData;
}

// Cores para cada tipo de usuário (constante, não precisa estar no componente)
const usuarioTipoColors: Record<string, string> = {
  Alunos: "#3b82f6",
  Instrutores: "#10b981",
  Empresas: "#8b5cf6",
  Candidatos: "#f59e0b",
  Admins: "#ef4444",
  Moderadores: "#06b6d4",
};

export function PlataformaChartsSection({
  data,
}: PlataformaChartsSectionProps) {
  // Estado para hover no gráfico de donut
  const [hoveredSegment, setHoveredSegment] =
    useState<DonutChartSegment | null>(null);

  // Dados formatados para o DonutChart
  const usuariosPorTipoDonutData = useMemo(() => {
    if (!data.usuarios?.porTipo) return [];
    return [
      {
        label: "Alunos",
        value: data.usuarios.porTipo.alunos,
        color: usuarioTipoColors.Alunos,
      },
      {
        label: "Instrutores",
        value: data.usuarios.porTipo.instrutores,
        color: usuarioTipoColors.Instrutores,
      },
      {
        label: "Empresas",
        value: data.usuarios.porTipo.empresas,
        color: usuarioTipoColors.Empresas,
      },
      {
        label: "Candidatos",
        value: data.usuarios.porTipo.candidatos,
        color: usuarioTipoColors.Candidatos,
      },
      {
        label: "Admins",
        value: data.usuarios.porTipo.admins,
        color: usuarioTipoColors.Admins,
      },
      {
        label: "Moderadores",
        value: data.usuarios.porTipo.moderadores,
        color: usuarioTipoColors.Moderadores,
      },
    ].filter((item) => item.value > 0);
  }, [data.usuarios?.porTipo]);

  const totalUsuarios = useMemo(
    () => usuariosPorTipoDonutData.reduce((sum, item) => sum + item.value, 0),
    [usuariosPorTipoDonutData]
  );

  // Dados para o gráfico de barras (mantido para compatibilidade se necessário)
  const usuariosPorTipoData = useMemo(() => {
    if (!data.usuarios?.porTipo) return [];
    return [
      { name: "Alunos", value: data.usuarios.porTipo.alunos },
      { name: "Instrutores", value: data.usuarios.porTipo.instrutores },
      { name: "Empresas", value: data.usuarios.porTipo.empresas },
      { name: "Candidatos", value: data.usuarios.porTipo.candidatos },
      { name: "Admins", value: data.usuarios.porTipo.admins },
      { name: "Moderadores", value: data.usuarios.porTipo.moderadores },
    ].filter((item) => item.value > 0);
  }, [data.usuarios]);

  // Preparar dados para gráfico de barras agrupadas - apenas 4 status principais
  const statusBarChartData = useMemo(() => {
    const chartData: Array<Record<string, string | number>> = [];

    // Usuários - apenas Ativo e Bloqueado
    if (data.usuarios?.porStatus) {
      const usuariosStatus = data.usuarios.porStatus;
      chartData.push({
        categoria: "Usuários",
        Ativo: usuariosStatus.ativos || 0,
        Bloqueado: usuariosStatus.bloqueados || 0,
        Publicado: 0,
        Encerrado: 0,
      });
    }

    // Cursos - apenas Publicado e Encerrado (despublicados)
    if (data.cursos?.porStatus) {
      const cursosStatus = data.cursos.porStatus;
      chartData.push({
        categoria: "Cursos",
        Ativo: 0,
        Bloqueado: 0,
        Publicado: cursosStatus.publicados || 0,
        Encerrado: cursosStatus.despublicados || 0,
      });
    }

    // Empresas - apenas Ativo e Bloqueado
    if (data.empresas?.porStatus) {
      const empresasStatus = data.empresas.porStatus;
      chartData.push({
        categoria: "Empresas",
        Ativo: empresasStatus.ativas || 0,
        Bloqueado: empresasStatus.bloqueadas || 0,
        Publicado: 0,
        Encerrado: 0,
      });
    }

    // Vagas - apenas Publicado e Encerrado
    if (data.vagas?.porStatus) {
      const vagasStatus = data.vagas.porStatus;
      chartData.push({
        categoria: "Vagas",
        Ativo: 0,
        Bloqueado: 0,
        Publicado: vagasStatus.publicadas || 0,
        Encerrado: vagasStatus.encerradas || 0,
      });
    }

    return chartData;
  }, [data]);

  // Status fixos que sempre aparecem no gráfico (em ordem específica)
  const statusKeys = useMemo(() => {
    return ["Ativo", "Bloqueado", "Publicado", "Encerrado"];
  }, []);

  // Cores para os 4 status principais
  const statusColors: Record<string, string> = {
    Ativo: "#10b981",
    Bloqueado: "#ef4444",
    Publicado: "#3b82f6",
    Encerrado: "#6b7280",
  };

  // Tooltip customizado
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const filteredPayload = payload.filter((entry: any) => entry.value > 0);
      if (filteredPayload.length === 0) return null;

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {filteredPayload.map((entry: any, index: number) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}:</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {entry.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const hasStatusData = statusBarChartData.length > 0;

  // Calcular valores para o centro do donut
  const activeSegment = usuariosPorTipoDonutData.find(
    (segment) => segment.label === hoveredSegment?.label
  );
  const displayValue = activeSegment?.value ?? totalUsuarios;
  const displayLabel = activeSegment?.label ?? "Total de Usuários";
  const displayPercentage = activeSegment
    ? (activeSegment.value / totalUsuarios) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Grid com dois gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários por Tipo - DonutChart */}
        {usuariosPorTipoDonutData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="mt-0">
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

        {/* Status por Categoria - Gráfico de Barras */}
        {hasStatusData && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="mt-0">
                <h4 className="!mb-0">Status por Categoria</h4>
                <p className="!text-sm">Distribuição de status por categoria</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={statusBarChartData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 48, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  domain={[0, "dataMax + 1"]}
                />
                <YAxis
                  type="category"
                  dataKey="categoria"
                  tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 600 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "15px" }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600 font-medium">
                      {value}
                    </span>
                  )}
                />
                {statusKeys.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={statusColors[key] || "#6b7280"}
                    radius={[0, 6, 6, 0]}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
