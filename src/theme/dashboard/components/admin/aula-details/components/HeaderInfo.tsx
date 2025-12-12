"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ChevronDown, ChevronLeft, Edit, Trash2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Aula } from "@/api/aulas";
import { useRouter } from "next/navigation";
import { getModalidadeIcon, getModalidadeBadgeColor, getStatusBadgeColor, formatAulaStatus } from "../utils";
import { DeleteAulaModal } from "../modals/DeleteAulaModal";
import { useAuth } from "@/hooks/useAuth";

interface HeaderInfoProps {
  aula: Aula;
  onUpdate?: () => void;
}

function getInitials(name?: string): string {
  if (!name || typeof name !== "string") return "??";
  
  const trimmed = name.trim();
  if (!trimmed) return "??";
  
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return trimmed.substring(0, 2).toUpperCase();
}

export function HeaderInfo({ aula, onUpdate }: HeaderInfoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isPublicada = aula.status === "PUBLICADA";
  const statusColor = isPublicada ? "bg-emerald-500" : "bg-gray-400";
  const statusLabel = isPublicada ? "Aula publicada" : "Aula em rascunho";

  // Verificar se pode excluir (não é instrutor e aula não começou)
  const isInstrutor = user?.role === "INSTRUTOR";
  const aulaJaComecou = aula.dataInicio
    ? new Date(aula.dataInicio) < new Date()
    : false;
  const podeExcluir = !isInstrutor && !aulaJaComecou;

  const handleEditClick = () => {
    router.push(`/dashboard/cursos/aulas/${aula.id}/editar`);
    setIsActionsOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setIsActionsOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const ModalidadeIcon = getModalidadeIcon(aula.modalidade);

  const statusBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        getStatusBadgeColor(aula.status)
      )}
    >
      {formatAulaStatus(aula.status)}
    </Badge>
  );

  const modalidadeBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getModalidadeBadgeColor(aula.modalidade)
      )}
    >
      <ModalidadeIcon className="h-3 w-3" />
      {aula.modalidade}
    </Badge>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 shrink-0 text-base">
              <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                {getInitials(aula.titulo)}
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
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold !mb-0">{aula.titulo}</h3>
              {statusBadge}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {modalidadeBadge}
              {aula.turma && (
                <span className="text-sm text-gray-500">
                  Turma: {aula.turma.nome}
                </span>
              )}
              {aula.instrutor && (
                <span className="text-sm text-gray-500">
                  • Instrutor: {aula.instrutor.nome}
                </span>
              )}
            </div>
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
              <DropdownMenuItem
                onSelect={handleEditClick}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Editar aula</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleDeleteClick}
                className="cursor-pointer text-red-600 focus:text-red-600"
                disabled={!podeExcluir}
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  Excluir aula
                  {!podeExcluir && (
                    <span className="ml-2 text-xs text-gray-500">
                      {isInstrutor && "(Sem permissão)"}
                      {!isInstrutor && aulaJaComecou && "(Aula já aconteceu)"}
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/cursos/aulas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal de exclusão */}
      <DeleteAulaModal
        aula={aula}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </section>
  );
}

