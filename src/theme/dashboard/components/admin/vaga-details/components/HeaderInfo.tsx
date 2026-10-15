"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronLeft,
  Edit,
  Eye,
  EyeOff,
  Accessibility,
  Clock,
  Send,
  Undo2,
  Info,
} from "lucide-react";
import { formatCnpj as formatCnpjDocument } from "@/lib/documentos";
import { cn } from "@/lib/utils";
import type { VagaHeaderInfoProps } from "../types";
import { formatVagaStatus, getVagaStatusBadgeClasses } from "../utils";
import { getInitials } from "../utils/formatters";
import { DespublicarVagaModal } from "../modal-acoes";

// Função para formatar CNPJ com máscara
function formatCNPJ(cnpj?: string): string {
  if (!cnpj) return "";
  return formatCnpjDocument(cnpj);
}

export function HeaderInfo({
  vaga,
  onEditVaga,
  onDeleteVaga,
  onPublishVaga,
  onUnpublishVaga,
  podeAprovar = false,
  acaoEmAndamento = false,
}: VagaHeaderInfoProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);

  const isVagaPublished = vaga.status === "PUBLICADO";
  const isEmAnalise = vaga.status === "EM_ANALISE";
  const podeEnviar = vaga.status === "RASCUNHO" || vaga.status === "DESPUBLICADA";
  // Encerrada/expirada: o processo acabou, a empresa não edita mais (a equipe pode)
  const podeEditar =
    podeAprovar || (vaga.status !== "ENCERRADA" && vaga.status !== "EXPIRADO");
  const statusColor = isVagaPublished ? "bg-emerald-500" : "bg-amber-500";
  const statusLabel = isVagaPublished
    ? "Vaga publicada"
    : isEmAnalise
      ? "Aguardando aprovação"
      : "Vaga não publicada";

  // Rejeitada: rascunho com o motivo que o setor de vagas deixou
  const motivoRejeicao =
    vaga.status === "RASCUNHO" ? vaga.motivoRejeicao?.trim() || null : null;

  // Aviso do próximo passo, para a empresa saber o que acontece com a vaga
  const avisoDoStatus = motivoRejeicao
    ? null
    : isEmAnalise
    ? podeAprovar
      ? "Esta vaga está aguardando aprovação. Revise e aprove para publicar."
      : "Sua vaga está na fila de aprovação do setor de vagas. Assim que for aprovada, ela é publicada."
    : vaga.status === "RASCUNHO"
      ? podeAprovar
        ? "Rascunho da empresa: ainda não foi enviada para aprovação e não está visível para candidatos. Para publicar, use Ações → Publicar."
        : "Esta vaga é um rascunho. Quando estiver pronta, envie para aprovação em Ações."
      : null;

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
    const ok = await onUnpublishVaga?.();
    if (ok !== false) setIsUnpublishModalOpen(false);
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
            <AvatarCustom
              name={empresaNome}
              src={vaga.empresa?.avatarUrl || undefined}
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
              {podeEditar && (
                <DropdownMenuItem
                  onSelect={onEditVaga}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                  <span>Editar vaga</span>
                </DropdownMenuItem>
              )}
              {isVagaPublished && (
                <DropdownMenuItem
                  onSelect={handleUnpublishClick}
                  disabled={acaoEmAndamento}
                  className="cursor-pointer"
                >
                  <EyeOff className="h-4 w-4 text-gray-500" />
                  <span>Despublicar</span>
                </DropdownMenuItem>
              )}
              {podeEnviar && (
                <DropdownMenuItem
                  onSelect={onPublishVaga}
                  disabled={acaoEmAndamento}
                  className="cursor-pointer"
                >
                  {podeAprovar ? (
                    <Eye className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Send className="h-4 w-4 text-gray-500" />
                  )}
                  <span>{podeAprovar ? "Publicar" : "Enviar para aprovação"}</span>
                </DropdownMenuItem>
              )}
              {isEmAnalise && podeAprovar && (
                <DropdownMenuItem
                  onSelect={onPublishVaga}
                  disabled={acaoEmAndamento}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span>Aprovar e publicar</span>
                </DropdownMenuItem>
              )}
              {isEmAnalise && !podeAprovar && (
                <>
                  <DropdownMenuItem disabled>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Aguardando aprovação</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      void onUnpublishVaga?.();
                    }}
                    disabled={acaoEmAndamento}
                    className="cursor-pointer"
                  >
                    <Undo2 className="h-4 w-4 text-gray-500" />
                    <span>Cancelar envio</span>
                  </DropdownMenuItem>
                </>
              )}
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

      {motivoRejeicao && (
        <div className="mx-6 mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-8">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="!mb-0 !text-sm font-semibold !leading-normal text-red-900">
              {podeAprovar
                ? "Vaga rejeitada pelo setor de vagas"
                : "O setor de vagas rejeitou esta vaga"}
            </p>
            <p className="!mb-0 !text-sm !leading-normal text-red-900 whitespace-pre-line">
              Motivo: {motivoRejeicao}
            </p>
            {!podeAprovar && (
              <p className="!mb-0 !text-sm !leading-normal text-red-900">
                Ajuste a vaga em Ações → Editar vaga e envie para aprovação de novo.
              </p>
            )}
          </div>
        </div>
      )}

      {avisoDoStatus && (
        <div className="mx-6 mb-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:mx-8">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="!mb-0 !text-sm !leading-normal text-amber-900">{avisoDoStatus}</p>
        </div>
      )}

      {/* Modal de Despublicação */}
      <DespublicarVagaModal
        isOpen={isUnpublishModalOpen}
        onOpenChange={setIsUnpublishModalOpen}
        onConfirmUnpublish={handleUnpublishConfirm}
        isUnpublishing={acaoEmAndamento}
        vaga={vaga}
      />
    </section>
  );
}
