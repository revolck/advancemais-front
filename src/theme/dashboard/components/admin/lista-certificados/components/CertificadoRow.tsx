"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Award,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CertificadoRowProps {
  certificado: {
    id: string;
    codigo?: string;
    numero?: string;
    emitidoEm?: string;
    status?: string;
    aluno?: {
      id: string;
      nome?: string;
      email?: string;
      avatarUrl?: string;
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
    case "EMITIDO":
    case "ATIVO":
    case "VALIDO":
      return "bg-green-100 text-green-800 border-green-200";
    case "PENDENTE":
    case "AGUARDANDO":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CANCELADO":
    case "REVOGADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  const statusUpper = status.toUpperCase();
  switch (statusUpper) {
    case "EMITIDO":
      return "Emitido";
    case "ATIVO":
      return "Ativo";
    case "VALIDO":
      return "Válido";
    case "PENDENTE":
      return "Pendente";
    case "AGUARDANDO":
      return "Aguardando";
    case "CANCELADO":
      return "Cancelado";
    case "REVOGADO":
      return "Revogado";
    default:
      return status;
  }
};

export function CertificadoRow({ certificado }: CertificadoRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const alunoNome = certificado.aluno?.nome || certificado.aluno?.email || "—";
  const codigo = certificado.codigo || certificado.numero || "—";
  const emitido = formatDate(certificado.emitidoEm);

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);
    // TODO: Ajustar rota quando a página de detalhes de certificado existir
    // router.push(`/dashboard/cursos/certificados/${certificado.id}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={certificado.aluno?.avatarUrl}
              alt={alunoNome}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {getInitials(alunoNome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[200px]">
              {alunoNome}
            </div>
            {certificado.aluno?.email && certificado.aluno?.nome && (
              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                {certificado.aluno.email}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">
            {codigo}
          </code>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span>{emitido}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {certificado.status ? (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", getStatusColor(certificado.status))}
          >
            {getStatusLabel(certificado.status)}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs font-medium bg-green-100 text-green-800 border-green-200"
          >
            Emitido
          </Badge>
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
              aria-label="Visualizar certificado"
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
