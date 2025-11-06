"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Users, BookOpen, ChevronRight, Sun, Moon, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CursoTurma } from "@/api/cursos";

interface TurmaComCurso extends CursoTurma {
  cursoId?: number;
  cursoNome?: string;
}

interface TurmaRowProps {
  turma: CursoTurma | TurmaComCurso;
  showCurso?: boolean;
}

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  
  const normalized = status.toUpperCase().replace(/_/g, "_");
  
  // Mapeamento direto dos status da API
  const statusMap: Record<string, string> = {
    RASCUNHO: "Rascunho",
    PUBLICADO: "Publicado",
    INSCRICOES_ABERTAS: "Inscrições Abertas",
    INSCRICOES_ENCERRADAS: "Inscrições Encerradas",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDO: "Concluído",
    SUSPENSO: "Suspenso",
    CANCELADO: "Cancelado",
  };
  
  // Retorna o label mapeado ou formata o status
  if (statusMap[normalized]) {
    return statusMap[normalized];
  }
  
  // Fallback: formatação genérica
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
    case "PUBLICADO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "INSCRICOESABERTAS":
      return "bg-green-100 text-green-800 border-green-200";
    case "INSCRICOESENCERRADAS":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "EMANDAMENTO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CONCLUIDO":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "SUSPENSO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getTurnoLabel = (turno?: string) => {
  if (!turno) return "—";
  
  const turnoMap: Record<string, string> = {
    MANHA: "Manhã",
    TARDE: "Tarde",
    NOITE: "Noite",
    INTEGRAL: "Integral",
  };
  
  return turnoMap[turno.toUpperCase()] || turno;
};

const getTurnoIcon = (turno?: string) => {
  if (!turno) return Clock;
  
  const normalized = turno.toUpperCase();
  
  switch (normalized) {
    case "MANHA":
      return Sun;
    case "TARDE":
      return Sun;
    case "NOITE":
      return Moon;
    case "INTEGRAL":
      return Clock;
    default:
      return Clock;
  }
};

const getMetodoLabel = (metodo?: string) => {
  if (!metodo) return "—";
  
  const metodoMap: Record<string, string> = {
    ONLINE: "Online",
    PRESENCIAL: "Presencial",
    LIVE: "Ao vivo",
    SEMIPRESENCIAL: "Semipresencial",
  };
  
  return metodoMap[metodo.toUpperCase()] || metodo;
};

const getMetodoBadgeColor = (metodo?: string) => {
  if (!metodo) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const normalized = metodo.toUpperCase();
  
  switch (normalized) {
    case "ONLINE":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PRESENCIAL":
      return "bg-green-100 text-green-800 border-green-200";
    case "LIVE":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "SEMIPRESENCIAL":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function TurmaRow({ turma, showCurso = false }: TurmaRowProps) {
  const turmaComCurso = turma as TurmaComCurso;
  
  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900">{turma.nome}</div>
          {turma.codigo && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
              {turma.codigo}
            </code>
          )}
        </div>
      </TableCell>
      {showCurso && (
        <TableCell className="py-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span>{turmaComCurso.cursoNome || "—"}</span>
          </div>
        </TableCell>
      )}
      <TableCell className="py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            {React.createElement(getTurnoIcon(turma.turno), {
              className: "h-4 w-4 text-gray-500 flex-shrink-0",
            })}
            <span className="font-medium">{getTurnoLabel(turma.turno)}</span>
          </div>
          <span className="text-gray-300">•</span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              getMetodoBadgeColor(turma.metodo)
            )}
          >
            {getMetodoLabel(turma.metodo)}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            getStatusColor(turma.status)
          )}
        >
          {getStatusLabel(turma.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            {formatDate(turma.dataInicio)} — {formatDate(turma.dataFim)}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span>
            {turma.vagasOcupadas ?? turma.inscricoesCount ?? 0}/{turma.vagasTotais ?? "—"}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User className="h-4 w-4 text-gray-400" />
          <span>{turma?.instrutor?.nome || turma?.instrutor?.id || "—"}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
              aria-label="Visualizar turma"
            >
              <Link href={`/dashboard/cursos/turmas/${turma.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Visualizar turma</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

