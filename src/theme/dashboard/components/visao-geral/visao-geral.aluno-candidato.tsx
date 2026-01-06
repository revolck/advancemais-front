"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
  Briefcase,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
//
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMockAlunoCandidatoData } from "@/mockData/aluno-candidato";
import type {
  AlunoCandidatoOverviewData,
  MockCursoData,
  MockVagaData,
} from "@/mockData/aluno-candidato";
import { CourseCarousel } from "./components/CourseCarousel";

// Configuração de cores para status
const STATUS_CONFIG: Record<
  string,
  { color: string; bgColor: string; textColor: string }
> = {
  EM_PROGRESSO: {
    color: "bg-blue-100 text-blue-700",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  CONCLUIDO: {
    color: "bg-emerald-100 text-emerald-700",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  NAO_INICIADO: {
    color: "bg-gray-100 text-gray-700",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
  },
  APROVADO: {
    color: "bg-emerald-100 text-emerald-700",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  REPROVADO: {
    color: "bg-red-100 text-red-700",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
  },
};

/**
 * Card para um curso
 */
function CursoCard({ curso }: { curso: MockCursoData }) {
  const statusConfig =
    STATUS_CONFIG[curso.status] || STATUS_CONFIG.NAO_INICIADO;

  const [imageError, setImageError] = React.useState(false);

  return (
    <Link href={`/dashboard/cursos/${curso.id}`}>
      <Card className="border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 h-full cursor-pointer group overflow-hidden p-0 gap-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            {/* Imagem do curso - Sem espaços */}
            <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
              {!imageError && curso.imagemUrl ? (
                <>
                  <Image
                    src={curso.imagemUrl}
                    alt={curso.nome}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
              )}
              {/* Badge de status sobre a imagem */}
              <div className="absolute top-3 right-3 z-20">
                <Badge
                  className={cn(
                    statusConfig.color,
                    "text-xs px-2.5 py-1 font-medium backdrop-blur-sm bg-white/90"
                  )}
                >
                  {curso.status === "EM_PROGRESSO"
                    ? "Em progresso"
                    : curso.status === "CONCLUIDO"
                    ? "Concluído"
                    : "Não iniciado"}
                </Badge>
              </div>
            </div>

            {/* Conteúdo do card */}
            <div className="flex-1 flex flex-col p-5">
              <h5 className="mb-0!">{curso.nome}</h5>

              <p className="text-xs! text-gray-600! mb-4! line-clamp-2! min-h-[2.5em]!">
                {curso.descricao}
              </p>

              {/* Progress bar - Melhorado */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Progresso
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      curso.percentualConcluido === 100
                        ? "text-emerald-600"
                        : "text-blue-600"
                    )}
                  >
                    {curso.percentualConcluido}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      curso.percentualConcluido === 100
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                    )}
                    style={{ width: `${curso.percentualConcluido}%` }}
                  />
                </div>
              </div>

              {/* Data de início */}
              <div className="text-xs text-gray-500 mt-auto flex items-center gap-1.5 pt-3 border-t border-gray-100">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Iniciado em{" "}
                  <span className="font-medium text-gray-600">
                    {format(new Date(curso.dataInicio), "dd 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Card para vaga
 */
function VagaCard({ vaga }: { vaga: MockVagaData }) {
  const dataFormatada = formatDistanceToNow(new Date(vaga.dataPostagem), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Link href={`/dashboard/vagas/${vaga.id}`}>
      <Card className="border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 h-full cursor-pointer group overflow-hidden p-0 gap-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            {/* Header com gradiente */}
            <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-emerald-400/30" />
              </div>
            </div>

            {/* Conteúdo do card */}
            <div className="flex-1 flex flex-col p-5">
              <h5 className="mb-0!">{vaga.titulo}</h5>

              <p className="text-xs! text-gray-600! mb-4! line-clamp-2! min-h-[2.5em]!">
                {vaga.empresa}
              </p>

              {vaga.localizacao && (
                <p className="text-xs! text-gray-600! mb-1!">
                  {vaga.localizacao}
                </p>
              )}

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{dataFormatada}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vaga.tipoContrato}</span>
                </div>
              </div>

              <ButtonCustom variant="primary" size="sm" fullWidth>
                Ver Vaga
              </ButtonCustom>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Visão geral para Aluno/Candidato
 */
export function VisaoGeralAlunoCandidato() {
  const data = useMemo(() => getMockAlunoCandidatoData(), []);

  const primaryMetrics = useMemo((): StatisticCard[] => {
    return [
      {
        icon: BookOpen,
        iconBg: "bg-blue-100 text-blue-600",
        value: data.estatisticas.cursosEmProgresso,
        label: "Cursos em Progresso",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: data.estatisticas.cursosConcluidos,
        label: "Cursos Concluídos",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-green-100 text-green-600",
        value: data.estatisticas.vagasSalvas,
        label: "Vagas Salvas",
        cardBg: "bg-green-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: data.estatisticas.totalCursos,
        label: "Total de Cursos",
        cardBg: "bg-indigo-50/50",
      },
    ];
  }, [data]);

  // Removido certificadosMetrics pois não há mais certificados/currículos

  return (
    <div className="space-y-8 pb-8">
      {/* Métricas Principais */}
      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
          <CardsStatistics
            cards={primaryMetrics}
            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          />
        </div>
      </div>

      {/* Grid de Cursos - Carrossel */}
      <div className="space-y-4">
        {data.cursos && data.cursos.length > 0 ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <CourseCarousel
              itemsPerPage={4}
              title="Meus Cursos"
              showIndicators={data.cursos.length > 4}
            >
              {data.cursos.slice(0, 8).map((curso: MockCursoData) => (
                <CursoCard key={curso.id} curso={curso} />
              ))}
            </CourseCarousel>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 border border-gray-200/60">
            <EmptyState
              illustration="fileNotFound"
              title="Nenhum curso encontrado"
              description="Você ainda não se inscreveu em nenhum curso"
            />
          </div>
        )}
      </div>

      {/* Seção de Últimas Candidaturas Enviadas - Carrossel */}
      <div className="space-y-4">
        {data.vagas && data.vagas.length > 0 ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <CourseCarousel
              itemsPerPage={4}
              title="Últimas Candidaturas Enviadas"
              showIndicators={data.vagas.length > 4}
            >
              {data.vagas.slice(0, 8).map((vaga: MockVagaData) => (
                <VagaCard key={vaga.id} vaga={vaga} />
              ))}
            </CourseCarousel>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 border border-gray-200/60">
            <EmptyState
              illustration="fileNotFound"
              title="Nenhuma candidatura encontrada"
              description="Você ainda não se candidatou a nenhuma vaga"
            />
          </div>
        )}
      </div>

      {/* Notas removidas */}
      {/* Frequência removida */}
      {/* Minha Formação removida */}
      {/* Fim do conteúdo da visão geral */}
    </div>
  );
}
