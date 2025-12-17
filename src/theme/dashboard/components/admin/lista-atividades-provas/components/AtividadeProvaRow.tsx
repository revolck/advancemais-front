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
import type { TurmaProva } from "@/api/cursos";

interface ProvaRowProps {
  aula: TurmaProva & {
    cursoId?: number | string;
    cursoNome?: string;
    turmaId?: string;
    turmaNome?: string;
  };
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

export function AtividadeProvaRow({
  aula,
  showTurma = false,
  isDisabled = false,
  onNavigateStart,
}: ProvaRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;

    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/cursos/atividades-provas/${aula.id}`);

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
            <span className="font-medium text-gray-900">
              {aula.titulo || aula.nome || "Prova sem título"}
            </span>
            {aula.etiqueta && (
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
                {aula.etiqueta}
              </code>
            )}
          </div>
          {aula.descricao && (
            <p className="text-xs text-gray-500 line-clamp-1">{aula.descricao}</p>
          )}
        </div>
      </TableCell>
      {showTurma && (
        <TableCell className="py-4 px-3">
          {(aula as any).turmaNome ? (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">{(aula as any).turmaNome}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </TableCell>
      )}
      <TableCell className="py-4 px-3">
        {(aula as any).cursoNome ? (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{(aula as any).cursoNome}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </TableCell>
      <TableCell className="py-4 px-3">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            aula.status === "PUBLICADA"
              ? "bg-green-100 text-green-800 border-green-200"
              : aula.status === "RASCUNHO"
              ? "bg-gray-100 text-gray-800 border-gray-200"
              : aula.status === "EM_ANDAMENTO"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : aula.status === "CONCLUIDA"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : aula.status === "CANCELADA"
              ? "bg-red-100 text-red-800 border-red-200"
              : aula.ativo !== false
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-800 border-gray-200"
          )}
        >
          {aula.status === "PUBLICADA"
            ? "Publicada"
            : aula.status === "RASCUNHO"
            ? "Rascunho"
            : aula.status === "EM_ANDAMENTO"
            ? "Em Andamento"
            : aula.status === "CONCLUIDA"
            ? "Concluída"
            : aula.status === "CANCELADA"
            ? "Cancelada"
            : aula.ativo !== false
            ? "Ativa"
            : "Inativa"}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-3">
        {aula.dataInicio ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {new Date(aula.dataInicio).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </TableCell>
      <TableCell className="py-4 px-3 text-center">
        <div className="text-sm text-gray-600">
          {aula.peso ? `${aula.peso}` : "—"}
        </div>
      </TableCell>
      <TableCell className="py-4 px-3 text-center">
        <div className="flex items-center justify-center">
          {aula.valePonto !== false ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300" />
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{formatDate(aula.data || aula.dataInicio || "")}</span>
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
              aria-label="Visualizar atividade/prova"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar atividade/prova"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
