"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { Instrutor } from "@/api/usuarios";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";

interface InstrutorRowProps {
  instrutor: Instrutor;
  isDisabled?: boolean;
  onNavigateStart?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ATIVO":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "INATIVO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "BLOQUEADO":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "ATIVO":
      return "Ativo";
    case "INATIVO":
      return "Inativo";
    case "BLOQUEADO":
      return "Bloqueado";
    default:
      return status;
  }
};

const formatCpf = (cpf?: string | null) => {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatTelefone = (telefone?: string | null): string => {
  if (!telefone) return "—";
  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
};

const getInitials = (nome: string) => {
  if (!nome) return "??";
  const words = nome.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

export function InstrutorRow({ 
  instrutor,
  isDisabled = false,
  onNavigateStart,
}: InstrutorRowProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const isRowDisabled = isDisabled || isNavigating;

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRowDisabled) return;
    
    setIsNavigating(true);
    onNavigateStart?.();
    router.push(`/dashboard/cursos/instrutores/${encodeURIComponent(instrutor.id)}`);
    
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
              src={instrutor.avatarUrl || undefined}
              alt={instrutor.nomeCompleto}
            />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
              {getInitials(instrutor.nomeCompleto)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-900 font-medium truncate max-w-[220px]">
                {instrutor.nomeCompleto || instrutor.id}
              </div>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                {instrutor.codigo || instrutor.codUsuario}
              </code>
            </div>
            {instrutor.cpf && (
              <div className="text-xs text-gray-500 font-mono truncate max-w-[220px]">
                {formatCpf(instrutor.cpf)}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 flex items-center gap-2">
          <Icon name="Mail" size={16} className="text-gray-400 flex-shrink-0" />
          <span>{instrutor.email || "—"}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="text-sm text-gray-900 flex items-center gap-2">
          <Icon
            name="Phone"
            size={16}
            className="text-gray-400 flex-shrink-0"
          />
          <span>
            {formatTelefone(instrutor.telefone || instrutor.celular)}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        {instrutor.cidade || instrutor.estado ? (
          <div className="flex items-start gap-2">
            <Icon
              name="MapPin"
              size={16}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm text-gray-900 font-medium">
              {instrutor.cidade && instrutor.estado
                ? `${instrutor.cidade}, ${instrutor.estado}`
                : instrutor.cidade || instrutor.estado}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">—</div>
        )}
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            getStatusColor(instrutor.status)
          )}
        >
          {getStatusLabel(instrutor.status)}
        </Badge>
      </TableCell>
      <TableCell className="text-right w-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate}
              disabled={isRowDisabled}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating 
                  ? "text-blue-600 bg-blue-100" 
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                "disabled:opacity-50 disabled:cursor-wait"
              )}
              aria-label="Visualizar instrutor"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar instrutor"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
