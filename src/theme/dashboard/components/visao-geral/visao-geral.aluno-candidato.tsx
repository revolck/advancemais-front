"use client";

import * as React from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Users, Briefcase, Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ButtonCustom, EmptyState } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CardsStatistics } from "@/components/ui/custom/cards-statistics";
import type { StatisticCard } from "@/components/ui/custom/cards-statistics";
import { getCandidatoDashboard } from "@/api/candidatos";
import type {
  CandidatoDashboardCandidatura,
  CandidatoDashboardCurso,
  CandidatoDashboardCursoStatus,
  CandidatoDashboardResponse,
} from "@/api/candidatos/types";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CourseCarousel } from "./components/CourseCarousel";
import { ViewVagaModal } from "@/theme/dashboard/components/aluno-candidato/vagas/components/ViewVagaModal";
import type { JobData } from "@/theme/website/components/career-opportunities/types";

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
};

function normalizeCursoStatus(status: string): CandidatoDashboardCursoStatus {
  const value = (status || "").trim().toLowerCase();
  if (value === "concluído" || value === "concluido") return "Concluído";
  if (value === "em progresso" || value === "em_progresso") return "Em progresso";
  if (value === "cancelado" || value === "trancado") return "Cancelado";
  if (
    value === "não iniciado" ||
    value === "nao iniciado" ||
    value === "nao_iniciado"
  )
    return "Não iniciado";
  return "Não iniciado";
}

function toStatusConfigKey(status: string): string {
  const normalized = normalizeCursoStatus(status);
  if (normalized === "Em progresso") return "EM_PROGRESSO";
  if (normalized === "Concluído") return "CONCLUIDO";
  return "NAO_INICIADO";
}

function CursoCard({ curso }: { curso: CandidatoDashboardCurso }) {
  const statusLabel = normalizeCursoStatus(String(curso.status));
  const statusConfig =
    STATUS_CONFIG[toStatusConfigKey(String(curso.status))] ||
    STATUS_CONFIG.NAO_INICIADO;
  const [imageError, setImageError] = React.useState(false);

  return (
    <Link href={`/dashboard/cursos/${curso.cursoId}`}>
      <Card className="border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 h-full cursor-pointer group overflow-hidden p-0 gap-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
              {!imageError && curso.foto ? (
                <>
                  <Image
                    src={curso.foto}
                    alt={curso.nome}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => setImageError(true)}
                    unoptimized={curso.foto.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
              )}

              <div className="absolute top-3 right-3 z-20">
                <Badge
                  className={cn(
                    statusConfig.color,
                    "text-xs px-2.5 py-1 font-medium backdrop-blur-sm bg-white/90"
                  )}
                >
                  {statusLabel}
                </Badge>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-5">
              <h5 className="mb-0!">{curso.nome}</h5>

              <p className="text-xs! text-gray-600! mb-4! line-clamp-2! min-h-[2.5em]!">
                {curso.descricao ?? "—"}
              </p>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Progresso
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      curso.progresso === 100 ? "text-emerald-600" : "text-blue-600"
                    )}
                  >
                    {curso.progresso}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      curso.progresso === 100
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                    )}
                    style={{ width: `${curso.progresso}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-auto flex items-center gap-1.5 pt-3 border-t border-gray-100">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Iniciado{" "}
                  <span className="font-medium text-gray-600">
                    {curso.iniciadoEm
                      ? formatDistanceToNow(new Date(curso.iniciadoEm), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : "—"}
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

function CandidaturaCard({
  candidatura,
  onViewVaga,
}: {
  candidatura: CandidatoDashboardCandidatura;
  onViewVaga: (idOrSlug: string, initialJob?: JobData | null) => void;
}) {
  const dataFormatada = formatDistanceToNow(new Date(candidatura.aplicadaEm), {
    addSuffix: true,
    locale: ptBR,
  });

  const initialJob = useMemo((): JobData => {
    const empresaValue = (candidatura.empresa || "").trim();
    const empresaAnonima = empresaValue.toLowerCase() === "anônima";
    return {
      id: String(candidatura.vagaId || ""),
      slug: candidatura.slug ? String(candidatura.slug) : undefined,
      titulo: candidatura.nomeVaga || "Vaga",
      empresa: empresaValue || "Empresa",
      empresaAnonima,
      empresaLogo: undefined,
      localizacao: candidatura.local || "Não informado",
      tipoContrato: candidatura.regimeTrabalho || "Não informado",
      modalidade: candidatura.modalidade || "Não informado",
      categoria: "Geral",
      nivel: "Não informado",
      descricao: "Carregando detalhes completos da vaga...",
      dataPublicacao: candidatura.publicadaEm
        ? new Date(candidatura.publicadaEm).toLocaleDateString("pt-BR")
        : "Não informado",
      inscricoesAte: undefined,
      pcd: false,
      destaque: false,
      salario: undefined,
      beneficios: undefined,
      requisitos: undefined,
      vagasDisponiveis: undefined,
      urlCandidatura: undefined,
      isActive: true,
    };
  }, [candidatura]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() =>
        onViewVaga(candidatura.vagaId || candidatura.slug, initialJob)
      }
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onViewVaga(candidatura.vagaId || candidatura.slug, initialJob);
      }}
      className="cursor-pointer"
    >
      <Card className="border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 h-full cursor-pointer group overflow-hidden p-0 gap-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col h-full">
            <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-emerald-400/30" />
              </div>
            </div>

            <div className="flex-1 flex flex-col p-5">
              <h5 className="mb-0!">{candidatura.nomeVaga}</h5>

              <p className="text-xs! text-gray-600! mb-4! line-clamp-2! min-h-[2.5em]!">
                {candidatura.empresa}
              </p>

              {candidatura.local ? (
                <p className="text-xs! text-gray-600! mb-1!">
                  {candidatura.local}
                </p>
              ) : null}

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{dataFormatada}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>{candidatura.regimeTrabalho}</span>
                </div>
              </div>

              <ButtonCustom
                variant="primary"
                size="sm"
                fullWidth
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewVaga(candidatura.vagaId || candidatura.slug, initialJob);
                }}
              >
                Ver Vaga
              </ButtonCustom>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VisaoGeralAlunoCandidato() {
  const [viewVagaIdOrSlug, setViewVagaIdOrSlug] = React.useState<string | null>(
    null,
  );
  const [viewVagaInitialJob, setViewVagaInitialJob] =
    React.useState<JobData | null>(null);

  const dashboardQuery = useQuery<CandidatoDashboardResponse>({
    queryKey: ["aluno-candidato", "dashboard"],
    queryFn: () => getCandidatoDashboard({ cache: "no-store" }),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const metricas = dashboardQuery.data?.metricas ?? null;
  const cursos = dashboardQuery.data?.cursos ?? [];
  const candidaturas = dashboardQuery.data?.candidaturas ?? [];

  const handleViewVaga = React.useCallback(
    (idOrSlug: string, initialJob?: JobData | null) => {
      const value = (idOrSlug || "").trim();
      if (!value) return;
      setViewVagaInitialJob(initialJob ?? null);
      setViewVagaIdOrSlug(value);
    },
    [],
  );

  const primaryMetrics = useMemo((): StatisticCard[] => {
    if (!metricas) {
      return [
        {
          icon: BookOpen,
          iconBg: "bg-blue-100 text-blue-600",
          value: 0,
          label: "Cursos em Progresso",
          cardBg: "bg-blue-50/50",
        },
        {
          icon: CheckCircle2,
          iconBg: "bg-emerald-100 text-emerald-600",
          value: 0,
          label: "Cursos Concluídos",
          cardBg: "bg-emerald-50/50",
        },
        {
          icon: Briefcase,
          iconBg: "bg-green-100 text-green-600",
          value: 0,
          label: "Candidaturas enviadas",
          cardBg: "bg-green-50/50",
        },
        {
          icon: Users,
          iconBg: "bg-indigo-100 text-indigo-600",
          value: 0,
          label: "Total de Cursos",
          cardBg: "bg-indigo-50/50",
        },
      ];
    }

    return [
      {
        icon: BookOpen,
        iconBg: "bg-blue-100 text-blue-600",
        value: metricas.cursosEmProgresso,
        label: "Cursos em Progresso",
        cardBg: "bg-blue-50/50",
      },
      {
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 text-emerald-600",
        value: metricas.cursosConcluidos,
        label: "Cursos Concluídos",
        cardBg: "bg-emerald-50/50",
      },
      {
        icon: Briefcase,
        iconBg: "bg-green-100 text-green-600",
        value: metricas.totalCandidaturas,
        label: "Candidaturas enviadas",
        cardBg: "bg-green-50/50",
      },
      {
        icon: Users,
        iconBg: "bg-indigo-100 text-indigo-600",
        value: metricas.totalCursos,
        label: "Total de Cursos",
        cardBg: "bg-indigo-50/50",
      },
    ];
  }, [metricas]);

  return (
    <div className="space-y-8 pb-8">
      <ViewVagaModal
        isOpen={Boolean(viewVagaIdOrSlug)}
        onOpenChange={(open) => {
          if (open) return;
          setViewVagaIdOrSlug(null);
          setViewVagaInitialJob(null);
        }}
        idOrSlug={viewVagaIdOrSlug}
        initialJob={viewVagaInitialJob}
      />

      <div className="space-y-4">
        <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
          {dashboardQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200/60 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardsStatistics
              cards={primaryMetrics}
              gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {dashboardQuery.isLoading ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 bg-white rounded-2xl overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2.5 w-full rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : cursos.length > 0 ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <CourseCarousel
              itemsPerPage={4}
              title="Meus Cursos"
              showIndicators={cursos.length > 4}
            >
              {cursos.slice(0, 8).map((curso) => (
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

      <div className="space-y-4">
        {dashboardQuery.isLoading ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 bg-white rounded-2xl overflow-hidden"
                >
                  <Skeleton className="h-32 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : candidaturas.length > 0 ? (
          <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
            <CourseCarousel
              itemsPerPage={4}
              title="Últimas Candidaturas Enviadas"
              showIndicators={candidaturas.length > 4}
            >
              {candidaturas.slice(0, 8).map((candidatura) => (
                <CandidaturaCard
                  key={candidatura.id}
                  candidatura={candidatura}
                  onViewVaga={handleViewVaga}
                />
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

      {dashboardQuery.isError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Não foi possível carregar todas as informações do seu dashboard agora.
        </div>
      ) : null}
    </div>
  );
}
