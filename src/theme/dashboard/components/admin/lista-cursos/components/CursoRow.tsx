"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, FolderTree, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Curso } from "@/api/cursos";

interface CursoRowProps {
  curso: Curso;
  categoriaName?: string | null;
  subcategoriaName?: string | null;
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
}: CursoRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(`/dashboard/cursos/${curso.id}`);
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
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
          <span>{categoriaName ?? "—"}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          {subcategoriaName ? (
            <>
              <FolderTree className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{subcategoriaName}</span>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{curso.cargaHoraria}h</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            getStatusColor(curso.statusPadrao)
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
              disabled={isNavigating}
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-wait cursor-pointer"
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
