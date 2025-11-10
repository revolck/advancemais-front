"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Ban,
  ChevronDown,
  ChevronLeft,
  UserCog,
  MapPin,
  Mail,
  Phone,
  Shield,
  ShieldOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCandidatoInitials, getStatusBadge } from "../utils/formatters";
import type { HeaderInfoProps } from "../types";

export function HeaderInfo({
  candidato,
  onEditCandidato,
  onBloquearCandidato,
  onDesbloquearCandidato,
  onUpdateStatus,
}: HeaderInfoProps) {
  const isAtivo = candidato.status === "ATIVO";
  const isBloqueado = candidato.status === "BLOQUEADO";

  const formatCpf = (cpf?: string | null) => {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/empresas/candidatos">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>

          <Avatar className="h-16 w-16">
            <AvatarImage src={candidato.avatarUrl || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
              {getCandidatoInitials(candidato.nomeCompleto)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {candidato.nomeCompleto}
              </h1>
              {getStatusBadge(isAtivo ? "ATIVO" : "INATIVO")}
              {isBloqueado && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Ban className="h-3 w-3" />
                  Bloqueado
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Código:</span>
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {candidato.codUsuario}
                  </code>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">CPF:</span>
                  <span className="font-mono">{formatCpf(candidato.cpf)}</span>
                </div>

                {candidato.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{candidato.email}</span>
                  </div>
                )}

                {candidato.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{candidato.telefone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {(candidato.cidade || candidato.estado) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {[candidato.cidade, candidato.estado]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {candidato.ultimoLogin && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Último login:</span>
                    <span>
                      {new Date(candidato.ultimoLogin).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <span>Ações</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={onEditCandidato}
                className="cursor-pointer"
              >
                <UserCog className="h-4 w-4 text-gray-500" />
                <span>Editar candidato</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {isBloqueado ? (
                <DropdownMenuItem
                  onSelect={onDesbloquearCandidato}
                  className="cursor-pointer text-green-600 focus:text-green-600"
                >
                  <ShieldOff className="h-4 w-4" />
                  <span>Desbloquear candidato</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={onBloquearCandidato}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Shield className="h-4 w-4" />
                  <span>Bloquear candidato</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
