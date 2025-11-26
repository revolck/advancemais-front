"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EstagioRowProps {
  estagio: {
    id: string;
    status?: string;
    empresa?: string;
    cargo?: string;
    criadoEm?: string;
    atualizadoEm?: string;
    inicioPrevisto?: string;
    fimPrevisto?: string;
    aluno?: {
      id: string;
      nome?: string;
      email?: string;
      telefone?: string;
    };
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const getStatusColor = (status?: string) => {
  const statusUpper = (status || "").toUpperCase();
  switch (statusUpper) {
    case "ATIVO":
    case "EM_ANDAMENTO":
    case "INICIADO":
      return "bg-green-100 text-green-800 border-green-200";
    case "CONCLUIDO":
    case "FINALIZADO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PENDENTE":
    case "AGUARDANDO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
    case "DESISTENTE":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case "ATIVO":
      return "Ativo";
    case "EM_ANDAMENTO":
      return "Em andamento";
    case "INICIADO":
      return "Iniciado";
    case "CONCLUIDO":
      return "Concluído";
    case "FINALIZADO":
      return "Finalizado";
    case "PENDENTE":
      return "Pendente";
    case "AGUARDANDO":
      return "Aguardando";
    case "CANCELADO":
      return "Cancelado";
    case "DESISTENTE":
      return "Desistente";
    default:
      return status;
  }
};

export function EstagioRow({ estagio }: EstagioRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const alunoNome = estagio.aluno?.nome || estagio.aluno?.email || "—";
  const empresa = estagio.empresa || "—";
  const cargo = estagio.cargo || "—";
  const status = estagio.status;
  const atualizado = formatDate(
    estagio.atualizadoEm || estagio.fimPrevisto || estagio.criadoEm
  );

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    // TODO: Ajustar rota quando a página de detalhes de estágio existir
    // router.push(`/dashboard/cursos/estagios/${estagio.id}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {getInitials(alunoNome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[200px]">
              {alunoNome}
            </div>
            {estagio.aluno?.email && estagio.aluno?.nome && (
              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                {estagio.aluno.email}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[150px]">{empresa}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[150px]">{cargo}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {status ? (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", getStatusColor(status))}
          >
            {getStatusLabel(status)}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{atualizado}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate}
              disabled={isNavigating || true} // Desabilitado até existir a página de detalhes
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Visualizar estágio"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Em breve"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
