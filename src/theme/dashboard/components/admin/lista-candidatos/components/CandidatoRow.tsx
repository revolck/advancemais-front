"use client";

import React, { useMemo, useCallback } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  MapPin,
  Clock,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CandidatoRowProps } from "../types";
import {
  formatDate,
  formatLocalizacao,
  getCandidatoInitials,
} from "../utils/formatters";
import type { Candidatura } from "@/api/candidatos/types";

const INACTIVE_CANDIDATURA_STATUSES: Candidatura["status"][] = [
  "RECUSADO",
  "DESISTIU",
  "NAO_COMPARECEU",
  "ARQUIVADO",
  "CANCELADO",
];

export function CandidatoRow({ candidato, onViewDetails }: CandidatoRowProps) {
  const candidaturas = useMemo(
    () => candidato.candidaturas ?? [],
    [candidato.candidaturas]
  );
  const totalCandidaturas = candidaturas.length;
  const candidaturasAtivas = useMemo(
    () =>
      candidaturas.filter(
        (candidatura: Candidatura) =>
          !INACTIVE_CANDIDATURA_STATUSES.includes(candidatura.status)
      ).length,
    [candidaturas]
  );

  const ultimaCandidatura = useMemo(() => {
    if (candidaturas.length === 0) return null;

    const getComparableTime = (candidatura: Candidatura) => {
      const baseDate = candidatura?.atualizadaEm ?? candidatura?.aplicadaEm;
      if (!baseDate) return 0;
      const parsed = new Date(baseDate);
      return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    return candidaturas.reduce<Candidatura>(
      (latest: Candidatura, current: Candidatura) => {
        return getComparableTime(current) > getComparableTime(latest)
          ? current
          : latest;
      },
      candidaturas[0]!
    );
  }, [candidaturas]);

  const ultimaCandidaturaEnvio = useMemo(
    () => ultimaCandidatura?.aplicadaEm ?? null,
    [ultimaCandidatura?.aplicadaEm]
  );
  const ultimaCandidaturaAtualizacao = useMemo(
    () =>
      ultimaCandidatura?.atualizadaEm &&
      ultimaCandidatura?.atualizadaEm !== ultimaCandidatura?.aplicadaEm
        ? ultimaCandidatura.atualizadaEm
        : null,
    [ultimaCandidatura?.atualizadaEm, ultimaCandidatura?.aplicadaEm]
  );

  const formatCpf = useCallback((cpf?: string | null) => {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }, []);

  const handleViewDetails = useCallback(() => {
    onViewDetails(candidato);
  }, [onViewDetails, candidato]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CONTRATADO":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bgColor: "bg-green-400/20",
          label: "Contratado",
        };
      case "ENTREVISTA":
        return {
          icon: Clock3,
          color: "text-blue-400",
          bgColor: "bg-blue-400/20",
          label: "Entrevista",
        };
      case "RECUSADO":
        return {
          icon: XCircle,
          color: "text-red-400",
          bgColor: "bg-red-400/20",
          label: "Recusado",
        };
      case "EM_ANALISE":
        return {
          icon: AlertCircle,
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/20",
          label: "Em Análise",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-400",
          bgColor: "bg-gray-400/20",
          label: status.toLowerCase().replace("_", " "),
        };
    }
  };

  const candidaturasTooltip = ultimaCandidatura ? (
    <TooltipContent sideOffset={8} className="max-w-72 p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-lg">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">
            Última candidatura
          </span>
        </div>

        {/* Job Info */}
        <div className="space-y-2">
          <div>
            <h6 className="font-medium text-white leading-snug">
              {ultimaCandidatura.vaga?.titulo ?? "Título indisponível"}
            </h6>
            {ultimaCandidatura.vaga?.empresa?.nome && (
              <p className="text-white/60 mt-1">
                {ultimaCandidatura.vaga.empresa.nome}
              </p>
            )}
          </div>

          {/* Status Badge */}
          {ultimaCandidatura.status && (
            <div className="flex items-center gap-2">
              {(() => {
                const statusConfig = getStatusConfig(ultimaCandidatura.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgColor}`}
                  >
                    <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                    <span className="text-xs font-medium text-white">
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-white/60" />
              <span className="text-xs text-white/70">
                Enviada em{" "}
                {formatDate(
                  ultimaCandidaturaEnvio || ultimaCandidatura.aplicadaEm
                )}
              </span>
            </div>
            {ultimaCandidaturaAtualizacao && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/70">
                  Atualizada em {formatDate(ultimaCandidaturaAtualizacao)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipContent>
  ) : null;

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={candidato.avatarUrl || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getCandidatoInitials(candidato.nomeCompleto)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {candidato.nomeCompleto}
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {candidato.codUsuario}
              </span>
            </div>
            <span className="font-mono text-sm text-gray-500">
              {formatCpf(candidato.cpf)}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 w-[240px]">
        <div className="flex flex-col gap-[6px] text-sm leading-[1.35] text-gray-600">
          {candidato.email ? (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{candidato.email}</span>
            </div>
          ) : null}

          {candidato.telefone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{candidato.telefone}</span>
            </div>
          ) : null}

          {!candidato.email && !candidato.telefone && (
            <span className="text-gray-500">Não informado</span>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4 w-[220px]">
        <div className="flex items-start gap-2 text-sm leading-[1.35] text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
          <span className="truncate">{formatLocalizacao(candidato)}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 cursor-pointer">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                <span className="text-xs font-medium text-blue-600">
                  {totalCandidaturas}
                </span>
              </div>
              {totalCandidaturas === 0 ? (
                <span className="text-sm text-gray-500">Nenhuma</span>
              ) : (
                <div className="flex flex-col leading-[1.2]">
                  <span className="text-sm text-gray-900">
                    {totalCandidaturas === 1 ? "candidatura" : "candidaturas"}
                  </span>
                  {candidaturasAtivas !== totalCandidaturas && (
                    <span className="text-xs text-gray-500">
                      {candidaturasAtivas} ativa
                      {candidaturasAtivas !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>
          {candidaturasTooltip}
        </Tooltip>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">
            {candidato.ultimoLogin
              ? formatDate(candidato.ultimoLogin)
              : "Nunca"}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                aria-label="Visualizar candidato"
                onClick={handleViewDetails}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>Visualizar candidato</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
