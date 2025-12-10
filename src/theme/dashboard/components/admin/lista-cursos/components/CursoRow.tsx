"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronRight,
  FolderTree,
  Clock,
  Loader2,
  DollarSign,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Curso } from "@/api/cursos";

// Formatar valor para exibição
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

interface CursoRowProps {
  curso: Curso;
  categoriaName?: string | null;
  subcategoriaName?: string | null;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PUBLICADO":
      return "bg-green-100 text-green-800 border-green-200";
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PUBLICADO":
      return "Publicado";
    case "RASCUNHO":
      return "Rascunho";
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function CursoRow({
  curso,
  categoriaName,
  subcategoriaName,
  isDisabled = false,
  onNavigateStart,
}: CursoRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;

    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/cursos/${curso.id}`);

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
        isNavigating && "bg-blue-50/50",
      )}
    >
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900">{curso.nome}</div>
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
            {curso.codigo}
          </code>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <FolderTree className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-medium">{categoriaName ?? "—"}</span>
            {subcategoriaName && (
              <span className="text-xs text-gray-500">{subcategoriaName}</span>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{curso.cargaHoraria}h</span>
        </div>
      </TableCell>

      {/* Coluna de Preço */}
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          {curso.gratuito ? (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              <Gift className="h-3 w-3 mr-1" />
              Gratuito
            </Badge>
          ) : curso.valor > 0 ? (
            <div className="flex flex-col gap-0.5">
              {curso.valorPromocional &&
              curso.valorPromocional < curso.valor ? (
                <>
                  <span className="text-xs line-through text-gray-400">
                    {formatCurrency(curso.valor)}
                  </span>
                  <span className="text-sm font-medium text-emerald-600">
                    {formatCurrency(curso.valorPromocional)}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(curso.valor)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            getStatusColor(curso.statusPadrao),
          )}
        >
          {getStatusLabel(curso.statusPadrao)}
        </Badge>
      </TableCell>

      <TableCell className="py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">{formatDate(curso.criadoEm)}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
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
                "disabled:opacity-50 disabled:cursor-wait",
              )}
              aria-label="Visualizar curso"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar curso"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
