"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getNotaHistorico,
  type NotaHistoricoItem,
  type NotaHistoryEvent,
} from "@/api/cursos";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom";
import { AvatarCustom } from "@/components/ui/custom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock3,
} from "lucide-react";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNota(nota?: number | null): string {
  if (nota == null || !Number.isFinite(nota)) return "—";
  return nota.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(nota) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

function getActionMeta(acao: string) {
  switch (acao) {
    case "NOTA_MANUAL_ADICIONADA":
      return {
        label: "Adicionada",
        labelClassName: "text-emerald-700",
        dotClassName: "bg-emerald-500",
      };
    case "NOTA_MANUAL_ATUALIZADA":
      return {
        label: "Atualizada",
        labelClassName: "text-blue-700",
        dotClassName: "bg-blue-500",
      };
    case "NOTA_MANUAL_EXCLUIDA":
      return {
        label: "Removida",
        labelClassName: "text-red-700",
        dotClassName: "bg-red-500",
      };
    default:
      return {
        label: acao,
        labelClassName: "text-gray-700",
        dotClassName: "bg-gray-400",
      };
  }
}

function mapLegacyHistoryEvent(event: NotaHistoryEvent): NotaHistoricoItem {
  const actor = event.alteradoPor;
  const acao =
    event.action === "ADDED" ? "NOTA_MANUAL_ADICIONADA" : "NOTA_MANUAL_EXCLUIDA";

  return {
    id: event.id,
    acao,
    dataHora: event.at,
    ator: actor
      ? {
          id: actor.id ?? null,
          nome: actor.nome ?? null,
          role: actor.role ?? null,
          roleLabel: actor.roleLabel ?? null,
        }
      : null,
    descricao:
      acao === "NOTA_MANUAL_ADICIONADA"
        ? "Nota manual adicionada."
        : "Nota manual removida.",
    dadosAnteriores:
      acao === "NOTA_MANUAL_EXCLUIDA"
        ? {
            nota: event.nota,
            observacoes: event.motivo ?? null,
          }
        : null,
    dadosNovos:
      acao === "NOTA_MANUAL_ADICIONADA"
        ? {
            nota: event.nota,
            observacoes: event.motivo ?? null,
          }
        : null,
  };
}

function getSnapshotValue(
  item: NotaHistoricoItem["dadosAnteriores"] | NotaHistoricoItem["dadosNovos"],
  key: "nota" | "titulo" | "descricao" | "observacoes" | "dataReferencia"
) {
  if (!item) return null;
  const value = item[key];
  if (value == null || value === "") return null;
  if (key === "nota") return formatNota(typeof value === "number" ? value : Number(value));
  if (key === "dataReferencia") return formatDateTime(String(value));
  return String(value);
}

function buildDiffRows(item: NotaHistoricoItem) {
  const fields = [
    { key: "nota", label: "Nota" },
    { key: "titulo", label: "Título" },
    { key: "descricao", label: "Descrição" },
    { key: "observacoes", label: "Observações" },
    { key: "dataReferencia", label: "Data de referência" },
  ] as const;

  return fields
    .map((field) => {
      const previous = getSnapshotValue(item.dadosAnteriores, field.key);
      const next = getSnapshotValue(item.dadosNovos, field.key);

      if (previous === next) return null;

      return {
        label: field.label,
        previous,
        next,
      };
    })
    .filter(Boolean) as Array<{
    label: string;
    previous: string | null;
    next: string | null;
  }>;
}

function buildSummary(item: NotaHistoricoItem) {
  const previousNota = item.dadosAnteriores?.nota;
  const nextNota = item.dadosNovos?.nota;

  switch (item.acao) {
    case "NOTA_MANUAL_ADICIONADA":
      return `Nota manual registrada com valor ${formatNota(nextNota)}.`;
    case "NOTA_MANUAL_ATUALIZADA":
      return `Nota alterada de ${formatNota(previousNota)} para ${formatNota(nextNota)}.`;
    case "NOTA_MANUAL_EXCLUIDA":
      return `Nota manual ${formatNota(previousNota)} removida do lançamento.`;
    default:
      return item.descricao?.trim() || "Alteração registrada no histórico.";
  }
}

function shouldShowDescription(item: NotaHistoricoItem) {
  const description = item.descricao?.trim();
  if (!description) return false;

  const normalized = description.toLowerCase();
  if (
    normalized === "nota manual adicionada." ||
    normalized === "nota manual removida." ||
    normalized.includes("nota manual atualizada para inscrição")
  ) {
    return false;
  }

  return true;
}

function getSafeDescription(item: NotaHistoricoItem) {
  const description = item.descricao?.trim();
  if (!description) return null;
  if (!shouldShowDescription(item)) return null;

  const hasUuid = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(
    description
  );

  if (hasUuid || description.toLowerCase().includes("inscrição")) {
    return null;
  }

  return description;
}

function sortHistory(items: NotaHistoricoItem[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.dataHora).getTime();
    const bTime = new Date(b.dataHora).getTime();
    return bTime - aTime;
  });
}

function renderCompactValue(value?: string | null) {
  if (!value?.trim()) return "—";
  return value;
}

function formatCpf(value?: string | null) {
  if (!value) return "CPF não informado";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function NotaHistoryModal(props: {
  isOpen: boolean;
  onClose: () => void;
  alunoNome: string;
  alunoCpf?: string | null;
  alunoCodigo?: string | null;
  alunoAvatarUrl?: string | null;
  notaAtual?: number | null;
  turmaNome?: string;
  cursoId: string;
  turmaId: string;
  historicoNotaId?: string | null;
  fallbackHistory?: NotaHistoryEvent[];
}) {
  const {
    isOpen,
    onClose,
    alunoNome,
    alunoCpf,
    alunoCodigo,
    alunoAvatarUrl,
    notaAtual,
    turmaNome,
    cursoId,
    turmaId,
    historicoNotaId,
    fallbackHistory,
  } = props;

  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 4;

  const historicoQuery = useQuery<NotaHistoricoItem[], Error>({
    queryKey: ["notas", "historico", cursoId, turmaId, historicoNotaId],
    queryFn: () => getNotaHistorico(cursoId, turmaId, String(historicoNotaId)),
    enabled: isOpen && Boolean(cursoId && turmaId && historicoNotaId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const fallbackItems = useMemo(
    () => (fallbackHistory ?? []).map(mapLegacyHistoryEvent),
    [fallbackHistory]
  );

  const items = useMemo(() => {
    const merged = [...(historicoQuery.data ?? []), ...fallbackItems];
    const unique = merged.filter(
      (item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index
    );

    return sortHistory(unique);
  }, [fallbackItems, historicoQuery.data]);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setExpandedId(null);
  }, [isOpen, historicoNotaId, alunoNome, turmaNome]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + PAGE_SIZE);
  const hasPagination = totalPages > 1;
  const isLoading = historicoQuery.isLoading;
  const remoteError = historicoQuery.isError ? historicoQuery.error?.message : null;
  const shouldUseScroll = items.length > 3;

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper className={cn(shouldUseScroll && "max-h-[85vh]")}>
        <ModalHeader className="border-b border-gray-100 pb-4 text-left">
          <ModalTitle className="text-lg! sm:text-xl! font-semibold">
            Histórico de notas
          </ModalTitle>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <AvatarCustom
                name={alunoNome}
                src={alunoAvatarUrl ?? undefined}
                size="md"
                withBorder
                className="shrink-0"
              />

              <div className="min-w-0">
                <div className="truncate text-[15px] font-medium text-gray-900">
                  {alunoNome}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-400">
                  {alunoCodigo ? <span className="font-medium text-gray-500">{alunoCodigo}</span> : null}
                  {alunoCodigo && alunoCpf ? <span className="text-gray-300">•</span> : null}
                  {alunoCpf ? <span>{formatCpf(alunoCpf)}</span> : null}
                  {turmaNome ? (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{turmaNome}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                Nota atual
              </div>
              <div className="mt-1 text-[22px] font-semibold leading-none text-gray-900">
                {formatNota(notaAtual ?? null)}
              </div>
            </div>
          </div>
        </ModalHeader>

        <ModalBody
          className={cn(
            "space-y-4",
            shouldUseScroll && "max-h-[68vh] overflow-y-auto pr-2"
          )}
        >
          {remoteError && fallbackItems.length === 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-[65ch]">{remoteError}</div>
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => historicoQuery.refetch()}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  Tentar novamente
                </ButtonCustom>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="relative pl-10">
                    <span className="absolute left-[14px] top-3 h-3 w-3 rounded-full bg-gray-200" />
                    <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50/30 px-4 py-8 text-center text-sm text-gray-600">
              Nenhum evento de histórico encontrado para esta nota.
            </div>
          ) : (
            <div className="space-y-3">
              {pageItems.map((item) => {
                const meta = getActionMeta(item.acao);
                const diffRows = buildDiffRows(item);
                const actorLabel = item.ator?.roleLabel || item.ator?.role || "Sistema";
                const isExpanded = expandedId === item.id;
                const safeDescription = getSafeDescription(item);
                const safeSummary = buildSummary(item);
                const primaryNota =
                  item.acao === "NOTA_MANUAL_EXCLUIDA"
                    ? item.dadosAnteriores?.nota ?? null
                    : item.dadosNovos?.nota ?? item.dadosAnteriores?.nota ?? null;
                const primaryObs =
                  item.acao === "NOTA_MANUAL_EXCLUIDA"
                    ? item.dadosAnteriores?.observacoes ?? null
                    : item.dadosNovos?.observacoes ?? item.dadosAnteriores?.observacoes ?? null;
                const hasNota = primaryNota != null;
                const hasObs = typeof primaryObs === "string" && primaryObs.trim().length > 0;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-[22px] border border-black/6 bg-white px-4 py-3.5 transition-all",
                      isExpanded && "border-black/8 bg-[#FCFCFD] shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpanded(item.id)}
                      className="group flex w-full items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/20"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                    >
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-200">
                        <span
                          className={cn("block h-2.5 w-2.5 rounded-full", meta.dotClassName)}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className={cn("font-semibold", meta.labelClassName)}>
                              {meta.label}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatDateTime(item.dataHora)}
                            </span>
                          </div>

                          <div className="text-[15px] font-medium leading-6 text-gray-900">
                            {safeSummary}
                          </div>

                          <div className="text-sm text-gray-500">
                            {item.ator?.nome || "Sistema"}
                            <span className="mx-1 text-gray-300">•</span>
                            {actorLabel}
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="mt-4 rounded-[18px] border border-black/6 bg-white/80 p-3">
                            {safeDescription && safeDescription !== safeSummary ? (
                              <div className="mb-3 text-sm leading-relaxed text-gray-600">
                                {safeDescription}
                              </div>
                            ) : null}

                            {item.acao === "NOTA_MANUAL_ATUALIZADA" && diffRows.length > 0 ? (
                              <div className="space-y-2">
                                {diffRows.map((row) => (
                                  <div
                                    key={`${item.id}-${row.label}`}
                                    className="grid gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 md:grid-cols-[120px,1fr]"
                                  >
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      {row.label}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                      <span className="rounded-md bg-red-50 px-2 py-1 text-red-600">
                                        {row.previous ?? "—"}
                                      </span>
                                      <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                                      <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                                        {row.next ?? "—"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {(item.acao === "NOTA_MANUAL_ADICIONADA" ||
                              item.acao === "NOTA_MANUAL_EXCLUIDA") && (
                              <div className="rounded-xl border border-black/6 bg-white px-4 py-3">
                                <div className="flex items-start justify-between gap-4 border-b border-black/6 py-2 first:pt-0 last:border-b-0">
                                  <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500">
                                    Nota
                                  </div>
                                  <div
                                    className={cn(
                                      "text-sm font-semibold",
                                      hasNota ? "text-gray-900" : "text-gray-400"
                                    )}
                                  >
                                    {formatNota(primaryNota)}
                                  </div>
                                </div>
                                <div className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
                                  <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500">
                                    Observações
                                  </div>
                                  <div
                                    className={cn(
                                      "max-w-[70%] text-right text-sm leading-6",
                                      hasObs ? "text-gray-700" : "text-gray-400"
                                    )}
                                  >
                                    {hasObs ? primaryObs : "Sem observações"}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-gray-500 transition-colors group-hover:bg-[#ECECEF] group-hover:text-gray-900">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {hasPagination && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500">
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
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
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
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Próxima
                </ButtonCustom>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
