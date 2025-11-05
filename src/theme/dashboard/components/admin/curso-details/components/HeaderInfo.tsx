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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronLeft, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Curso } from "@/api/cursos";
import { EditCursoModal } from "./EditCursoModal";
import { formatCursoStatus, getCursoStatusBadgeClasses } from "../utils";

interface HeaderInfoProps {
  curso: Curso & {
    categoria?: { id: number; nome: string };
    subcategoria?: { id: number; nome: string };
  };
  onEditCurso?: () => void;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function HeaderInfo({ curso, onEditCurso }: HeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isPublished = curso.statusPadrao === "PUBLICADO";
  const statusColor = isPublished ? "bg-emerald-500" : "bg-gray-400";
  const statusLabel = isPublished ? "Curso publicado" : "Curso em rascunho";

  const handleEditClick = () => {
    setIsEditModalOpen(true);
    setIsActionsOpen(false);
  };

  const handleEditSuccess = () => {
    onEditCurso?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const statusBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        getCursoStatusBadgeClasses(curso.statusPadrao)
      )}
    >
      {formatCursoStatus(curso.statusPadrao)}
    </Badge>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 shrink-0 text-base">
              <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                {getInitials(curso.nome)}
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
          <div className="space-y-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold !mb-0">{curso.nome}</h3>
              {statusBadge}
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
                <span>Editar curso</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link href="/dashboard/cursos" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <EditCursoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        curso={curso}
      />
    </section>
  );
}
