"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SolicitacaoVaga, SolicitacaoStatus } from "../types";

const STATUS_CONFIG: Record<
  SolicitacaoStatus,
  { label: string; className: string }
> = {
  PENDENTE: {
    label: "PENDENTE",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  APROVADA: {
    label: "APROVADA",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  REJEITADA: {
    label: "REJEITADA",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  CANCELADA: {
    label: "CANCELADA",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

function formatDate(value?: string | null): string {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

interface SolicitacaoRowProps {
  solicitacao: SolicitacaoVaga;
  onAprovar?: (id: string) => void;
  onRejeitar?: (id: string) => void;
}

export function SolicitacaoRow({
  solicitacao,
  onAprovar,
  onRejeitar,
}: SolicitacaoRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const statusConfig = STATUS_CONFIG[solicitacao.status] ?? STATUS_CONFIG.PENDENTE;
  const isPendente = solicitacao.status === "PENDENTE";

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    router.push(`/dashboard/empresas/vagas/${encodeURIComponent(solicitacao.vaga.id)}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Vaga */}
      <TableCell className="py-4 min-w-[280px] max-w-[320px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
              {solicitacao.vaga.titulo.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-gray-900 truncate text-sm">
                {solicitacao.vaga.titulo}
              </div>
              {solicitacao.vaga.codigo && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {solicitacao.vaga.codigo}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Empresa */}
      <TableCell className="min-w-[200px] max-w-[250px]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
              {solicitacao.empresa.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium text-gray-900 truncate text-sm">
                {solicitacao.empresa.nome}
              </div>
              {solicitacao.empresa.codigo && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {solicitacao.empresa.codigo}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="min-w-[120px] max-w-[160px]">
        <Badge className={`${statusConfig.className} uppercase tracking-wide text-[10px]`}>
          {statusConfig.label}
        </Badge>
      </TableCell>

      {/* Data da Solicitação */}
      <TableCell className="min-w-[100px] max-w-[120px]">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">{formatDate(solicitacao.dataSolicitacao)}</span>
        </div>
      </TableCell>

      {/* Ações */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Ver detalhes da vaga */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Link href={`/dashboard/empresas/vagas/${solicitacao.vaga.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes da vaga</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Ver detalhes da vaga</TooltipContent>
          </Tooltip>

          {/* Ver empresa */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50"
              >
                <Link href={`/dashboard/empresas/${solicitacao.empresa.id}`}>
                  <Building2 className="h-4 w-4" />
                  <span className="sr-only">Ver empresa</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Ver empresa</TooltipContent>
          </Tooltip>

          {/* Aprovar solicitação */}
          {isPendente && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAprovar?.(solicitacao.id)}
                  className="h-8 w-8 rounded-full cursor-pointer text-emerald-600 bg-emerald-50 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="sr-only">Aprovar solicitação</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Aprovar solicitação</TooltipContent>
            </Tooltip>
          )}

          {/* Rejeitar solicitação */}
          {isPendente && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRejeitar?.(solicitacao.id)}
                  className="h-8 w-8 rounded-full cursor-pointer text-red-600 bg-red-50 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Rejeitar solicitação</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Rejeitar solicitação</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
