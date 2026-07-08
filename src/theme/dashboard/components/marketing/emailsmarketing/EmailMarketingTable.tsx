"use client";

import Link from "next/link";
import {
  AlertCircle,
  Copy,
  Eye,
  Loader2,
  Pencil,
  RefreshCcw,
  Send,
  Trash2,
} from "lucide-react";

import type {
  MarketingEmailListItem,
  MarketingEmailPagination,
} from "@/api/websites/components/emailsmarketing";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getDeliveryFailureMessage } from "./deliveryFeedback";

interface EmailMarketingTableProps {
  emails: MarketingEmailListItem[];
  isLoading?: boolean;
  pagination?: MarketingEmailPagination;
  visiblePages: number[];
  deletingId?: string;
  togglingStatusId?: string;
  duplicatingId?: string;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onTriggerDelivery: (email: MarketingEmailListItem) => void;
  onDuplicate: (email: MarketingEmailListItem) => void;
}

const statusClass = {
  PROCESSANDO: "border-amber-200 bg-amber-50 text-amber-700",
  ENVIADO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RASCUNHO: "border-slate-200 bg-slate-50 text-slate-600",
  AGENDADO: "border-blue-200 bg-blue-50 text-blue-700",
  FALHOU: "border-red-200 bg-red-50 text-red-700",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getEmailUiStatus(email: MarketingEmailListItem) {
  if (email.workflowStatus === "PROCESSANDO") {
    return { key: "PROCESSANDO" as const, label: "Processando" };
  }

  switch (email.workflowStatus) {
    case "RASCUNHO":
      return { key: "RASCUNHO" as const, label: "Em rascunho" };
    case "FALHOU":
      return { key: "FALHOU" as const, label: "Falhou" };
    case "AGENDADO":
      return { key: "AGENDADO" as const, label: "Agendado" };
    case "ENVIADO":
    default:
      return { key: "ENVIADO" as const, label: "Enviado" };
  }
}

function EmailMarketingTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="py-4">
              <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function EmailMarketingTable({
  emails,
  isLoading = false,
  pagination,
  visiblePages,
  deletingId,
  togglingStatusId,
  duplicatingId,
  onPageChange,
  onDelete,
  onTriggerDelivery,
  onDuplicate,
}: EmailMarketingTableProps) {
  const primaryActionClass =
    "h-8 w-8 rounded-full p-0 text-slate-400 transition-colors hover:text-[var(--primary-color)]";
  const dangerActionClass =
    "h-8 w-8 rounded-full p-0 text-red-400 transition-colors hover:text-red-500";

  const startItem =
    pagination && emails.length > 0
      ? Math.min(
          (pagination.page - 1) * pagination.pageSize + 1,
          pagination.total,
        )
      : 0;
  const endItem =
    pagination && emails.length > 0
      ? Math.min(startItem + emails.length - 1, pagination.total)
      : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/70">
              <TableHead className="py-4 font-medium text-gray-700">
                Campanha
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Destinatários
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Enviado por
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Enviado em
              </TableHead>
              <TableHead className="w-36 py-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <EmailMarketingTableSkeleton rows={pagination?.pageSize ?? 8} />
            )}
            {!isLoading &&
              emails.map((email) => (
                <TableRow key={email.id} className="border-gray-100 transition-colors hover:bg-gray-50/60">
                  {(() => {
                    const uiStatus = getEmailUiStatus(email);
                    const sentBy =
                      email.atualizadoPor ??
                      email.criadoPor ??
                      null;
                    const sentAt = email.deliveryReferenceAt ?? null;
                    const isSent = email.workflowStatus === "ENVIADO";
                    const isProcessing =
                      email.workflowStatus === "PROCESSANDO";
                    const isFailed = email.workflowStatus === "FALHOU";
                    const isScheduled = email.workflowStatus === "AGENDADO";
                    const canTriggerDelivery = !isSent && !isScheduled;

                    return (
                      <>
                  <TableCell className="py-4">
                    <div className="font-medium text-gray-950">
                      {email.nome}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusClass[uiStatus.key],
                        )}
                      >
                        {uiStatus.label}
                      </Badge>
                      {isFailed && email.settingsConfig?.lastError ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label="Ver motivo da falha"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8} className="max-w-[280px]">
                            {getDeliveryFailureMessage(email.settingsConfig.lastError)}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-gray-900">
                    {email.destinatariosEstimados.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="py-4">
                    {sentBy ? (
                      <div className="flex items-center gap-3">
                        <AvatarCustom
                          name={sentBy.nomeCompleto}
                          src={sentBy.avatarUrl ?? null}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="mb-0! truncate text-sm! font-medium text-gray-900">
                            {sentBy.nomeCompleto}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-600">
                    {sentAt ? formatDate(sentAt) : "-"}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end gap-1">
                      {isSent ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(primaryActionClass, "cursor-pointer")}
                              asChild
                            >
                              <Link
                                href={`/dashboard/marketing/emails/${email.id}/editar?step=validacao&mode=view`}
                                aria-label="Visualizar e-mail"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Visualizar
                          </TooltipContent>
                        </Tooltip>
                      ) : null}

                      {canTriggerDelivery ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                primaryActionClass,
                                "cursor-pointer",
                              )}
                              disabled={
                                deletingId === email.id ||
                                togglingStatusId === email.id ||
                                isProcessing
                              }
                              onClick={() => onTriggerDelivery(email)}
                              aria-label={
                                isProcessing
                                  ? "Processando envio"
                                  : isFailed
                                    ? "Reenviar e-mail"
                                    : "Enviar e-mail"
                              }
                            >
                              {togglingStatusId === email.id || isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isFailed ? (
                                <RefreshCcw className="h-4 w-4" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            {isProcessing
                              ? "Processando"
                              : isFailed
                                ? "Reenviar"
                                : "Enviar"}
                          </TooltipContent>
                        </Tooltip>
                      ) : null}

                      {!isSent ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {isProcessing ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled
                                className={cn(primaryActionClass, "cursor-not-allowed")}
                                aria-label="Editar e-mail"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(primaryActionClass, "cursor-pointer")}
                                asChild
                              >
                                <Link
                                  href={`/dashboard/marketing/emails/${email.id}/editar?step=configuracao`}
                                  aria-label="Editar e-mail"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Editar
                          </TooltipContent>
                        </Tooltip>
                      ) : null}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(primaryActionClass, "cursor-pointer")}
                            disabled={duplicatingId === email.id || isProcessing}
                            onClick={() => onDuplicate(email)}
                            aria-label="Duplicar e-mail"
                          >
                            {duplicatingId === email.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          Duplicar
                        </TooltipContent>
                      </Tooltip>

                      {!isSent ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                dangerActionClass,
                                "cursor-pointer hover:bg-red-50",
                              )}
                              disabled={deletingId === email.id || isProcessing}
                              onClick={() => onDelete(email.id)}
                              aria-label="Excluir e-mail"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Excluir
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </TableCell>
                      </>
                    );
                  })()}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {startItem} a {endItem} de {pagination.total}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
              >
                Anterior
              </ButtonCustom>
              <div className="flex items-center gap-1">
                {visiblePages.map((page) => (
                  <ButtonCustom
                    key={page}
                    variant={page === pagination.page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </ButtonCustom>
                ))}
              </div>
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() =>
                  onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
                }
                disabled={pagination.page >= pagination.totalPages}
              >
                Próxima
              </ButtonCustom>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
