"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Award, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CardCustom } from "@/components/ui/custom/card-custom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  CursoPerformance,
  CursoTaxaConclusao,
  TurmaProximoInicio,
} from "@/api/cursos";

interface CursosCardsGridProps {
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
    color: "217 91% 60%", // HSL para azul
    bgColor: "bg-blue-500",
    hoverColor: "hover:text-blue-600",
    textColor: "text-blue-600",
  },
  {
    id: "mais-populares" as TabType,
    label: "Mais Populares",
    icon: TrendingUp,
    color: "142 76% 36%", // HSL para verde
    bgColor: "bg-emerald-500",
    hoverColor: "hover:text-emerald-600",
    textColor: "text-emerald-600",
  },
  {
    id: "taxa-conclusao" as TabType,
    label: "Taxa de Conclusão",
    icon: Award,
    color: "43 96% 56%", // HSL para âmbar
    bgColor: "bg-amber-500",
    hoverColor: "hover:text-amber-600",
    textColor: "text-amber-600",
  },
  {
    id: "proximos" as TabType,
    label: "Próximos",
    icon: Calendar,
    color: "270 91% 65%", // HSL para roxo
    bgColor: "bg-purple-500",
    hoverColor: "hover:text-purple-600",
    textColor: "text-purple-600",
  },
] as const;

// Imagem placeholder padrão para cursos
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop";

export function CursosCardsGrid({
  cursosPopulares,
  cursosMaisPopulares,
  cursosTaxaConclusao,
  cursosProximos,
  isLoading = false,
}: CursosCardsGridProps) {
  const [activeTab, setActiveTab] = useState<TabType>("populares");
  const isMobile = useIsMobile();

  const getCurrentData = () => {
    switch (activeTab) {
      case "populares":
        return cursosPopulares?.slice(0, 5) || [];
      case "mais-populares":
        return cursosMaisPopulares?.slice(0, 5) || [];
      case "taxa-conclusao":
        return cursosTaxaConclusao?.slice(0, 5) || [];
      case "proximos":
        return cursosProximos?.slice(0, 5) || [];
      default:
        return [];
    }
  };

  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const currentData = getCurrentData();

  // Função para gerar dados do card baseado no tipo
  const getCardData = (item: any, index: number) => {
    if (activeTab === "proximos") {
      const turma = item as any;
      return {
        id: turma.turmaId,
        title: turma.cursoNome ?? turma.nome ?? "Turma",
        subtitle: turma.diasParaInicio != null 
          ? `${turma.diasParaInicio} ${turma.diasParaInicio === 1 ? "dia" : "dias"} • ${formatDate(turma.dataInicio)}`
          : formatDate(turma.dataInicio),
        href: `/dashboard/cursos/${turma.cursoId ?? turma.turmaId}`,
        imageUrl: DEFAULT_IMAGE,
      };
    } else if (activeTab === "taxa-conclusao") {
      const curso = item as any;
      return {
        id: (curso.cursoId ?? curso.id ?? index).toString(),
        title: curso.cursoNome ?? curso.nome ?? "Curso",
        subtitle: `${formatPercentage(curso.taxaConclusao)} • ${curso.totalConcluidos ?? 0}/${curso.totalInscricoes ?? 0} concluídos`,
        href: `/dashboard/cursos/${curso.cursoId ?? curso.id}`,
        imageUrl: DEFAULT_IMAGE,
      };
    } else {
      const curso = item as any;
      return {
        id: (curso.cursoId ?? curso.id ?? index).toString(),
        title: curso.cursoNome ?? curso.nome ?? "Curso",
        subtitle: `${curso.totalInscricoes ?? 0} inscrições • ${curso.totalTurmas ?? 0} ${(curso.totalTurmas ?? 0) === 1 ? "turma" : "turmas"}`,
        href: `/dashboard/cursos/${curso.cursoId ?? curso.id}`,
        imageUrl: DEFAULT_IMAGE,
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/60 p-4">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div className="size-4 rounded bg-gray-200" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
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
                  "flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 relative whitespace-nowrap cursor-pointer",
                  "hover:bg-white/50",
                  isActive
                    ? "bg-white text-gray-900 font-semibold"
                    : "text-gray-600 font-medium hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-colors",
                    isActive ? tab.textColor : "text-gray-400"
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

      {/* Cards Content */}
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
                  className={cn("size-5", currentTab.textColor)}
                />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Nenhum curso encontrado nesta categoria
            </p>
          </div>
        ) : isMobile ? (
          // Mobile: Carrossel com 3 cards
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              containScroll: "trimSnaps",
              loop: false,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {currentData.map((item, index) => {
                const cardData = getCardData(item, index);
                return (
                  <CarouselItem
                    key={`${activeTab}-${cardData.id}-${index}`}
                    className="pl-2 md:pl-4 basis-1/3"
                  >
                    <CardCustom
                      imageUrl={cardData.imageUrl}
                      title={cardData.title}
                      subtitle={cardData.subtitle}
                      themeColor={currentTab?.color || "217 91% 60%"}
                      href={cardData.href}
                      className="h-[280px]"
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          // Desktop: Grid responsivo (5 colunas)
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentData.map((item, index) => {
              const cardData = getCardData(item, index);
              return (
                <CardCustom
                  key={`${activeTab}-${cardData.id}-${index}`}
                  imageUrl={cardData.imageUrl}
                  title={cardData.title}
                  subtitle={cardData.subtitle}
                  themeColor={currentTab?.color || "217 91% 60%"}
                  href={cardData.href}
                  className="h-[320px]"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

