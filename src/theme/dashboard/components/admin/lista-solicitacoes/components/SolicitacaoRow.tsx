"use client";

import React from "react";
import {
  Calendar,
  Building2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
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
import { cn } from "@/lib/utils";
import type {
  SolicitacaoVaga,
  SolicitacaoStatus,
} from "@/api/vagas/solicitacoes/types";

const STATUS_CONFIG: Record<
  SolicitacaoStatus,
  { label: string; className: string }
> = {
  PENDENTE: {
    label: "EM ANÁLISE",
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

function formatCnpj(value?: string | null): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

type ActionType = "visualizar" | "empresa" | "aprovar" | "rejeitar" | null;

interface SolicitacaoRowProps {
  solicitacao: SolicitacaoVaga;
  onAprovar?: (id: string) => void;
  onRejeitar?: (id: string) => void;
  onVisualizar?: (solicitacao: SolicitacaoVaga) => void;
  onVerEmpresa?: (empresaId: string, solicitacaoId: string) => void;
  isDisabled?: boolean;
  loadingAction?: ActionType;
}

export function SolicitacaoRow({
  solicitacao,
  onAprovar,
  onRejeitar,
  onVisualizar,
  onVerEmpresa,
  isDisabled = false,
  loadingAction = null,
}: SolicitacaoRowProps) {
  const statusConfig =
    STATUS_CONFIG[solicitacao.status] ?? STATUS_CONFIG.PENDENTE;
  const isPendente = solicitacao.status === "PENDENTE";

  const handleVisualizar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    onVisualizar?.(solicitacao);
  };

  const handleEmpresa = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    onVerEmpresa?.(solicitacao.empresa.id, solicitacao.id);
  };

  const handleAprovar = () => {
    if (isDisabled) return;
    onAprovar?.(solicitacao.id);
  };

  const handleRejeitar = () => {
    if (isDisabled) return;
    onRejeitar?.(solicitacao.id);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      {/* Vaga */}
      <TableCell className="py-4 min-w-[280px] max-w-[320px]">
        <div className="flex items-center gap-2">
          <div className="font-bold text-gray-900 truncate text-sm">
            {solicitacao.vaga.titulo}
          </div>
          {solicitacao.vaga.codigo && (
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
              {solicitacao.vaga.codigo}
            </code>
          )}
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
            {solicitacao.empresa.cnpj && (
              <div className="text-xs text-gray-500 font-mono truncate">
                {formatCnpj(solicitacao.empresa.cnpj)}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="min-w-[120px] max-w-[160px]">
        <Badge
          className={`${statusConfig.className} uppercase tracking-wide text-[10px]`}
        >
          {statusConfig.label}
        </Badge>
      </TableCell>

      {/* Data da Solicitação */}
      <TableCell className="min-w-[100px] max-w-[120px]">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">
            {formatDate(solicitacao.dataSolicitacao)}
          </span>
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
                onClick={handleVisualizar}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-8 rounded-full cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-blue-50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {loadingAction === "visualizar" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Ver detalhes da vaga</span>
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
                onClick={handleEmpresa}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-8 rounded-full cursor-pointer text-gray-500 hover:text-purple-600 hover:bg-purple-50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {loadingAction === "empresa" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span className="sr-only">Ver empresa</span>
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
                  onClick={handleAprovar}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer text-emerald-600 bg-emerald-50 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 transition-all",
                    isDisabled && "opacity-50 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600"
                  )}
                >
                {loadingAction === "aprovar" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
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
                  onClick={handleRejeitar}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer text-red-600 bg-red-50 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 transition-all",
                    isDisabled && "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-600"
                  )}
                >
                {loadingAction === "rejeitar" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
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
