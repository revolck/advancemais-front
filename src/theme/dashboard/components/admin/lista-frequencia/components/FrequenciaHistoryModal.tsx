"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FrequenciaHistoryEntry as ApiFrequenciaHistoryEntry } from "@/api/cursos";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FrequenciaStatus } from "../hooks/useFrequenciaDashboardQuery";
import { Skeleton } from "@/components/ui/skeleton";

type HistoryStatus = FrequenciaStatus | "PENDENTE" | "PRESENTE" | "AUSENTE";

interface NormalizedHistoryEntry {
  id: string;
  evento?: string | null;
  fromStatus?: HistoryStatus | null;
  toStatus?: HistoryStatus | null;
  fromMotivo?: string | null;
  toMotivo?: string | null;
  changedAt?: string | null;
  dataReferencia?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  actorEmail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  origem?: string | null;
}

function normalizeHistoryEntry(
  entry: ApiFrequenciaHistoryEntry,
  index: number
): NormalizedHistoryEntry {
  const actor = entry.actor ?? null;
  const ator = entry.ator ?? null;
  const seguranca = entry.seguranca ?? null;

  const fromStatus = (entry.deStatus ??
    entry.fromStatus ??
    null) as HistoryStatus | null;
  const toStatus = (entry.paraStatus ??
    entry.toStatus ??
    null) as HistoryStatus | null;

  return {
    id: entry.id || `${entry.createdAt || entry.changedAt || "history"}-${index}`,
    evento: entry.evento ?? null,
    fromStatus,
    toStatus,
    fromMotivo: entry.deMotivo ?? entry.fromMotivo ?? null,
    toMotivo: entry.paraMotivo ?? entry.toMotivo ?? entry.motivo ?? null,
    changedAt: entry.createdAt ?? entry.changedAt ?? null,
    dataReferencia: entry.dataReferencia ?? null,
    actorName:
      ator?.nome ??
      actor?.nome ??
      entry.actorName ??
      null,
    actorRole:
      ator?.perfilLabel ??
      ator?.perfil ??
      actor?.roleLabel ??
      actor?.role ??
      entry.actorRole ??
      null,
    actorEmail: ator?.email ?? null,
    ip: seguranca?.ip ?? null,
    userAgent: seguranca?.userAgent ?? null,
    origem: seguranca?.origem ?? null,
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sem data";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

function formatShortDateTime(value?: string | null) {
  if (!value) return "Sem data";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function isSameCalendarDay(
  dateOnly?: string | null,
  dateTime?: string | null
): boolean {
  if (!dateOnly || !dateTime) return false;
  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return false;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` === dateOnly;
}

function labelForStatus(status?: HistoryStatus | null) {
  switch (status) {
    case "PRESENTE":
      return "Presente";
    case "AUSENTE":
      return "Ausente";
    case "JUSTIFICADO":
      return "Justificado";
    case "ATRASADO":
      return "Atrasado";
    default:
      return "Pendente";
  }
}

function chipClassForStatus(status?: HistoryStatus | null) {
  switch (status) {
    case "PRESENTE":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "AUSENTE":
      return "border-red-200 bg-red-50 text-red-800";
    case "JUSTIFICADO":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "ATRASADO":
      return "border-orange-200 bg-orange-50 text-orange-900";
    default:
      return "border-gray-200 bg-gray-50 text-gray-800";
  }
}

function getEventLabel(e: NormalizedHistoryEntry) {
  switch ((e.evento ?? "").toUpperCase()) {
    case "FREQUENCIA_LANCADA":
      return "Frequência lançada";
    case "MOTIVO_ALTERADO":
      return "Motivo alterado";
    case "STATUS_ALTERADO":
      return "Status alterado";
    default: {
      const isFirst = !e.fromStatus || e.fromStatus === "PENDENTE";
      return isFirst ? "Frequência lançada" : "Frequência alterada";
    }
  }
}

export function FrequenciaHistoryModal(props: {
  isOpen: boolean;
  onClose: () => void;
  alunoNome: string;
  aulaNome?: string | null;
  history: ApiFrequenciaHistoryEntry[];
  isLoading?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const {
    isOpen,
    onClose,
    alunoNome,
    aulaNome,
    history,
    isLoading = false,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
  } = props;

  const items = useMemo(
    () => (history ?? []).map((entry, index) => normalizeHistoryEntry(entry, index)),
    [history]
  );
  const DEFAULT_PAGE_SIZE = 5;
  const isServerPagination = typeof onPageChange === "function";
  const [localPage, setLocalPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!isServerPagination) {
      setLocalPage(1);
    }
    setOpenId(null);
  }, [isOpen, isServerPagination, alunoNome, aulaNome, items.length]);

  const resolvedPageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const resolvedTotal = total ?? items.length;
  const resolvedTotalPages =
    totalPages ?? Math.max(1, Math.ceil(resolvedTotal / resolvedPageSize));
  const safePage = Math.min(
    Math.max(1, isServerPagination ? (page ?? 1) : localPage),
    resolvedTotalPages
  );
  const startIndex = (safePage - 1) * resolvedPageSize;
  const endIndex = Math.min(startIndex + resolvedPageSize, resolvedTotal);
  const pageItems = isServerPagination ? items : items.slice(startIndex, endIndex);
  const hasPagination = resolvedTotalPages > 1;

  useEffect(() => {
    setOpenId(null);
  }, [safePage]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > resolvedTotalPages) return;
    if (isServerPagination) {
      onPageChange?.(nextPage);
      return;
    }
    setLocalPage(nextPage);
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Histórico de frequência</ModalTitle>
          <div className="mt-0 flex flex-col gap-0.5">
            <div className="text-sm font-medium text-gray-900">{alunoNome}</div>
            {aulaNome ? (
              <div className="text-xs text-muted-foreground truncate">
                {aulaNome}
              </div>
            ) : null}
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="space-y-0">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "px-4 py-4",
                      idx > 0 && "border-t border-gray-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-28 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-8 text-center text-sm text-gray-600">
              Nenhuma alteração registrada ainda.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="relative">
                <div
                  className="absolute left-6 top-4 bottom-4 w-px bg-gray-100"
                  aria-hidden="true"
                />

                {pageItems.map((e, idx) => {
                  const isOpen = openId === e.id;
                  const eventLabel = getEventLabel(e);
                  const toStatus = e.toStatus ?? "PENDENTE";
                  const toChip = labelForStatus(toStatus);
                  const showDataReferencia =
                    Boolean(e.dataReferencia) &&
                    !isSameCalendarDay(e.dataReferencia, e.changedAt);
                  const hasDetails =
                    Boolean(e.toMotivo?.trim()) ||
                    Boolean(e.actorRole?.trim()) ||
                    Boolean(e.actorName?.trim()) ||
                    Boolean(e.actorEmail?.trim()) ||
                    Boolean(e.ip?.trim()) ||
                    Boolean(e.userAgent?.trim()) ||
                    Boolean(e.origem?.trim()) ||
                    showDataReferencia ||
                    e.fromStatus !== e.toStatus;

                  return (
                    <div
                      key={`${e.id}-${idx}`}
                      className={cn(
                        (idx > 0 || startIndex > 0) &&
                          "border-t border-gray-100"
                      )}
                    >
                      <div className="relative px-4 py-4 pl-12">
                        <span
                          className="absolute left-[22px] top-7 h-2 w-2 rounded-full bg-gray-300"
                          aria-hidden="true"
                        />

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-medium text-gray-900">
                                {eventLabel}
                              </span>
                              <span className="text-sm text-gray-300">•</span>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-md border px-2 py-0.5",
                                    "text-sm font-semibold tabular-nums tracking-tight",
                                    chipClassForStatus(toStatus)
                                  )}
                                >
                                  {toChip}
                                </span>
                            </div>
                            <div
                              className="mt-1 text-xs text-gray-500"
                              title={formatDateTime(e.changedAt)}
                            >
                              Registrado em {formatShortDateTime(e.changedAt)}
                            </div>
                          </div>

                          {hasDetails ? (
                            <ButtonCustom
                              variant="link"
                              size="sm"
                              withAnimation={false}
                              className="h-auto px-0 py-0 text-xs font-medium text-[var(--primary-color)] hover:no-underline"
                              onClick={() =>
                                setOpenId((prev) =>
                                  prev === e.id ? null : e.id
                                )
                              }
                            >
                              {isOpen ? "Ocultar" : "Ver detalhes"}
                            </ButtonCustom>
                          ) : null}
                        </div>

                        {hasDetails && isOpen && (
                          <div className="mt-3 space-y-1.5">
                            {e.fromStatus !== e.toStatus ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">De:</span>{" "}
                                <span className="text-gray-800">
                                  {labelForStatus(e.fromStatus ?? "PENDENTE")}
                                </span>{" "}
                                <span className="text-gray-400">→</span>{" "}
                                <span className="text-gray-800">
                                  {labelForStatus(e.toStatus ?? "PENDENTE")}
                                </span>
                              </div>
                            ) : null}
                            {showDataReferencia ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">
                                  Data de referência:
                                </span>{" "}
                                <span className="text-gray-800">
                                  {formatDate(e.dataReferencia)}
                                </span>
                              </div>
                            ) : null}
                            {e.actorName || e.actorRole ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">Por:</span>{" "}
                                <span className="text-gray-800">
                                  {e.actorName?.trim()
                                    ? e.actorName
                                    : "Usuário"}
                                </span>
                                {e.actorRole ? (
                                  <span className="text-gray-500">
                                    {" "}
                                    • {e.actorRole}
                                  </span>
                                ) : null}
                                {e.actorEmail ? (
                                  <span className="text-gray-500">
                                    {" "}
                                    • {e.actorEmail}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            {e.ip || e.origem ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">Origem:</span>{" "}
                                <span className="text-gray-800">
                                  {e.ip || "IP não informado"}
                                </span>
                                {e.origem ? (
                                  <span className="text-gray-500">
                                    {" "}
                                    • {e.origem}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            {e.userAgent ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">User-Agent:</span>{" "}
                                <span
                                  className="text-gray-800 break-all"
                                  title={e.userAgent}
                                >
                                  {e.userAgent}
                                </span>
                              </div>
                            ) : null}
                            {e.toMotivo?.trim() ? (
                              <div className="text-xs text-gray-600">
                                <span className="text-gray-500">Motivo:</span>{" "}
                                <span className="whitespace-pre-wrap break-words text-gray-800">
                                  {e.toMotivo.trim()}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasPagination && (
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                  <div className="text-xs text-gray-500 tabular-nums">
                    Mostrando {resolvedTotal > 0 ? startIndex + 1 : 0} a {endIndex} de{" "}
                    {resolvedTotal}
                  </div>
                  <div className="flex items-center gap-4">
                    <ButtonCustom
                      variant="link"
                      size="sm"
                      withAnimation={false}
                      icon="ChevronLeft"
                      className="h-auto px-0 py-0 text-xs font-medium text-gray-600 hover:text-gray-900 hover:no-underline"
                      disabled={safePage <= 1 || isLoading}
                      onClick={() => handlePageChange(safePage - 1)}
                    >
                      Anterior
                    </ButtonCustom>
                    <div className="text-xs text-gray-500 tabular-nums">
                      Página {safePage} de {resolvedTotalPages}
                    </div>
                    <ButtonCustom
                      variant="link"
                      size="sm"
                      withAnimation={false}
                      icon="ChevronRight"
                      iconPosition="right"
                      className="h-auto px-0 py-0 text-xs font-medium text-gray-600 hover:text-gray-900 hover:no-underline"
                      disabled={safePage >= resolvedTotalPages || isLoading}
                      onClick={() => handlePageChange(safePage + 1)}
                    >
                      Próxima
                    </ButtonCustom>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
