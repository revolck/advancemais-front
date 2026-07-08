"use client";

import { CalendarDays, Loader2, Pencil, RefreshCcw, Trash2, Users } from "lucide-react";

import type { RecipientListListItem } from "@/api/websites/components/recipientlists";
import type { RecipientListPagination } from "@/api/websites/components/recipientlists/types";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RecipientListsTableProps {
  lists: RecipientListListItem[];
  isLoading?: boolean;
  pagination?: RecipientListPagination;
  visiblePages: number[];
  recalculatingId?: string;
  deletingId?: string;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRecalculate: (id: string) => void;
}

const membershipLabel: Record<string, string> = {
  MANUAL: "Manual",
  DINAMICA: "Dinâmica",
  HIBRIDA: "Híbrida",
};

const statusLabel: Record<string, string> = {
  ATIVA: "Ativa",
  ARQUIVADA: "Arquivada",
};

const statusClass = {
  ATIVA: "border-green-200 bg-green-50 text-green-700",
  ARQUIVADA: "border-slate-200 bg-slate-50 text-slate-600",
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

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function RecipientListsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="py-4">
              <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function RecipientListsTable({
  lists,
  isLoading = false,
  pagination,
  visiblePages,
  recalculatingId,
  deletingId,
  onPageChange,
  onEdit,
  onDelete,
  onRecalculate,
}: RecipientListsTableProps) {
  const startItem =
    pagination && lists.length > 0
      ? Math.min(
          (pagination.page - 1) * pagination.pageSize + 1,
          pagination.total,
        )
      : 0;
  const endItem =
    pagination && lists.length > 0
      ? Math.min(startItem + lists.length - 1, pagination.total)
      : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/70">
              <TableHead className="py-4 font-medium text-gray-700">
                Lista
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Descrição
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Tipo
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Destinatários
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Atualizado em
              </TableHead>
              <TableHead className="w-28 py-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <RecipientListsTableSkeleton rows={pagination?.pageSize ?? 8} />
            )}

            {!isLoading &&
              lists.map((list) => (
                <TableRow
                  key={list.id}
                  className="border-gray-100 transition-colors hover:bg-gray-50/60"
                >
                  <TableCell className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-950">
                        {list.nome}
                      </span>
                      <Badge
                        variant="outline"
                        className="rounded-full border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
                      >
                        ID {list.id.slice(0, 8)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-600">
                    {list.descricao ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block max-w-[280px] cursor-default truncate">
                            {truncateText(list.descricao, 56)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8} className="max-w-sm">
                          {list.descricao}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusClass[list.status],
                      )}
                    >
                      {statusLabel[list.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-700">
                    {membershipLabel[list.membershipMode]}
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-gray-900">
                    {list.recalculationStatus === "PROCESSING" ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-300" />
                        <Skeleton className="h-4 w-14 rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{list.recipientCount.toLocaleString("pt-BR")}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(list.atualizadoEm)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full p-0 text-slate-400 transition-colors hover:text-[var(--primary-color)] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={
                              deletingId === list.id ||
                              recalculatingId === list.id ||
                              list.recalculationStatus === "PROCESSING"
                            }
                            onClick={() => onEdit(list.id)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>Editar</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full p-0 text-slate-400 transition-colors hover:text-[var(--primary-color)] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={
                              deletingId === list.id ||
                              recalculatingId === list.id ||
                              list.recalculationStatus === "PROCESSING"
                            }
                            onClick={() => onRecalculate(list.id)}
                            aria-label="Recalcular"
                          >
                            {recalculatingId === list.id ||
                            list.recalculationStatus === "PROCESSING" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCcw className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          Recalcular
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full p-0 text-red-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={
                              deletingId === list.id ||
                              recalculatingId === list.id ||
                              list.recalculationStatus === "PROCESSING"
                            }
                            onClick={() => onDelete(list.id)}
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>Excluir</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 ? (
        <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Mostrando {startItem} a {endItem} de {pagination.total}{" "}
              lista{pagination.total === 1 ? "" : "s"}
            </span>
          </div>

          {pagination.totalPages > 1 && visiblePages.length > 0 ? (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="h-8 px-3"
              >
                Anterior
              </ButtonCustom>

              {visiblePages[0] > 1 ? (
                <>
                  <ButtonCustom
                    variant={pagination.page === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </ButtonCustom>
                  {visiblePages[0] > 2 ? (
                    <span className="text-gray-400">...</span>
                  ) : null}
                </>
              ) : null}

              {visiblePages.map((page) => (
                <ButtonCustom
                  key={page}
                  variant={pagination.page === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </ButtonCustom>
              ))}

              {visiblePages.length > 0 &&
              visiblePages[visiblePages.length - 1] < pagination.totalPages ? (
                <>
                  {visiblePages[visiblePages.length - 1] <
                  pagination.totalPages - 1 ? (
                    <span className="text-gray-400">...</span>
                  ) : null}
                  <ButtonCustom
                    variant={
                      pagination.page === pagination.totalPages
                        ? "primary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => onPageChange(pagination.totalPages)}
                    className="h-8 w-8 p-0"
                  >
                    {pagination.totalPages}
                  </ButtonCustom>
                </>
              ) : null}

              <ButtonCustom
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="h-8 px-3"
              >
                Próxima
              </ButtonCustom>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
