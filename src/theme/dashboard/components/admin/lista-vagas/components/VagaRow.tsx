"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { VagaListItem } from "@/api/vagas";

interface VagaRowProps {
  vaga: VagaListItem;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "PUBLICADO":
      return "bg-green-100 text-green-800 border-green-200";
    case "RASCUNHO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "EM_ANALISE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "DESPUBLICADA":
      return "bg-red-100 text-red-800 border-red-200";
    case "PAUSADA":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "ENCERRADA":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "EXPIRADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "PUBLICADO":
      return "Publicada";
    case "RASCUNHO":
      return "Rascunho";
    case "EM_ANALISE":
      return "Em Análise";
    case "DESPUBLICADA":
      return "Despublicada";
    case "PAUSADA":
      return "Pausada";
    case "ENCERRADA":
      return "Encerrada";
    case "EXPIRADO":
      return "Expirada";
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

const formatCnpj = (value?: string | null): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

export function VagaRow({ 
  vaga,
  isDisabled = false,
  onNavigateStart,
}: VagaRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRowDisabled) return;
    
    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/empresas/vagas/${vaga.id}`);
    
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
      <TableCell className="py-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900">{vaga.titulo}</div>
          <Badge
            variant="outline"
            className="text-xs font-mono bg-gray-50 text-gray-600 border-gray-200 flex-shrink-0"
          >
            {vaga.codigo}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[200px] max-w-[250px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={vaga.empresa.avatarUrl} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
              {vaga.empresa.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium text-gray-900 truncate text-sm">
                {vaga.empresa.nome}
              </div>
              {vaga.empresa.codUsuario && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {vaga.empresa.codUsuario}
                </code>
              )}
            </div>
            {vaga.empresa.cnpj && (
              <div className="text-xs text-gray-500 font-mono truncate">
                {formatCnpj(vaga.empresa.cnpj)}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[140px]">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
          <div className="flex flex-col">
            <div className="text-sm text-gray-900">
              {vaga.localizacao?.cidade ?? "—"},{" "}
              {vaga.localizacao?.estado ?? "—"}
            </div>
            <div className="text-sm text-gray-500">
              {vaga.modalidade === "REMOTO"
                ? "Remoto"
                : vaga.modalidade === "PRESENCIAL"
                ? "Presencial"
                : vaga.modalidade === "HIBRIDO"
                ? "Híbrido"
                : vaga.modalidade}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[100px]">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(vaga.status))}
        >
          {getStatusLabel(vaga.status)}
        </Badge>
      </TableCell>

      <TableCell className="py-4 min-w-[120px]">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{formatDate(vaga.inseridaEm)}</span>
        </div>
      </TableCell>

      <TableCell className="py-4 min-w-[120px]">
        {vaga.inscricoesAte ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span>{formatDate(vaga.inscricoesAte)}</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-500">
            —
          </div>
        )}
      </TableCell>

      <TableCell className="py-4 min-w-[100px]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-600">
              {vaga.numeroVagas || "?"}
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {vaga.numeroVagas
              ? `vaga${vaga.numeroVagas > 1 ? "s" : ""}`
              : "—"}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4 w-12">
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
              aria-label="Visualizar vaga"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar vaga"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
