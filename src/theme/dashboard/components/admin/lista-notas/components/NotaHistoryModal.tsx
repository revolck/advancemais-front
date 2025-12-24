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
import type { NotaHistoryEvent, NotaOrigemRef } from "@/mockData/notas";

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

function formatNota(nota: number | null): string {
  if (nota === null) return "—";
  if (!Number.isFinite(nota)) return "—";
  return nota.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(nota) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

function getOrigemLabel(origem?: NotaOrigemRef | null) {
  if (!origem) return "—";
  const tipo =
    origem.tipo === "AULA"
      ? "Aula"
      : origem.tipo === "PROVA"
      ? "Prova"
      : origem.tipo === "ATIVIDADE"
      ? "Atividade"
      : origem.tipo === "OUTRO"
      ? "Outro"
      : origem.tipo;

  const suffix = origem.titulo?.trim()
    ? origem.titulo.trim()
    : origem.id?.trim()
    ? origem.id.trim()
    : "";

  return suffix ? `${tipo} • ${suffix}` : tipo;
}

export function NotaHistoryModal(props: {
  isOpen: boolean;
  onClose: () => void;
  alunoNome: string;
  turmaNome?: string;
  history: NotaHistoryEvent[];
}) {
  const { isOpen, onClose, alunoNome, turmaNome, history } = props;

  const items = useMemo(() => history ?? [], [history]);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setOpenId(null);
  }, [isOpen, alunoNome, turmaNome, items.length]);

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
          <ModalTitle>Histórico de notas</ModalTitle>
          <div className="mt-2 flex flex-col gap-0.5">
            <div className="text-sm font-medium text-gray-900">{alunoNome}</div>
            {turmaNome ? (
              <div className="text-xs text-muted-foreground truncate">
                {turmaNome}
              </div>
            ) : null}
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-8 text-center text-sm text-gray-600">
              Nenhuma nota adicionada ou removida ainda.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="relative">
                <div
                  className="absolute left-6 top-4 bottom-4 w-px bg-gray-100"
                  aria-hidden="true"
                />

                {pageItems.map((e, idx) => {
                  const isAdd = e.action === "ADDED";
                  const isOpen = openId === e.id;
                  const origemLabel = getOrigemLabel(e.origem);
                  const motivo = e.motivo?.trim() ? e.motivo.trim() : "—";
                  const hasDetails = origemLabel !== "—" || motivo !== "—";

                  return (
                    <div
                      key={e.id}
                      className={cn(
                        (idx > 0 || startIndex > 0) && "border-t border-gray-100"
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
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  isAdd ? "text-gray-900" : "text-gray-800"
                                )}
                              >
                                {isAdd ? "Nota adicionada" : "Nota removida"}
                              </span>
                              <span className="text-sm text-gray-300">•</span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md border px-2 py-0.5",
                                  "text-sm font-semibold tabular-nums tracking-tight",
                                  isAdd
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border-red-200 bg-gray-50 text-red-700 line-through decoration-red-400/70 decoration-1"
                                )}
                              >
                                {formatNota(e.nota)}
                              </span>
                            </div>
                            <div
                              className="mt-1 text-xs text-gray-500"
                              title={formatDateTime(e.at)}
                            >
                              {formatShortDateTime(e.at)}
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
                            <div className="text-xs text-gray-600">
                              <span className="text-gray-500">Origem:</span>{" "}
                              <span className="text-gray-800">{origemLabel}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="text-gray-500">Motivo:</span>{" "}
                              <span className="whitespace-pre-wrap break-words text-gray-800">
                                {motivo}
                              </span>
                            </div>
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
