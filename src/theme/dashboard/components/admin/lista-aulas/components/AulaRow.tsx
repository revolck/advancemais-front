"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        </div>
      </TableCell>
      {showTurma && (
        <TableCell className="py-4 px-3">
          {aula.turma ? (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">{aula.turma.nome}</span>
              {aula.turma.codigo && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
                  {aula.turma.codigo}
                </code>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </TableCell>
      )}
      <TableCell className="py-4 px-3">
        {aula.instrutor ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={(aula.instrutor as any).avatarUrl || undefined}
                alt={aula.instrutor.nome}
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                {aula.instrutor.nome.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
        {aula.dataInicio && aula.dataFim ? (
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
            <div className="text-xs! text-gray-500! font-mono! mb-0!">
              {new Date(aula.dataInicio).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" → "}
              {new Date(aula.dataFim).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </TableCell>
      <TableCell className="py-4 px-3 text-center">
        <div className="text-sm text-gray-600">
          {aula.duracaoMinutos ? `${aula.duracaoMinutos} min` : "—"}
        </div>
      </TableCell>
      <TableCell className="py-4 px-3 text-center">
        <div className="flex items-center justify-center">
          {aula.obrigatoria ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
        </div>
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
