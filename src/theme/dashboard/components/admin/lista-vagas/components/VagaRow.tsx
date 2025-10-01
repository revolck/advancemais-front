"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { VagaListItem } from "@/api/vagas";

interface VagaRowProps {
  vaga: VagaListItem;
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

export function VagaRow({ vaga }: VagaRowProps) {
  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
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

      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={vaga.empresa.avatarUrl} />
            <AvatarFallback>
              {vaga.empresa.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium text-gray-900">{vaga.empresa.nome}</div>
            <div className="text-sm text-gray-500">
              {vaga.empresa.codUsuario}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex flex-col">
          <div className="text-sm text-gray-900">
            {vaga.localizacao.cidade}, {vaga.localizacao.estado}
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
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(vaga.status))}
        >
          {getStatusLabel(vaga.status)}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <div className="text-sm text-gray-900">
          {formatDate(vaga.inseridaEm)}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="text-sm text-gray-900">
          {vaga.inscricoesAte ? formatDate(vaga.inscricoesAte) : "Não definida"}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-600">
              {vaga.numeroVagas || "?"}
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {vaga.numeroVagas
              ? `vaga${vaga.numeroVagas > 1 ? "s" : ""}`
              : "Não informado"}
          </span>
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
              aria-label="Visualizar vaga"
            >
              <Link href={`/dashboard/vagas/${vaga.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Visualizar vaga</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
