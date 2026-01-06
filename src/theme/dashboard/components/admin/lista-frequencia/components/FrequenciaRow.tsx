"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
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
import { AlunoCell } from "./AlunoCell";

// TODO: Implementar API de histórico de frequência
// Por enquanto, histórico está desabilitado até a API implementar
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
  canEdit: boolean;
  canOverride: boolean;
  aula: AulaSelectItem;
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

export function FrequenciaRow({
  item,
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

  // TODO: Implementar busca de histórico via API
  // Por enquanto, histórico está vazio até a API implementar GET frequencias/:id/historico
  const historyItems: FrequenciaHistoryEntry[] = useMemo(() => {
    return [];
  }, []);

  const openConfirm = (nextStatus: FrequenciaStatus) => {
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
    }
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 bg-white transition-colors",
        isSaving ? "opacity-80" : "hover:bg-blue-50/40"
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
        <EvidenceCell aula={aula} item={item} />
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
          {historyItems.length > 0 && (
            <ButtonCustom
              variant="outline"
              size="sm"
              icon="History"
              onClick={() => setHistoryOpen(true)}
            >
              Histórico
            </ButtonCustom>
          )}

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
                    disabled={!canEdit || isSaving}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer border transition-all",
                      isPresent
                        ? "text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700"
                        : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:text-white hover:bg-emerald-600 hover:border-emerald-600",
                      (!canEdit || isSaving) &&
                        "opacity-50 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                    )}
                  >
                    <span className="sr-only">Marcar como presente</span>
                    {isSaving && activeSave === "presente" ? (
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
                    disabled={!canEdit || isSaving}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer border transition-all",
                      isAbsent
                        ? "text-white bg-red-600 border-red-600 hover:bg-red-700 hover:text-white hover:border-red-700"
                        : "text-red-600 bg-red-50 border-red-200 hover:text-white hover:bg-red-600 hover:border-red-600",
                      (!canEdit || isSaving) &&
                        "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    )}
                  >
                    <span className="sr-only">Marcar como ausente</span>
                    {isSaving && activeSave === "ausente" ? (
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
          isSaving={isSaving}
          onConfirm={handleConfirm}
        />

        <FrequenciaHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          alunoNome={item.alunoNome}
          aulaNome={aulaNome ?? null}
          history={historyItems}
        />
      </TableCell>
    </TableRow>
  );
}
