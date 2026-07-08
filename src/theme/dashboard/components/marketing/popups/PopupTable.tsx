"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  PopupPagination,
  WebsitePopupListItem,
} from "@/api/websites/components/popups";
import { cn } from "@/lib/utils";
import {
  POPUP_DEVICE_LABEL,
  POPUP_FREQUENCY_LABEL,
  POPUP_SCOPE_LABEL,
  POPUP_STATUS_LABEL,
  POPUP_TRIGGER_LABEL,
} from "./constants";

interface PopupTableProps {
  popups: WebsitePopupListItem[];
  isLoading?: boolean;
  pagination?: PopupPagination;
  visiblePages: number[];
  deletingId?: string;
  togglingStatusId?: string;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (popup: WebsitePopupListItem) => void;
}

const statusClass = {
  PUBLICADO: "border-green-200 bg-green-50 text-green-700",
  RASCUNHO: "border-slate-200 bg-slate-50 text-slate-600",
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

function PopupTableSkeleton({ rows = 8 }: { rows?: number }) {
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

export function PopupTable({
  popups,
  isLoading = false,
  pagination,
  visiblePages,
  deletingId,
  togglingStatusId,
  onPageChange,
  onDelete,
  onToggleStatus,
}: PopupTableProps) {
  const primaryActionClass =
    "h-8 w-8 rounded-full p-0 text-slate-400 transition-colors hover:text-[var(--primary-color)]";
  const dangerActionClass =
    "h-8 w-8 rounded-full p-0 text-red-400 transition-colors hover:text-red-500";

  const startItem =
    pagination && popups.length > 0
      ? Math.min(
          (pagination.page - 1) * pagination.pageSize + 1,
          pagination.total,
        )
      : 0;
  const endItem =
    pagination && popups.length > 0
      ? Math.min(startItem + popups.length - 1, pagination.total)
      : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/70">
              <TableHead className="py-4 font-medium text-gray-700">
                Pop-up
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Local
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Dispositivo
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Gatilho
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Contatos
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Atualizado
              </TableHead>
              <TableHead className="w-28 py-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <PopupTableSkeleton rows={pagination?.pageSize ?? 8} />
            )}
            {!isLoading &&
              popups.map((popup) => (
                <TableRow
                  key={popup.id}
                  className="border-gray-100 transition-colors hover:bg-gray-50/60"
                >
                  <TableCell className="py-4">
                    <div>
                      <div className="font-medium text-gray-950">
                        {popup.nome}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>{popup.templateSlug || "sem template"}</span>
                        {popup.tag && (
                          <Badge
                            variant="outline"
                            className="border-blue-100 bg-blue-50 text-blue-700"
                          >
                            {popup.tag}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusClass[popup.status],
                      )}
                    >
                      {POPUP_STATUS_LABEL[popup.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-700">
                    {POPUP_SCOPE_LABEL[popup.escopo]}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-700">
                    {POPUP_DEVICE_LABEL[popup.dispositivo]}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm text-gray-700">
                      {POPUP_TRIGGER_LABEL[popup.gatilho]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {POPUP_FREQUENCY_LABEL[popup.frequencia]}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-medium text-gray-900">
                    {popup._count?.WebsitePopupContatos ?? 0}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-600">
                    {formatDate(popup.atualizadoEm)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex justify-end gap-1">
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
                              deletingId === popup.id ||
                              togglingStatusId === popup.id
                            }
                            onClick={() => onToggleStatus(popup)}
                            aria-label={
                              popup.status === "PUBLICADO"
                                ? "Mover para rascunho"
                                : "Publicar pop-up"
                            }
                          >
                            {togglingStatusId === popup.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : popup.status === "PUBLICADO" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          {popup.status === "PUBLICADO"
                            ? "Mover para rascunho"
                            : "Publicar pop-up"}
                        </TooltipContent>
                      </Tooltip>

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
                            asChild
                            aria-label="Editar pop-up"
                          >
                            <Link
                              href={`/dashboard/marketing/popup/${popup.id}/editar`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          Editar pop-up
                        </TooltipContent>
                      </Tooltip>

                      {popup.status !== "PUBLICADO" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                dangerActionClass,
                                "cursor-pointer",
                              )}
                              disabled={
                                deletingId === popup.id ||
                                togglingStatusId === popup.id
                              }
                              onClick={() => onDelete(popup.id)}
                              aria-label="Excluir pop-up"
                            >
                              {deletingId === popup.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Excluir pop-up
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">
            Mostrando {startItem} a {endItem} de {pagination.total} pop-up
            {pagination.total === 1 ? "" : "s"}
          </span>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <ButtonCustom
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Anterior
              </ButtonCustom>
              {visiblePages.map((page) => (
                <ButtonCustom
                  key={page}
                  variant={pagination.page === page ? "primary" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </ButtonCustom>
              ))}
              <ButtonCustom
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
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
