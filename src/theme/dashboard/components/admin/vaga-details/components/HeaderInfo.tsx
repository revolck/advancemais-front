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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VagaHeaderInfoProps } from "../types";
import { formatVagaStatus, getVagaStatusBadgeClasses } from "../utils";
import { getInitials } from "../utils/formatters";
import { DespublicarVagaModal } from "../modal-acoes";

// Função para formatar CNPJ com máscara
function formatCNPJ(cnpj?: string): string {
  if (!cnpj) return "";
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, "");
  // Aplica máscara: XX.XXX.XXX/XXXX-XX
  if (cleaned.length === 14) {
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }
  return cnpj;
}

export function HeaderInfo({
  vaga,
  onEditVaga,
  onDeleteVaga,
  onPublishVaga,
  onUnpublishVaga,
}: VagaHeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);

  const isVagaPublished = vaga.status === "PUBLICADO";
  const statusColor = isVagaPublished ? "bg-emerald-500" : "bg-amber-500";
  const statusLabel = isVagaPublished ? "Vaga publicada" : "Vaga não publicada";

  const statusBadge = (
    <Badge
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getVagaStatusBadgeClasses(
        vaga.status
      )}`}
    >
      {formatVagaStatus(vaga.status)}
    </Badge>
  );

  const pcdIcon = vaga.paraPcd ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          <Accessibility className="h-4 w-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>Vaga elegível para PCD</TooltipContent>
    </Tooltip>
  ) : null;

  const handleUnpublishClick = () => {
    setIsUnpublishModalOpen(true);
    setIsActionsOpen(false);
  };

  const handleUnpublishConfirm = async () => {
    await onUnpublishVaga?.();
  };

  // Debug: Verificar estrutura da empresa
  if (process.env.NODE_ENV === "development") {
    console.log("[HeaderInfo] Vaga empresa data:", {
      empresa: vaga.empresa,
      hasNome: !!vaga.empresa?.nome,
      hasCnpj: !!vaga.empresa?.cnpj,
      empresaKeys: vaga.empresa ? Object.keys(vaga.empresa) : [],
    });
  }

  // Fallback seguro para nome da empresa
  const empresaNome = vaga.empresa?.nome || "Empresa não informada";
  const empresaCnpj = vaga.empresa?.cnpj;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white">
      <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 shrink-0 text-base">
              <AvatarImage
                src={vaga.empresa?.avatarUrl || undefined}
                alt={empresaNome}
              />
              <AvatarFallback className="bg-primary/10 text-primary/80 text-base font-semibold">
                {getInitials(empresaNome)}
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
            <div className="flex items-center gap-3">
              <h3 className="font-semibold !mb-0">{vaga.titulo}</h3>
              {statusBadge}
              {pcdIcon}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
              <span>{empresaNome}</span>
              {empresaCnpj && (
                <>
                  <span>|</span>
                  <span>CNPJ: {formatCNPJ(empresaCnpj)}</span>
                </>
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
                onSelect={onEditVaga}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Editar vaga</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={
                  isVagaPublished ? handleUnpublishClick : onPublishVaga
                }
                className="cursor-pointer"
              >
                {isVagaPublished ? (
                  <>
                    <EyeOff className="h-4 w-4 text-gray-500" />
                    <span>Despublicar</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>Publicar</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-none px-5 py-2 text-sm font-medium hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground transition-all duration-200"
          >
            <Link
              href="/dashboard/empresas/vagas"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Modal de Despublicação */}
      <DespublicarVagaModal
        isOpen={isUnpublishModalOpen}
        onOpenChange={setIsUnpublishModalOpen}
        onConfirmUnpublish={handleUnpublishConfirm}
        vaga={vaga}
      />
    </section>
  );
}
