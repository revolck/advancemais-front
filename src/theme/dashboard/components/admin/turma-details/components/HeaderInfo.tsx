"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicarTurma } from "../hooks";
import { ConfirmarPublicacaoTurmaModal } from "../modal-acoes";
import { formatTurmaStatus, getTurmaStatusBadgeClasses } from "../utils";
import type { HeaderInfoProps } from "../types";

export function HeaderInfo({ turma, cursoId, onEditTurma }: HeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    mutate: publicarOuDespublicar,
    isPending,
    isPublished,
  } = usePublicarTurma({
    cursoId,
    turma,
    onSettled: () => setIsConfirmModalOpen(false),
  });

  const statusBadge = (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        getTurmaStatusBadgeClasses(turma.status),
      )}
    >
      {formatTurmaStatus(turma.status)}
    </Badge>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="space-y-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold !mb-0">{turma.nome}</h3>
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
                    isActionsOpen ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsConfirmModalOpen(true);
                  setIsActionsOpen(false);
                }}
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span>
                      {isPublished ? "Atualizando..." : "Publicando..."}
                    </span>
                  </>
                ) : isPublished ? (
                  <>
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    <span>Rascunho</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>Publicar</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setIsActionsOpen(false);
                  if (onEditTurma) {
                    onEditTurma();
                    return;
                  }
                  window.location.assign(
                    `/dashboard/cursos/turmas/${turma.id}/editar?cursoId=${encodeURIComponent(
                      String(cursoId)
                    )}`
                  );
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Editar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/cursos/turmas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <ConfirmarPublicacaoTurmaModal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        isPublished={isPublished}
        onConfirm={() => publicarOuDespublicar(!isPublished)}
        isPending={isPending}
      />
    </section>
  );
}
