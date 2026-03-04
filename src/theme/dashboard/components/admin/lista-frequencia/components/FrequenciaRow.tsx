"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  History,
  Loader2,
  PenSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  FrequenciaListItem,
  FrequenciaStatus,
} from "../hooks/useFrequenciaDashboardQuery";
import {
  listFrequenciaHistorico,
  listFrequenciaHistoricoByNaturalKey,
  type FrequenciaHistoryEntry as ApiFrequenciaHistoryEntry,
} from "@/api/cursos";
import { AlunoCell } from "./AlunoCell";

interface FrequenciaHistoryEntry {
  id: string;
  fromStatus: FrequenciaStatus;
  toStatus: FrequenciaStatus;
  changedAt: string;
  actorName?: string;
  actorRole?: string;
}
import { FrequenciaHistoryModal } from "./FrequenciaHistoryModal";
import type { AulaSelectItem } from "../hooks/useAulasForSelect";
import { EvidenceCell } from "./EvidenceCell";
import { FrequenciaConfirmModal } from "./FrequenciaConfirmModal";

interface FrequenciaRowProps {
  item: FrequenciaListItem;
  cursoNome?: string | null;
  turmaNome?: string | null;
  canEdit: boolean;
  canOverride: boolean;
  aula?: AulaSelectItem | null;
  aulaNome?: string | null;
  blockedMessage?: string;
  isSaving?: boolean;
  onSave: (params: {
    status: FrequenciaStatus;
    motivo?: string | null;
  }) => Promise<void> | void;
}

function statusPill(status: FrequenciaStatus) {
  switch (status) {
    case "PRESENTE":
      return {
        label: "Presente",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "AUSENTE":
      return {
        label: "Ausente",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    case "JUSTIFICADO":
      return {
        label: "Justificado",
        className: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "ATRASADO":
      return {
        label: "Atrasado",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    default:
      return {
        label: "Pendente",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

function origemPill(tipo: FrequenciaListItem["tipoOrigem"]) {
  switch (tipo) {
    case "PROVA":
      return {
        label: "Prova",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: FileText,
      };
    case "ATIVIDADE":
      return {
        label: "Atividade",
        className: "bg-violet-50 text-violet-700 border-violet-200",
        icon: PenSquare,
      };
    default:
      return {
        label: "Aula",
        className: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: BookOpen,
      };
  }
}

export function FrequenciaRow({
  item,
  cursoNome,
  turmaNome,
  canEdit,
  canOverride,
  aula,
  aulaNome,
  blockedMessage,
  isSaving = false,
  onSave,
}: FrequenciaRowProps) {
  const [draftStatus, setDraftStatus] = useState<FrequenciaStatus>(
    item.statusAtual
  );
  const [displayMotivo, setDisplayMotivo] = useState<string>(item.justificativa ?? "");
  const [activeSave, setActiveSave] = useState<"presente" | "ausente" | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<FrequenciaStatus | null>(
    null
  );
  const [pendingMotivo, setPendingMotivo] = useState("");
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false);

  useEffect(() => {
    setDraftStatus(item.statusAtual);
    setDisplayMotivo(item.justificativa ?? "");
  }, [item.justificativa, item.statusAtual]);

  const isPresent = draftStatus === "PRESENTE" || draftStatus === "ATRASADO";
  const isAbsent = draftStatus === "AUSENTE" || draftStatus === "JUSTIFICADO";

  const motivoNormalized = useMemo(() => pendingMotivo.trim(), [pendingMotivo]);
  const displayMotivoNormalized = useMemo(
    () => displayMotivo.trim(),
    [displayMotivo]
  );

  // Como não há status "PENDENTE", consideramos que sempre pode ser editado se canEdit for true
  // ou se canOverride for true (admin/moderador/pedagógico)
  const isLockedForUser = !canEdit && !canOverride;
  const isOverrideFlow = canOverride && canEdit;
  const lockedPill = useMemo(
    () => statusPill(item.statusAtual),
    [item.statusAtual]
  );
  const currentPill = useMemo(() => statusPill(draftStatus), [draftStatus]);
  const origem = useMemo(() => origemPill(item.tipoOrigem), [item.tipoOrigem]);
  const OrigemIcon = origem.icon;
  const cursoNomeExibicao = cursoNome || item.cursoNome || "—";
  const turmaNomeExibicao = turmaNome || item.turmaNome || "—";
  const isRowSaving = isSaving || isConfirmSubmitting;
  const canOpenHistory = Boolean(
    item.id ||
      (item.naturalKey?.inscricaoId &&
        item.naturalKey?.tipoOrigem &&
        item.naturalKey?.origemId &&
        item.cursoId &&
        item.turmaId)
  );

  const historyQuery = useQuery<ApiFrequenciaHistoryEntry[], Error>({
    queryKey: [
      "frequencia",
      "history",
      item.id ?? null,
      item.key,
      historyOpen,
    ],
    enabled: historyOpen && canOpenHistory,
    queryFn: async () => {
      if (item.id) {
        return listFrequenciaHistorico(item.cursoId, item.turmaId, item.id);
      }

      if (!item.naturalKey) return [];

      return listFrequenciaHistoricoByNaturalKey(item.cursoId, item.turmaId, {
        inscricaoId: item.naturalKey.inscricaoId,
        tipoOrigem: item.naturalKey.tipoOrigem,
        origemId: item.naturalKey.origemId,
      });
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!historyQuery.isError || !historyOpen) return;
    toastCustom.error(
      historyQuery.error?.message || "Não foi possível carregar o histórico."
    );
  }, [historyOpen, historyQuery.error, historyQuery.isError]);

  const historyItems: FrequenciaHistoryEntry[] = useMemo(
    () =>
      (historyQuery.data ?? []).map((entry) => ({
        id: entry.id,
        fromStatus: (entry.fromStatus ?? "PENDENTE") as FrequenciaStatus,
        toStatus: entry.toStatus,
        fromMotivo: entry.fromMotivo ?? null,
        toMotivo: entry.toMotivo ?? entry.motivo ?? null,
        changedAt: entry.changedAt,
        actorName: entry.actor?.nome ?? entry.actorName ?? undefined,
        actorRole:
          entry.actor?.roleLabel ??
          entry.actor?.role ??
          entry.actorRole ??
          undefined,
      })),
    [historyQuery.data]
  );

  const openConfirm = (nextStatus: FrequenciaStatus) => {
    if (isRowSaving) return;
    if (!canEdit) {
      toastCustom.warning(blockedMessage ?? "Ação indisponível no momento.");
      return;
    }
    if (isLockedForUser) {
      toastCustom.warning("Frequência já lançada e não pode ser alterada.");
      return;
    }
    setPendingStatus(nextStatus);
    setPendingMotivo(nextStatus === "AUSENTE" ? displayMotivo : "");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (isRowSaving) return;
    if (!pendingStatus) return;

    if (!canEdit) {
      toastCustom.warning(blockedMessage ?? "Ação indisponível no momento.");
      return;
    }

    if (pendingStatus === "AUSENTE" && motivoNormalized.length === 0) {
      toastCustom.error("Informe o motivo da ausência.");
      return;
    }

    const nextMotivo =
      pendingStatus === "AUSENTE" ? motivoNormalized || null : null;
    setIsConfirmSubmitting(true);
    setDraftStatus(pendingStatus);
    setDisplayMotivo(nextMotivo ?? "");
    setActiveSave(pendingStatus === "PRESENTE" ? "presente" : "ausente");
    try {
      await Promise.resolve(
        onSave({
          status: pendingStatus,
          motivo: nextMotivo,
        })
      );
      toastCustom.success("Frequência salva.");
      setConfirmOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a frequência.";
      toastCustom.error(msg);
      setDraftStatus(item.statusAtual);
      setDisplayMotivo(item.justificativa ?? "");
    } finally {
      setActiveSave(null);
      setIsConfirmSubmitting(false);
    }
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 bg-white transition-colors",
        isRowSaving ? "opacity-80" : "hover:bg-blue-50/40"
      )}
    >
      <TableCell className="py-4 px-3">
        <AlunoCell
          alunoId={item.alunoId}
          alunoNome={item.alunoNome}
          alunoCodigo={item.alunoCodigo}
          alunoCpf={item.alunoCpf}
          avatarUrl={(item as any)?.avatarUrl ?? null}
        />
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="flex min-w-0 items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Curso</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {cursoNomeExibicao}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Turma</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {turmaNomeExibicao}
              </span>
              {item.turmaCodigo && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {item.turmaCodigo}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge className={cn("border inline-flex items-center gap-1.5", origem.className)}>
          <OrigemIcon className="h-3.5 w-3.5" />
          {origem.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3">
        <EvidenceCell aula={aula} item={item} />
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge className={cn("border", currentPill.className)}>
          {currentPill.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3">
        {draftStatus === "AUSENTE" || draftStatus === "JUSTIFICADO" ? (
          displayMotivoNormalized ? (
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                <div className="cursor-default min-w-0">
                  <div className="text-sm font-medium text-gray-900 break-words leading-snug line-clamp-3">
                    {displayMotivo}
                  </div>
                </div>
                </TooltipTrigger>
              <TooltipContent sideOffset={8} className="max-w-lg">
                <div className="space-y-1">
                  <div className="text-xs font-semibold">Motivo</div>
                  <div className="text-xs whitespace-pre-wrap break-words">
                    {displayMotivo}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="text-sm text-red-700">
              Motivo obrigatório não informado.
            </div>
          )
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </TableCell>

      <TableCell className="py-4 px-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {isLockedForUser ? (
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    lockedPill.className
                  )}
                >
                  {lockedPill.label}
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                Frequência já lançada (somente Admin/Moderador/Pedagógico pode
                alterar).
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openConfirm("PRESENTE")}
                    disabled={!canEdit || isRowSaving}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer border transition-all",
                      isPresent
                        ? "text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700"
                        : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:text-white hover:bg-emerald-600 hover:border-emerald-600",
                      isPresent && "ring-2 ring-emerald-200 ring-offset-1",
                      (!canEdit || isRowSaving) &&
                        "opacity-50 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                    )}
                  >
                    <span className="sr-only">Marcar como presente</span>
                    {isRowSaving && activeSave === "presente" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-current" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>Presente</TooltipContent>
              </Tooltip>

              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openConfirm("AUSENTE")}
                    disabled={!canEdit || isRowSaving}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer border transition-all",
                      isAbsent
                        ? "text-white bg-red-600 border-red-600 hover:bg-red-700 hover:text-white hover:border-red-700"
                        : "text-red-600 bg-red-50 border-red-200 hover:text-white hover:bg-red-600 hover:border-red-600",
                      isAbsent && "ring-2 ring-red-200 ring-offset-1",
                      (!canEdit || isRowSaving) &&
                        "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    )}
                  >
                    <span className="sr-only">Marcar como ausente</span>
                    {isRowSaving && activeSave === "ausente" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-current" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>Ausente</TooltipContent>
              </Tooltip>
            </>
          )}

          {canOpenHistory && (
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryOpen(true)}
                  disabled={historyQuery.isLoading && historyOpen}
                  className="h-8 w-8 rounded-full cursor-pointer border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Histórico</span>
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Histórico</TooltipContent>
            </Tooltip>
          )}
        </div>

        <FrequenciaConfirmModal
          isOpen={confirmOpen}
          onOpenChange={setConfirmOpen}
          currentStatus={item.statusAtual}
          pendingStatus={pendingStatus}
          isOverrideFlow={isOverrideFlow}
          pendingMotivo={pendingMotivo}
          onChangeMotivo={setPendingMotivo}
          confirmDisabled={
            !pendingStatus ||
            (pendingStatus === "AUSENTE" && motivoNormalized.length === 0)
          }
          isSaving={isRowSaving}
          onConfirm={handleConfirm}
        />

        <FrequenciaHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          alunoNome={item.alunoNome}
          aulaNome={aulaNome ?? null}
          history={historyItems}
          isLoading={historyQuery.isLoading || historyQuery.isFetching}
        />
      </TableCell>
    </TableRow>
  );
}
