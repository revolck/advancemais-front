"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProvaRowProps {
  prova: {
    id: string;
    titulo?: string;
    nome?: string;
    descricao?: string;
    tipo?: string;
    status?: string;
    data?: string;
    dataInicio?: string;
    dataFim?: string;
    inicioPrevisto?: string;
    fimPrevisto?: string;
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

function formatDateTime(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

const getStatusColor = (status?: string) => {
  const statusUpper = (status || "").toUpperCase();
  switch (statusUpper) {
    case "ATIVO":
    case "PUBLICADO":
    case "ABERTO":
      return "bg-green-100 text-green-800 border-green-200";
    case "ENCERRADO":
    case "FINALIZADO":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PENDENTE":
    case "AGUARDANDO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
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
    case "PUBLICADO":
      return "Publicado";
    case "ABERTO":
      return "Aberto";
    case "ENCERRADO":
      return "Encerrado";
    case "FINALIZADO":
      return "Finalizado";
    case "PENDENTE":
      return "Pendente";
    case "AGUARDANDO":
      return "Aguardando";
    case "CANCELADO":
      return "Cancelado";
    default:
      return status;
  }
};

const getTipoLabel = (tipo?: string) => {
  if (!tipo) return "—";
  const tipoUpper = tipo.toUpperCase();
  switch (tipoUpper) {
    case "OBJETIVA":
      return "Objetiva";
    case "DISSERTATIVA":
      return "Dissertativa";
    case "MISTA":
      return "Mista";
    case "PRATICA":
      return "Prática";
    default:
      return tipo;
  }
};

export function ProvaRow({ prova }: ProvaRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const title = prova.titulo || prova.nome || prova.descricao || `Prova`;
  const tipo = getTipoLabel(prova.tipo);
  const inicio = prova.dataInicio || prova.data || prova.inicioPrevisto;
  const fim = prova.dataFim || prova.fimPrevisto;
  const status = prova.status || prova.tipo;

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    // TODO: Ajustar rota quando a página de detalhes de prova existir
    // router.push(`/dashboard/cursos/provas/${prova.id}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="font-medium text-gray-900">{title}</div>
          </div>
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
            {prova.id}
          </code>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-900">
          <span>{tipo}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{formatDateTime(inicio)}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{formatDateTime(fim)}</span>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate}
              disabled={isNavigating || true} // Desabilitado até existir a página de detalhes
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Visualizar prova"
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
