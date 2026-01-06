"use client";

import React, { useEffect, useMemo, useState } from "react";
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

// TODO: Mover para @/api/cursos/types quando a API implementar o histórico
export interface FrequenciaHistoryEntry {
  id: string;
  fromStatus: FrequenciaStatus;
  toStatus: FrequenciaStatus;
  fromMotivo?: string | null;
  toMotivo?: string | null;
  changedAt: string;
  actorId?: string | null;
  actorRole?: string | null;
  actorName?: string | null;
  overrideReason?: string | null;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

function formatShortDateTime(value: string) {
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

function labelForStatus(status: FrequenciaStatus) {
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

function chipClassForStatus(status: FrequenciaStatus) {
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

function getEventLabel(e: FrequenciaHistoryEntry) {
  // O primeiro lançamento é quando o status sai de qualquer estado inicial
  const isFirst = !e.fromStatus || (e.fromStatus as string) === "PENDENTE";
  if (isFirst) return "Frequência lançada";
  return "Frequência alterada";
}

export function FrequenciaHistoryModal(props: {
  isOpen: boolean;
  onClose: () => void;
  alunoNome: string;
  aulaNome?: string | null;
  history: FrequenciaHistoryEntry[];
}) {
  const { isOpen, onClose, alunoNome, aulaNome, history } = props;

  const items = useMemo(() => history ?? [], [history]);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setOpenId(null);
  }, [isOpen, alunoNome, aulaNome, items.length]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const pageItems = items.slice(startIndex, endIndex);
  const hasPagination = totalPages > 1;

  useEffect(() => {
    setOpenId(null);
  }, [safePage]);

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
          {items.length === 0 ? (
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
                  const isOpen = openId === e.changedAt;
                  const eventLabel = getEventLabel(e);
                  const toChip = labelForStatus(e.toStatus);
                  const hasDetails =
                    Boolean(e.toMotivo?.trim()) ||
                    Boolean(e.actorRole?.trim()) ||
                    Boolean(e.actorName?.trim()) ||
                    e.fromStatus !== e.toStatus;

                  return (
                    <div
                      key={`${e.changedAt}-${idx}`}
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
                                  chipClassForStatus(e.toStatus)
                                )}
                              >
                                {toChip}
                              </span>
                            </div>
                            <div
                              className="mt-1 text-xs text-gray-500"
                              title={formatDateTime(e.changedAt)}
                            >
                              {formatShortDateTime(e.changedAt)}
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
                                  prev === e.changedAt ? null : e.changedAt
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
                                  {labelForStatus(e.fromStatus)}
                                </span>{" "}
                                <span className="text-gray-400">→</span>{" "}
                                <span className="text-gray-800">
                                  {labelForStatus(e.toStatus)}
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
                    Página {safePage} de {totalPages}
                  </div>
                  <div className="flex items-center gap-4">
                    <ButtonCustom
                      variant="link"
                      size="sm"
                      withAnimation={false}
                      icon="ChevronLeft"
                      className="h-auto px-0 py-0 text-xs font-medium text-gray-600 hover:text-gray-900 hover:no-underline"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </ButtonCustom>
                    <ButtonCustom
                      variant="link"
                      size="sm"
                      withAnimation={false}
                      icon="ChevronRight"
                      iconPosition="right"
                      className="h-auto px-0 py-0 text-xs font-medium text-gray-600 hover:text-gray-900 hover:no-underline"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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
