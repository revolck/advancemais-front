"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getAlunoInitials, formatCpf } from "../utils/formatters";
import type { HeaderInfoProps } from "../types";

export function HeaderInfo({
  aluno,
  onEditAluno,
  onEditEndereco,
  onResetSenha,
  onBloquearAluno,
  onDesbloquearAluno,
}: HeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const alunoNome = aluno.nome || aluno.nomeCompleto || "Aluno";
  // Status não está disponível em CursoAlunoDetalhes, usando valor padrão
  const normalized = "ATIVO"; // Valor padrão, pode ser ajustado quando status estiver disponível
  const isBloqueado = false; // Valor padrão
  const isAtivo = true; // Valor padrão
  const statusColor = isBloqueado
    ? "bg-red-500"
    : isAtivo
    ? "bg-emerald-500"
    : "bg-rose-500";
  const statusLabel = isBloqueado
    ? "Aluno bloqueado"
    : isAtivo
    ? "Aluno ativo"
    : "Aluno reprovado";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 shrink-0 text-base">
              <AvatarImage
                src={aluno.avatarUrl || undefined}
                alt={alunoNome}
              />
              <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                {getAlunoInitials(alunoNome)}
              </AvatarFallback>
            </Avatar>
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
            <h3 className="font-semibold !mb-0">{alunoNome}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
              <span>CPF: {formatCpf(aluno.cpf)}</span>
            </div>

            {/* Redes sociais abaixo do gênero - socialLinks não disponível em CursoAlunoDetalhes */}
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
              {onEditAluno && (
                <DropdownMenuItem
                  onSelect={onEditAluno}
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
                ? onDesbloquearAluno && (
                    <DropdownMenuItem
                      onSelect={onDesbloquearAluno}
                      className="cursor-pointer"
                    >
                      <ShieldOff className="h-4 w-4 text-gray-500" />
                      <span>Desbloquear aluno</span>
                    </DropdownMenuItem>
                  )
                : onBloquearAluno && (
                    <DropdownMenuItem
                      onSelect={onBloquearAluno}
                      className="cursor-pointer"
                    >
                      <Ban className="h-4 w-4 text-gray-500" />
                      <span>Bloquear aluno</span>
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
              href="/dashboard/cursos/alunos"
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
