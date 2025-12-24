"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ButtonCustom, InputCustom, SelectCustom, toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/components/ui/custom/select/types";
import type { FrequenciaListItem } from "../hooks/useFrequenciaDashboardQuery";
import type { FrequenciaStatus } from "@/mockData/frequencia";

interface FrequenciaRowProps {
  item: FrequenciaListItem;
  canEdit: boolean;
  blockedMessage?: string;
  isSaving?: boolean;
  onSave: (status: FrequenciaStatus, motivo?: string | null) => Promise<void> | void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "PRESENTE", label: "Presente" },
  { value: "FALTA", label: "Falta" },
  { value: "JUSTIFICADA", label: "Justificada" },
];

function badgeForStatus(status: FrequenciaStatus) {
  switch (status) {
    case "PRESENTE":
      return { label: "Presente", className: "bg-green-100 text-green-800 border-green-200" };
    case "FALTA":
      return { label: "Falta", className: "bg-red-100 text-red-800 border-red-200" };
    case "JUSTIFICADA":
      return { label: "Justificada", className: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    case "PENDENTE":
    default:
      return { label: "Pendente", className: "bg-gray-100 text-gray-800 border-gray-200" };
  }
}

function formatEvidence(item: FrequenciaListItem) {
  if (item.evidence?.tempoAoVivoMin != null) {
    return `Ao vivo: ${item.evidence.tempoAoVivoMin} min`;
  }
  if (item.evidence?.ultimoLogin) {
    const d = new Date(item.evidence.ultimoLogin);
    if (!Number.isNaN(d.getTime())) {
      return `Último login: ${d.toLocaleString("pt-BR")}`;
    }
  }
  return "—";
}

export function FrequenciaRow({
  item,
  canEdit,
  blockedMessage,
  isSaving = false,
  onSave,
}: FrequenciaRowProps) {
  const [draftStatus, setDraftStatus] = useState<FrequenciaStatus>(item.statusAtual);
  const [motivo, setMotivo] = useState<string>(item.motivo ?? "");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) return;
    setDraftStatus(item.statusAtual);
    setMotivo(item.motivo ?? "");
  }, [isDirty, item.motivo, item.statusAtual]);

  const statusBadge = useMemo(() => badgeForStatus(item.statusAtual), [item.statusAtual]);
  const sugestaoBadge = useMemo(() => badgeForStatus(item.sugestaoStatus), [item.sugestaoStatus]);

  const canSave = useMemo(() => {
    if (!canEdit) return false;
    if (!isDirty) return false;
    const motivoNormalized = motivo.trim();
    const itemMotivoNormalized = (item.motivo ?? "").trim();
    const changed = draftStatus !== item.statusAtual || motivoNormalized !== itemMotivoNormalized;
    if (!changed) return false;
    if ((draftStatus === "FALTA" || draftStatus === "JUSTIFICADA") && motivoNormalized.length === 0) return false;
    return true;
  }, [canEdit, draftStatus, isDirty, item.motivo, item.statusAtual, motivo]);

  const handleSave = async () => {
    if (!canEdit) {
      toastCustom.warning(blockedMessage ?? "Ação indisponível no momento.");
      return;
    }
    const motivoNormalized = motivo.trim();
    if ((draftStatus === "FALTA" || draftStatus === "JUSTIFICADA") && motivoNormalized.length === 0) {
      toastCustom.error("Informe o motivo.");
      return;
    }
    try {
      const motivoToSend =
        draftStatus === "FALTA" || draftStatus === "JUSTIFICADA"
          ? motivoNormalized || null
          : null;
      await Promise.resolve(onSave(draftStatus, motivoToSend));
      setIsDirty(false);
      toastCustom.success("Frequência salva.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível salvar a frequência.";
      toastCustom.error(msg);
    }
  };

  return (
    <TableRow
      className={cn(
        "border-gray-100 transition-colors",
        isSaving ? "opacity-60 pointer-events-none" : "hover:bg-gray-50/50",
        isDirty && "bg-blue-50/40"
      )}
    >
      <TableCell className="py-4 px-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900 truncate max-w-[360px]">
            {item.alunoNome}
          </div>
          <div className="text-xs text-gray-500 font-mono truncate max-w-[360px]">
            {item.alunoId}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge variant="outline" className={cn("text-xs font-medium", statusBadge.className)}>
          {statusBadge.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge variant="outline" className={cn("text-xs font-medium", sugestaoBadge.className)}>
          {sugestaoBadge.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3">
        <span className="text-sm text-gray-700">{formatEvidence(item)}</span>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectCustom
            options={STATUS_OPTIONS}
            value={draftStatus}
            onChange={(v) => {
              setDraftStatus((v as FrequenciaStatus) || "PENDENTE");
              setIsDirty(true);
            }}
            disabled={!canEdit || isSaving}
          />
          <InputCustom
            value={motivo}
            onChange={(e) => {
              setMotivo((e.target as HTMLInputElement).value);
              setIsDirty(true);
            }}
            placeholder="Motivo (se falta/justificada)"
            disabled={!canEdit || isSaving}
            maxLength={200}
          />
        </div>
      </TableCell>

      <TableCell className="py-4 px-3 text-right">
        <ButtonCustom
          variant="primary"
          size="sm"
          icon="Save"
          isLoading={isSaving}
          disabled={!canSave}
          onClick={handleSave}
        >
          Salvar
        </ButtonCustom>
      </TableCell>
    </TableRow>
  );
}
