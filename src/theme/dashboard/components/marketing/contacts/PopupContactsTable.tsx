"use client";

import { ChevronRight, Loader2, Mail, Phone } from "lucide-react";

import type {
  PopupLeadListItem,
  PopupPagination,
} from "@/api/websites/components/popups";
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
import { formatTelefone } from "@/theme/dashboard/components/admin/usuario-details/utils/formatters";
import { cn } from "@/lib/utils";

interface PopupContactsTableProps {
  contatos: PopupLeadListItem[];
  isLoading?: boolean;
  pagination?: PopupPagination;
  visiblePages: number[];
  viewingId?: string | null;
  onPageChange: (page: number) => void;
  onView: (contato: PopupLeadListItem) => void;
  onHistory: (contato: PopupLeadListItem) => void;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ContactsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={index} className="border-gray-100">
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="py-4">
              <div className="h-4 w-full max-w-[150px] animate-pulse rounded bg-slate-100" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  isLoading,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 cursor-pointer rounded-full bg-transparent text-gray-500 shadow-none",
            tone === "danger"
              ? "hover:bg-red-50 hover:text-red-500"
              : "hover:bg-[var(--primary-color)] hover:text-white",
            "disabled:cursor-wait disabled:opacity-60",
          )}
          aria-label={label}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

function getLeadStatusLabel(status: PopupLeadListItem["status"]) {
  switch (status) {
    case "NOVO":
      return "Novo";
    case "EM_ATENDIMENTO":
      return "Em atendimento";
    case "QUALIFICANDO":
      return "Qualificando";
    case "QUALIFICADO":
      return "Qualificado";
    case "CONVERTIDO":
      return "Convertido";
    case "PERDIDO":
      return "Perdido";
    case "ARQUIVADO":
      return "Arquivado";
    default:
      return status;
  }
}

function getLeadStatusTone(status: PopupLeadListItem["status"]) {
  switch (status) {
    case "CONVERTIDO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "QUALIFICADO":
    case "QUALIFICANDO":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "EM_ATENDIMENTO":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PERDIDO":
    case "ARQUIVADO":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

export function PopupContactsTable({
  contatos,
  isLoading = false,
  pagination,
  visiblePages,
  viewingId,
  onPageChange,
  onView,
  onHistory,
}: PopupContactsTableProps) {
  const startItem =
    pagination && contatos.length > 0
      ? Math.min(
          (pagination.page - 1) * pagination.pageSize + 1,
          pagination.total,
        )
      : 0;
  const endItem =
    pagination && contatos.length > 0
      ? Math.min(startItem + contatos.length - 1, pagination.total)
      : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow className="border-gray-200 bg-gray-50/50">
              <TableHead className="py-4 font-medium text-gray-700">
                Nome
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Email / Telefone
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Origem
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Inscrições
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Última captura
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Status
              </TableHead>
              <TableHead className="py-4 font-medium text-gray-700">
                Atendimento
              </TableHead>
              <TableHead className="w-12 py-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <ContactsTableSkeleton rows={pagination?.pageSize ?? 10} />}

            {!isLoading &&
              contatos.map((contato) => (
                <TableRow
                  key={contato.id}
                  className="border-gray-100 transition-colors hover:bg-gray-50/50"
                >
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="!text-sm font-semibold text-gray-950">
                        {contato.nome || "Sem nome informado"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="max-w-[220px] truncate !text-sm text-gray-700">
                          {contato.email || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="max-w-[220px] truncate !text-xs text-gray-500">
                          {contato.telefone || contato.whatsapp
                            ? formatTelefone(contato.telefone || contato.whatsapp)
                            : "Sem telefone"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="max-w-[220px] truncate !text-sm text-gray-700">
                        {contato.origemPath || "—"}
                      </div>
                      <div className="max-w-[220px] truncate !text-xs text-gray-500">
                        {contato.popupNome || "Sem rotina"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-4">
                    <button
                      type="button"
                      onClick={() => onHistory(contato)}
                      className="cursor-pointer rounded-full border border-blue-100 bg-blue-50 px-3 py-1 !text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                    >
                      {contato.inscricoesCount}
                    </button>
                  </TableCell>

                  <TableCell className="py-4 !text-sm text-gray-700">
                    {formatDate(contato.ultimaCapturaEm)}
                  </TableCell>

                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border px-2.5 py-1 !text-xs font-medium",
                        getLeadStatusTone(contato.status),
                      )}
                    >
                      {getLeadStatusLabel(contato.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-4">
                    {contato.owner?.nome ? (
                      <Badge
                        variant="outline"
                        className="border-slate-200 bg-slate-50 text-slate-700"
                      >
                        {contato.owner.nome}
                      </Badge>
                    ) : (
                      <span className="!text-sm text-gray-500">—</span>
                    )}
                  </TableCell>

                  <TableCell className="w-16 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButton
                        label="Visualizar contato"
                        onClick={() => onView(contato)}
                        isLoading={viewingId === contato.id}
                        disabled={Boolean(viewingId)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="!text-sm text-gray-600">
            Mostrando {startItem} a {endItem} de {pagination.total} contato
            {pagination.total === 1 ? "" : "s"}
          </span>

          {pagination.totalPages > 1 && (
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

              {visiblePages[0] > 1 && (
                <>
                  <ButtonCustom
                    variant={pagination.page === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="h-8 w-8 p-0"
                  >
                    1
                  </ButtonCustom>
                  {visiblePages[0] > 2 && (
                    <span className="text-gray-400">...</span>
                  )}
                </>
              )}

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
                visiblePages[visiblePages.length - 1] < pagination.totalPages && (
                  <>
                    {visiblePages[visiblePages.length - 1] <
                      pagination.totalPages - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
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
                )}

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
          )}
        </div>
      )}
    </div>
  );
}
