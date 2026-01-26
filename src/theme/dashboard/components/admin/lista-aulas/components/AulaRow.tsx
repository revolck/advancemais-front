"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { cn } from "@/lib/utils";
import {
  Video,
  Building2,
  Radio,
  RotateCcw,
  CheckCircle2,
  Circle,
  BookOpen,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Aula } from "@/api/aulas";

interface AulaRowProps {
  aula: Aula;
  showTurma?: boolean;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getModalidadeLabel = (modalidade?: string) => {
  if (!modalidade) return "—";

  const modalidadeMap: Record<string, string> = {
    ONLINE: "Online",
    PRESENCIAL: "Presencial",
    AO_VIVO: "Ao Vivo",
    SEMIPRESENCIAL: "Semipresencial",
  };

  return modalidadeMap[modalidade.toUpperCase()] || modalidade;
};

const getModalidadeIcon = (modalidade?: string) => {
  if (!modalidade) return Video;

  const normalized = modalidade.toUpperCase();

  switch (normalized) {
    case "ONLINE":
      return Video;
    case "PRESENCIAL":
      return Building2;
    case "AO_VIVO":
      return Radio;
    case "SEMIPRESENCIAL":
      return RotateCcw;
    default:
      return Video;
  }
};

const getModalidadeBadgeColor = (modalidade?: string) => {
  if (!modalidade) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = modalidade.toUpperCase();

  switch (normalized) {
    case "ONLINE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PRESENCIAL":
      return "bg-green-100 text-green-800 border-green-200";
    case "AO_VIVO":
      return "bg-red-100 text-red-800 border-red-200";
    case "SEMIPRESENCIAL":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";

  const normalized = status.toUpperCase().replace(/_/g, "_");

  const statusMap: Record<string, string> = {
    RASCUNHO: "Rascunho",
    PUBLICADA: "Publicada",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };

  if (statusMap[normalized]) {
    return statusMap[normalized];
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusColor = (status?: string) => {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

  const normalized = status.toUpperCase().replace(/_/g, "");

  switch (normalized) {
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PUBLICADA":
      return "bg-green-100 text-green-800 border-green-200";
    case "EMANDAMENTO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CONCLUIDA":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELADA":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function AulaRow({
  aula,
  showTurma = false,
  isDisabled = false,
  onNavigateStart,
}: AulaRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;

    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/cursos/aulas/${aula.id}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled
          ? "opacity-50 pointer-events-none"
          : "hover:bg-gray-50/50",
        isNavigating && "bg-blue-50/50"
      )}
    >
      <TableCell className="py-4 px-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{aula.titulo}</span>
            {aula.codigo && (
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
                {aula.codigo}
              </code>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(() => {
              const ModalidadeIcon = getModalidadeIcon(aula.modalidade);
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium inline-flex items-center gap-1.5 w-fit",
                    getModalidadeBadgeColor(aula.modalidade)
                  )}
                >
                  <ModalidadeIcon className="h-3.5 w-3.5" />
                  {getModalidadeLabel(aula.modalidade)}
                </Badge>
              );
            })()}

            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium inline-flex items-center gap-1.5 w-fit",
                aula.obrigatoria
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              )}
            >
              {aula.obrigatoria ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {aula.obrigatoria ? "Obrigatória" : "Opcional"}
            </Badge>
          </div>
        </div>
      </TableCell>
      {showTurma && (
        <TableCell className="py-4 px-3">
          {aula.turma ? (
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-gray-500 shrink-0">
                    Curso
                  </span>
                  <span className="text-sm text-gray-700 truncate min-w-0">
                    {aula.turma.curso?.nome || "—"}
                  </span>
                  {aula.turma.curso?.codigo && (
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
                      {aula.turma.curso.codigo}
                    </code>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-gray-500 shrink-0">
                    Turma
                  </span>
                  <span className="text-sm text-gray-700 truncate min-w-0">
                    {aula.turma.nome}
                  </span>
                  {aula.turma.codigo && (
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
                      {aula.turma.codigo}
                    </code>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </TableCell>
      )}
      <TableCell className="py-4 px-3">
        {aula.instrutor ? (
          <div className="flex items-center gap-3">
            <AvatarCustom
              name={aula.instrutor.nome}
              src={aula.instrutor.avatarUrl || undefined}
              size="sm"
              showStatus={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-gray-900 truncate text-sm">
                  {aula.instrutor.nome}
                </div>
                {aula.instrutor.codigo && (
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                    {aula.instrutor.codigo}
                  </code>
                )}
              </div>
              {aula.instrutor.cpf && (
                <div className="text-xs text-gray-500 font-mono truncate">
                  {aula.instrutor.cpf.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                    "$1.$2.$3-$4"
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </TableCell>
      <TableCell className="py-4 px-3">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(aula.status))}
        >
          {getStatusLabel(aula.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-3">
        {aula.dataInicio ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm! text-gray-700!">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="mb-0!">
                {new Date(aula.dataInicio).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            {(() => {
              const hasHoraInicio = Boolean(aula.horaInicio);
              const hasHoraFim = Boolean(aula.horaFim);
              const timeRange =
                hasHoraInicio && hasHoraFim
                  ? `${aula.horaInicio} → ${aula.horaFim}`
                  : aula.dataFim
                  ? `${new Date(aula.dataInicio).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} → ${new Date(aula.dataFim).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : null;

              if (!timeRange) {
                return (
                  <div className="text-xs! text-gray-500! font-mono! mb-0!">
                    Horário não definido
                  </div>
                );
              }

              return (
                <div className="text-xs! text-gray-500! font-mono! mb-0!">
                  {timeRange}
                </div>
              );
            })()}
            {aula.duracaoMinutos && (
              <div className="text-xs! text-gray-500! mt-1!">
                <Clock className="h-3 w-3 text-gray-400 inline mr-1" />
                {aula.duracaoMinutos} min
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="h-3.5 w-3.5 text-gray-300" />
              <span>Data não definida</span>
            </div>
            {aula.duracaoMinutos && (
              <div className="text-xs text-gray-500">
                <Clock className="h-3 w-3 text-gray-400 inline mr-1" />
                {aula.duracaoMinutos} min
              </div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{formatDate(aula.criadoEm)}</span>
        </div>
      </TableCell>
      <TableCell className="py-4 pl-1 pr-3 text-right w-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate}
              disabled={isRowDisabled}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating
                  ? "text-blue-600 bg-blue-100"
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                "disabled:opacity-50 disabled:cursor-wait"
              )}
              aria-label="Visualizar aula"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar aula"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
