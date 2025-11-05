"use client";

import { EmptyState } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  User,
  Monitor,
  Clock,
  Users,
  Tag,
  Hash,
  type LucideIcon,
} from "lucide-react";
import type { CursoTurma } from "@/api/cursos";

interface AboutTabProps {
  turma: CursoTurma;
  cursoNome?: string;
  isLoading?: boolean;
}

const getMetodoLabel = (metodo?: string) => {
  switch (metodo?.toUpperCase()) {
    case "ONLINE":
      return "Online";
    case "PRESENCIAL":
      return "Presencial";
    case "LIVE":
      return "Live";
    case "SEMIPRESENCIAL":
      return "Semipresencial";
    default:
      return metodo || "—";
  }
};

const getTurnoLabel = (turno?: string) => {
  switch (turno?.toUpperCase()) {
    case "MANHA":
      return "Manhã";
    case "TARDE":
      return "Tarde";
    case "NOITE":
      return "Noite";
    case "INTEGRAL":
      return "Integral";
    default:
      return turno || "—";
  }
};

export function AboutTab({
  turma,
  cursoNome,
  isLoading = false,
}: AboutTabProps) {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} às ${timeStr}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const aboutSidebar: Array<{
    label: string;
    value: React.ReactNode | null;
    icon: LucideIcon;
  }> = [
    {
      label: "Curso",
      value: cursoNome ?? "—",
      icon: Tag,
    },
    {
      label: "Código",
      value: turma.codigo ? (
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500">
          {turma.codigo}
        </code>
      ) : null,
      icon: Hash,
    },
    {
      label: "Método",
      value: getMetodoLabel(turma.metodo),
      icon: Monitor,
    },
    {
      label: "Instrutor",
      value: turma.instrutor?.nome ?? "—",
      icon: User,
    },
    {
      label: "Turno",
      value: getTurnoLabel(turma.turno),
      icon: Clock,
    },
    {
      label: "Vagas (Inscrições/Total)",
      value:
        turma.vagasTotais != null
          ? `${turma.vagasOcupadas ?? turma.inscricoesCount ?? 0}/${turma.vagasTotais}`
          : "—",
      icon: Users,
    },
    {
      label: "Data de início",
      value: formatDate(turma.dataInicio),
      icon: CalendarDays,
    },
    {
      label: "Data de término",
      value: formatDate(turma.dataFim),
      icon: CalendarDays,
    },
    {
      label: "Inscrições abertas",
      value: formatDate(turma.dataInscricaoInicio),
      icon: CalendarDays,
    },
    {
      label: "Inscrições até",
      value: formatDate(turma.dataInscricaoFim),
      icon: CalendarDays,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
        <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex flex-1 flex-col space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,_7fr)_minmax(0,_3fr)]">
      <section className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de informações da turma"
          title="Informações da turma"
          description="Detalhes adicionais sobre a turma serão exibidos aqui."
          maxContentWidth="md"
        />
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <dl className="space-y-5 text-sm">
            {aboutSidebar
              .filter((info) => info.value !== null && info.value !== "—")
              .map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    <info.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <dt className="text-xs font-medium text-gray-500">
                      {info.label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {info.value ?? "—"}
                    </dd>
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}

