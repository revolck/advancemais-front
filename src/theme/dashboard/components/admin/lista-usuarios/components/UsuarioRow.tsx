"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight, Mail, MapPin, Calendar } from "lucide-react";
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
} from "../utils/formatters";

interface UsuarioRowProps {
  usuario: UsuarioOverview;
}

export function UsuarioRow({ usuario }: UsuarioRowProps) {
  const router = useRouter();

  const handleClick = () => {
    // Redirecionar empresas para o módulo específico
    if (usuario.tipoUsuario === "PESSOA_JURIDICA") {
      router.push(`/dashboard/empresas/${usuario.id}`);
    }
    // Redirecionar instrutores para o módulo específico
    else if (usuario.role === UserRole.INSTRUTOR) {
      router.push(`/dashboard/cursos/instrutores/${usuario.id}`);
    }
    // Outros usuários vão para a página genérica
    else {
      router.push(`/dashboard/usuarios/${usuario.id}`);
    }
  };

  return (
    <TableRow className="border-gray-100 hover:bg-gray-50/50 transition-colors">
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
            </div>
            {usuario.cpf && (
              <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
                {formatCpf(usuario.cpf)}
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
              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
              aria-label="Visualizar usuário"
              onClick={handleClick}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Visualizar usuário</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
