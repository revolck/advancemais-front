"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Brain,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CandidatoOverview, Candidatura } from "@/api/candidatos/types";
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
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Psicólogos focam em candidatos em processo de avaliação psicológica
  const candidaturasAvaliacao: Candidatura[] =
    candidato.candidaturas?.filter((c: Candidatura) =>
      ["EM_TRIAGEM", "ENTREVISTA", "DESAFIO"].includes(c.status)
    ) || [];

  const statusInfo = getStatusInfo(
    candidaturasAvaliacao?.[0]?.status || "EM_TRIAGEM"
  );

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(`/dashboard/empresas/candidatos/${encodeURIComponent(candidato.id)}`);
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={candidato.avatarUrl || undefined} />
            <AvatarFallback className="bg-purple-100 text-purple-600">
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
          <div className="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full">
            <span className="text-xs font-medium text-purple-600">
              {candidaturasAvaliacao.length}
            </span>
          </div>
          <span className="text-sm text-gray-900">
            {formatCandidaturasCount(candidaturasAvaliacao)}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">
            {candidaturasAvaliacao?.[0]?.aplicadaEm
              ? formatDate(candidaturasAvaliacao[0].aplicadaEm)
              : "N/A"}
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
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                aria-label="Avaliação psicológica"
              >
                <Brain className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              Avaliação psicológica
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigate}
                disabled={isNavigating}
                className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-wait cursor-pointer"
                aria-label="Visualizar candidato"
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              {isNavigating ? "Carregando..." : "Visualizar candidato"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
