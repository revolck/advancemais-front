"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type {
  CursoPerformance,
  CursoTaxaConclusao,
  TurmaProximoInicio,
} from "@/api/cursos";

interface CursosListTabsProps {
  cursosPopulares: CursoPerformance[];
  cursosMaisPopulares: CursoPerformance[];
  cursosTaxaConclusao: CursoTaxaConclusao[];
  cursosProximos: TurmaProximoInicio[];
  isLoading?: boolean;
}

type TabType = "populares" | "mais-populares" | "taxa-conclusao" | "proximos";

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd MMM, yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const tabs = [
  {
    id: "populares" as TabType,
    label: "Cursos Populares",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    hoverColor: "hover:text-blue-600",
  },
  {
    id: "mais-populares" as TabType,
    label: "Mais Populares",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
    hoverColor: "hover:text-emerald-600",
  },
  {
    id: "taxa-conclusao" as TabType,
    label: "Taxa de Conclusão",
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-500",
    hoverColor: "hover:text-amber-600",
  },
  {
    id: "proximos" as TabType,
    label: "Próximos",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
    hoverColor: "hover:text-purple-600",
  },
] as const;

export function CursosListTabs({
  cursosPopulares,
  cursosMaisPopulares,
  cursosTaxaConclusao,
  cursosProximos,
  isLoading = false,
}: CursosListTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("populares");

  const getCurrentData = () => {
    switch (activeTab) {
      case "populares":
        return cursosPopulares?.slice(0, 5) || [];
      case "mais-populares":
        return cursosMaisPopulares || [];
      case "taxa-conclusao":
        return cursosTaxaConclusao || [];
      case "proximos":
        return cursosProximos?.slice(0, 5) || [];
      default:
        return [];
    }
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const currentData = getCurrentData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="size-4 rounded bg-gray-200" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="size-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
      {/* Tabs Header */}
      <div className="border-b border-gray-200/60 bg-gray-50/50">
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 relative whitespace-nowrap",
                  "hover:bg-white/50",
                  isActive
                    ? "bg-white text-gray-900 font-semibold"
                    : "text-gray-600 font-medium hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-colors",
                    isActive ? tab.color : "text-gray-400"
                  )}
                />
                <span className="text-sm">{tab.label}</span>
                {isActive && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
                      tab.bgColor
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {currentData.length === 0 ? (
          <div className="text-center py-12">
            <div
              className={cn(
                "inline-flex items-center justify-center size-12 rounded-full mb-3",
                currentTab?.bgColor + "/10"
              )}
            >
              {currentTab && (
                <currentTab.icon
                  className={cn("size-5", currentTab.color)}
                />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Nenhum curso encontrado nesta categoria
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTab === "proximos" ? (
              // Renderização para cursos próximos (TurmaProximoInicio)
              (currentData as TurmaProximoInicio[]).map((turma, index) => (
                <Link
                  key={turma.turmaId}
                  href={`/dashboard/cursos/${turma.cursoId}/turmas/${turma.turmaId}`}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-50 group",
                    index !== currentData.length - 1 &&
                      "border-b border-gray-200/60 pb-2"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center flex-shrink-0",
                      currentTab?.bgColor
                    )}
                  >
                    <Calendar className="size-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold text-gray-900 truncate transition-colors",
                        currentTab?.hoverColor
                      )}
                    >
                      {turma.cursoNome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {turma.turmaNome}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {turma.diasParaInicio}{" "}
                      {turma.diasParaInicio === 1 ? "dia" : "dias"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(turma.dataInicio)}
                    </p>
                  </div>
                </Link>
              ))
            ) : activeTab === "taxa-conclusao" ? (
              // Renderização para taxa de conclusão (CursoTaxaConclusao)
              (currentData as CursoTaxaConclusao[]).map((curso, index) => (
                <Link
                  key={curso.cursoId}
                  href={`/dashboard/cursos/${curso.cursoId}`}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-50 group",
                    index !== currentData.length - 1 &&
                      "border-b border-gray-200/60 pb-2"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center flex-shrink-0",
                      currentTab?.bgColor
                    )}
                  >
                    <Award className="size-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold text-gray-900 truncate transition-colors",
                        currentTab?.hoverColor
                      )}
                    >
                      {curso.cursoNome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {curso.cursoCodigo}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-600">
                      {formatPercentage(curso.taxaConclusao)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {curso.totalConcluidos}/{curso.totalInscricoes}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              // Renderização para cursos populares/mais populares (CursoPerformance)
              (currentData as CursoPerformance[]).map((curso, index) => (
                <Link
                  key={curso.cursoId}
                  href={`/dashboard/cursos/${curso.cursoId}`}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-50 group",
                    index !== currentData.length - 1 &&
                      "border-b border-gray-200/60 pb-2"
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center flex-shrink-0",
                      currentTab?.bgColor
                    )}
                  >
                    {activeTab === "populares" ? (
                      <BookOpen className="size-4 text-white" />
                    ) : (
                      <TrendingUp className="size-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold text-gray-900 truncate transition-colors",
                        currentTab?.hoverColor
                      )}
                    >
                      {curso.cursoNome}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {curso.cursoCodigo}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-gray-900">
                      {curso.totalInscricoes.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {curso.totalTurmas} turmas
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

