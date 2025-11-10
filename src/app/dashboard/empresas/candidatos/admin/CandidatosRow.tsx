"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CandidatoOverview } from "@/api/candidatos/types";
import {
  formatDate,
  formatCandidaturasCount,
  formatLocalizacao,
  getCandidatoInitials,
} from "@/theme/dashboard/components/admin/lista-candidatos/utils/formatters";
import { getStatusInfo } from "@/theme/dashboard/components/admin/lista-candidatos/types";

interface CandidatosRowProps {
  candidato: CandidatoOverview;
}

export function CandidatosRow({ candidato }: CandidatosRowProps) {
  const statusInfo = getStatusInfo(
    candidato.candidaturas?.[0]?.status || "RECEBIDA"
  );

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={candidato.avatarUrl || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getCandidatoInitials(candidato.nomeCompleto)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-medium text-gray-900">
              {candidato.nomeCompleto}
            </div>
            <div className="text-sm text-gray-500">{candidato.codUsuario}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex flex-col gap-1">
          {candidato.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
              <span className="truncate">{candidato.email}</span>
            </div>
          )}
          {candidato.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
              <span className="truncate">{candidato.telefone}</span>
            </div>
          )}
          {!candidato.email && !candidato.telefone && (
            <div className="text-sm text-gray-500">Não informado</div>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatLocalizacao(candidato)}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-600">
              {candidato.candidaturas?.length || 0}
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {formatCandidaturasCount(candidato.candidaturas || [])}
          </span>
        </div>
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
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", statusInfo.color)}
        >
          {statusInfo.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
              aria-label="Visualizar candidato"
            >
              <Link href={`/dashboard/empresas/candidatos/${candidato.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Visualizar candidato</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
