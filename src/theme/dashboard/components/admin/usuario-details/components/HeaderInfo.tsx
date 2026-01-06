"use client";

import Link from "next/link";
import { useState } from "react";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  MapPin,
  Shield,
  ShieldOff,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUsuarioInitials, formatCpf, formatCnpj } from "../utils/formatters";
import type { HeaderInfoProps } from "../types";

export function HeaderInfo({
  usuario,
  onEditUsuario,
  onEditEndereco,
  onResetSenha,
  onBloquearUsuario,
  onDesbloquearUsuario,
}: HeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const normalized = usuario.status?.toUpperCase();
  const isBloqueado = normalized === "BLOQUEADO";
  const isAtivo = normalized === "ATIVO";
  const statusColor = isBloqueado
    ? "bg-red-500"
    : isAtivo
    ? "bg-emerald-500"
    : "bg-rose-500";
  const statusLabel = isBloqueado
    ? "Usuário bloqueado"
    : isAtivo
    ? "Usuário ativo"
    : "Usuário inativo";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <AvatarCustom
              name={usuario.nomeCompleto || "Usuário"}
              src={usuario.avatarUrl || undefined}
              size="xl"
              showStatus={false}
              className="text-base"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "absolute bottom-1 right-1 inline-flex size-4 items-center justify-center rounded-full border-2 border-white cursor-pointer",
                    statusColor
                  )}
                  aria-label={statusLabel}
                >
                  <span className="sr-only">{statusLabel}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{statusLabel}</TooltipContent>
            </Tooltip>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold !mb-0"> {usuario.nomeCompleto}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
              {usuario.tipoUsuario === "PESSOA_JURIDICA" ? (
                <span>CNPJ: {formatCnpj(usuario.cnpj)}</span>
              ) : (
                <span>CPF: {formatCpf(usuario.cpf)}</span>
              )}
            </div>

            {/* Redes sociais */}
            {usuario.socialLinks &&
              (usuario.socialLinks.instagram ||
                usuario.socialLinks.linkedin) && (
                <div className="flex flex-wrap items-center gap-2">
                  {usuario.socialLinks.instagram && (
                    <a
                      href={usuario.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Instagram
                    </a>
                  )}
                  {usuario.socialLinks.linkedin && (
                    <a
                      href={usuario.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <DropdownMenu open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                aria-expanded={isActionsOpen}
                className="flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-color)]/90 cursor-pointer"
              >
                Ações
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isActionsOpen ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {onEditUsuario && (
                <DropdownMenuItem
                  onSelect={onEditUsuario}
                  className="cursor-pointer"
                >
                  <UserCog className="h-4 w-4 text-gray-500" />
                  <span>Editar informações</span>
                </DropdownMenuItem>
              )}
              {onEditEndereco && (
                <DropdownMenuItem
                  onSelect={onEditEndereco}
                  className="cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Editar endereço</span>
                </DropdownMenuItem>
              )}
              {onResetSenha && (
                <DropdownMenuItem
                  onSelect={onResetSenha}
                  className="cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Resetar senha</span>
                </DropdownMenuItem>
              )}
              {isBloqueado
                ? onDesbloquearUsuario && (
                    <DropdownMenuItem
                      onSelect={onDesbloquearUsuario}
                      className="cursor-pointer"
                    >
                      <ShieldOff className="h-4 w-4 text-gray-500" />
                      <span>Desbloquear usuario</span>
                    </DropdownMenuItem>
                  )
                : onBloquearUsuario && (
                    <DropdownMenuItem
                      onSelect={onBloquearUsuario}
                      className="cursor-pointer"
                    >
                      <Ban className="h-4 w-4 text-gray-500" />
                      <span>Bloquear usuario</span>
                    </DropdownMenuItem>
                  )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/usuarios"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
