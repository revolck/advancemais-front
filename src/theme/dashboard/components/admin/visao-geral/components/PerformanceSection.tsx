"use client";

import Link from "next/link";
import { TrendingUp, Award, Users, BookOpen, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ChartsCustom } from "@/components/ui/custom/charts-custom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { VisaoGeralPerformance } from "@/api/cursos";
import type { ChartData, ChartConfig } from "@/components/ui/custom/charts-custom";

interface PerformanceSectionProps {
  data: any;
  isLoading?: boolean;
}

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export function PerformanceSection({ data, isLoading }: PerformanceSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Dados para gráfico radial de taxa de conclusão
  const taxaConclusao = data.taxaConclusao ?? 0;
  const conclusaoChartData: ChartData[] = [
    { name: "Concluídos", value: taxaConclusao },
    { name: "Pendentes", value: 100 - taxaConclusao },
  ];

  const conclusaoChartConfig: ChartConfig = {
    "Concluídos": { color: "#8b5cf6", label: "Concluídos" },
    "Pendentes": { color: "#e5e7eb", label: "Pendentes" },
  };

  // Dados para gráfico de barras dos cursos mais populares
  const cursosMaisPopulares = data.cursosMaisPopulares ?? data.cursos ?? [];
  const popularChartData: ChartData[] = cursosMaisPopulares.slice(0, 5).map((curso: any) => ({
    name: (curso.cursoNome ?? curso.nome ?? "").length > 20 ? (curso.cursoNome ?? curso.nome ?? "").substring(0, 20) + "..." : (curso.cursoNome ?? curso.nome ?? ""),
    inscricoes: curso.totalInscricoes ?? 0,
    turmas: curso.totalTurmas ?? 0,
  }));

  const popularChartConfig: ChartConfig = {
    inscricoes: { color: "#3b82f6", label: "Inscrições" },
    turmas: { color: "#10b981", label: "Turmas" },
  };

  return (
    <div className="space-y-6">
      {/* Taxa de Conclusão Geral com Gráfico Radial */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
            <TrendingUp className="size-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Taxa de Conclusão Geral</p>
              <p className="text-4xl font-bold text-purple-600 mb-3">
                {formatPercent(data.taxaConclusao)}
              </p>
              <Progress value={data.taxaConclusao} className="h-3 bg-purple-100" />
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600">Concluídos: {formatPercent(data.taxaConclusao)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-gray-600">Pendentes: {formatPercent(100 - data.taxaConclusao)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ChartsCustom
              type="radial"
              data={conclusaoChartData}
              config={conclusaoChartConfig}
              height={200}
              innerRadius={60}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              showTooltip={true}
              showLegend={false}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Cursos Mais Populares */}
      {data.cursosMaisPopulares.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Top 5 Cursos Mais Populares
            </h3>
          </div>
          <ChartContainer config={popularChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="inscricoes" radius={[8, 8, 0, 0]} fill="#3b82f6" />
                <Bar dataKey="turmas" radius={[8, 8, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Lista de Cursos Mais Populares */}
      {data.cursosMaisPopulares.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Cursos Mais Populares
            </h3>
          </div>
          <div className="space-y-2">
            {cursosMaisPopulares.map((curso: any, index: number) => (
              <Link
                key={curso.cursoId ?? curso.id ?? index}
                href={`/dashboard/cursos/${curso.cursoId ?? curso.id}`}
              >
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm group-hover:bg-blue-200 transition-colors">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {curso.cursoNome ?? curso.nome}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">{curso.cursoCodigo ?? curso.codigo ?? ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {curso.totalInscricoes ?? 0} inscrições
                    </p>
                    <p className="text-xs text-gray-500">
                      {curso.totalTurmas ?? 0} {(curso.totalTurmas ?? 0) === 1 ? "turma" : "turmas"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cursos com Maior Taxa de Conclusão */}
      {(data.cursosComMaiorTaxaConclusao ?? data.cursos ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Award className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Cursos com Maior Taxa de Conclusão
            </h3>
          </div>
          <div className="space-y-2">
            {(data.cursosComMaiorTaxaConclusao ?? data.cursos ?? []).map((curso: any, index: number) => (
              <Link
                key={curso.cursoId ?? curso.id ?? index}
                href={`/dashboard/cursos/${curso.cursoId ?? curso.id}`}
              >
                <div className="p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm group-hover:bg-emerald-200 transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {curso.cursoNome ?? curso.nome}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{curso.cursoCodigo ?? curso.codigo ?? ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatPercent(curso.taxaConclusao ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={curso.taxaConclusao ?? 0} className="h-2.5 bg-emerald-100" />
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="font-medium">
                        {curso.totalConcluidos ?? 0} de {curso.totalInscricoes ?? 0} concluídos
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

