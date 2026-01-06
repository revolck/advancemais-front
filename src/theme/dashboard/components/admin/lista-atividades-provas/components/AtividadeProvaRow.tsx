"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
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
import type { AvaliacaoListItem } from "../hooks/useAvaliacoesDashboardQuery";

interface ProvaRowProps {
  avaliacao: AvaliacaoListItem;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getStatusLabel = (status?: string) => {
  if (!status) return "—";

  const statusMap: Record<string, string> = {
    ATIVO: "Ativo",
    INATIVO: "Inativo",
    RASCUNHO: "Rascunho",
    PUBLICADA: "Publicada",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  };

  const normalized = status.toUpperCase();
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
    case "ATIVO":
      return "bg-green-100 text-green-800 border-green-200";
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "PUBLICADA":
      return "bg-green-100 text-green-800 border-green-200";
    case "INATIVO":
      return "bg-gray-100 text-gray-800 border-gray-200";
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
  avaliacao,
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
    router.push(`/dashboard/cursos/atividades-provas/${avaliacao.id}`);

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
        <div className="flex items-center gap-2">
          {avaliacao.descricao ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium text-gray-900 cursor-help">
                  {avaliacao.titulo || "Avaliação sem título"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">{avaliacao.descricao}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="font-medium text-gray-900">
              {avaliacao.titulo || "Avaliação sem título"}
            </span>
          )}
          {avaliacao.etiqueta && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 shrink-0">
              {avaliacao.etiqueta}
            </code>
          )}
          {avaliacao.tipo && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                avaliacao.tipo === "PROVA"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}
            >
              {avaliacao.tipo === "PROVA" ? "Prova" : "Atividade"}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 px-3">
        <div className="space-y-1.5">
          {avaliacao.cursoNome && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-900">
                {avaliacao.cursoNome}
              </span>
            </div>
          )}
          {avaliacao.turmaNome && (
            <div className="flex items-center gap-2 pl-6">
              <div className="h-0.5 w-2 bg-gray-300 rounded-full" />
              <span className="text-xs text-gray-600">{avaliacao.turmaNome}</span>
            </div>
          )}
          {!avaliacao.cursoNome && !avaliacao.turmaNome && (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 px-3">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(avaliacao.status))}
        >
          {getStatusLabel(avaliacao.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-3">
        {avaliacao.dataInicio ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {new Date(avaliacao.dataInicio).toLocaleDateString("pt-BR", {
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
      <TableCell className="py-4 px-3">
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Peso</span>
            <span className="text-sm font-semibold text-gray-900">
              {avaliacao.peso ? `${avaliacao.peso}` : "—"}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-gray-500 font-medium">Vale</span>
            <div className="flex items-center justify-center">
              {avaliacao.valePonto ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{formatDate(avaliacao.criadoEm)}</span>
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
