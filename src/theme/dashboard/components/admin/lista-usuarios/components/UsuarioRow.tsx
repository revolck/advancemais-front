"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, Mail, MapPin, Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom";
import type { UsuarioOverview } from "../types";
import { UserRole } from "@/config/roles";
import {
  getUsuarioInitials,
  getRoleLabel,
  getRoleColor,
  getStatusColor,
  getStatusLabel,
  formatDateTime,
  formatCpf,
  formatCnpj,
} from "../utils/formatters";

interface UsuarioRowProps {
  usuario: UsuarioOverview;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

export function UsuarioRow({ 
  usuario,
  isDisabled = false,
  onNavigateStart,
}: UsuarioRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  // Verificar se é ALUNO_CANDIDATO e se tem vínculos (cursos ou currículos)
  const isAlunoCandidato = usuario.role === UserRole.ALUNO_CANDIDATO;
  const hasCursos = isAlunoCandidato && (usuario.cursosInscricoes?.length ?? 0) > 0;
  const hasCurriculos = isAlunoCandidato && (usuario.curriculos?.length ?? 0) > 0;
  const hasVinculos = hasCursos || hasCurriculos;
  const showSemVinculosBadge = isAlunoCandidato && !hasVinculos;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRowDisabled) return;
    
    setIsNavigating(true);
    onNavigateStart?.();
    
    // Redirecionar empresas para o módulo específico
    if (usuario.tipoUsuario === "PESSOA_JURIDICA") {
      router.push(`/dashboard/empresas/${encodeURIComponent(usuario.id)}`);
    }
    // Redirecionar instrutores para o módulo específico
    else if (usuario.role === UserRole.INSTRUTOR) {
      router.push(`/dashboard/cursos/instrutores/${encodeURIComponent(usuario.id)}`);
    }
    // Se for ALUNO_CANDIDATO com vínculos, redirecionar para página de alunos
    else if (isAlunoCandidato && hasVinculos) {
      router.push(`/dashboard/cursos/alunos/${encodeURIComponent(usuario.id)}`);
    }
    // Outros usuários vão para a página genérica
    else {
      router.push(`/dashboard/usuarios/${encodeURIComponent(usuario.id)}`);
    }
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <TableRow 
      className={cn(
        "border-gray-100 transition-colors",
        isRowDisabled 
          ? "opacity-50 pointer-events-none" 
          : "hover:bg-gray-50/50",
        isNavigating && "bg-blue-50/50"
      )}
    >
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage
              src={usuario.avatarUrl || undefined}
              alt={usuario.nomeCompleto}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {getUsuarioInitials(usuario.nomeCompleto)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
                {usuario.nomeCompleto || usuario.id}
              </div>
              {usuario.codUsuario && (
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {usuario.codUsuario}
                </code>
              )}
              {showSemVinculosBadge && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-gray-50 text-gray-600 border-gray-200 flex-shrink-0"
                >
                  Sem vínculos
                </Badge>
              )}
            </div>
            {usuario.cpf && (
              <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
                {formatCpf(usuario.cpf)}
              </div>
            )}
            {usuario.cnpj && usuario.tipoUsuario === "PESSOA_JURIDICA" && (
              <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
                {formatCnpj(usuario.cnpj)}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="text-sm text-gray-900 flex items-center gap-2">
          <Icon name="Mail" size={16} className="text-gray-400 flex-shrink-0" />
          <span>{usuario.email || "—"}</span>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {usuario.cidade || usuario.estado ? (
          <div className="flex items-start gap-2">
            <Icon
              name="MapPin"
              size={16}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">
                {usuario.cidade && usuario.estado
                  ? `${usuario.cidade}, ${usuario.estado}`
                  : usuario.cidade || usuario.estado}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getRoleColor(usuario.role))}
        >
          {getRoleLabel(usuario.role)}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", getStatusColor(usuario.status))}
        >
          {getStatusLabel(usuario.status)}
        </Badge>
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">
            {formatDateTime(usuario.ultimoAcesso)}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-right w-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={isRowDisabled}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating 
                  ? "text-blue-600 bg-blue-100" 
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                "disabled:opacity-50 disabled:cursor-wait"
              )}
              aria-label="Visualizar usuário"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
              <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar usuário"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
