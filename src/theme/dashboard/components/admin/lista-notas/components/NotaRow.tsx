"use client";

import React, { useMemo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom, toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { NotaListItem } from "../hooks/useNotasDashboardQuery";
import { NotaHistoryModal } from "./NotaHistoryModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface NotaRowProps {
  item: NotaListItem;
  turmaNome: string;
  isRemoving?: boolean;
  onRemove?: () => Promise<void> | void;
}

function getSituacao(nota: number | null) {
  if (nota === null) {
    return {
      label: "Sem nota",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };
  }
  if (nota >= 7) {
    return {
      label: "Aprovado",
      className: "bg-green-100 text-green-800 border-green-200",
    };
  }
  if (nota >= 5) {
    return {
      label: "Recuperação",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
  }
  return {
    label: "Reprovado",
    className: "bg-red-100 text-red-800 border-red-200",
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

function getOrigemLabel(tipo: string) {
  if (tipo === "AULA") return "Aula";
  if (tipo === "PROVA") return "Prova";
  if (tipo === "ATIVIDADE") return "Atividade";
  return tipo;
}

export function NotaRow({
  item,
  turmaNome,
  isRemoving = false,
  onRemove,
}: NotaRowProps) {
  const situacao = useMemo(() => getSituacao(item.nota), [item.nota]);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const canRemove = item.isManual;
  const hasHistory = (item.history?.length ?? 0) > 0;

  return (
    <>
      <TableRow
        className={cn("border-gray-100 transition-colors hover:bg-gray-50/50")}
      >
      <TableCell className="py-4 px-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900 truncate max-w-[320px]">
            {item.alunoNome}
          </div>
          <div className="text-xs text-gray-500 font-mono truncate max-w-[320px]">
            {item.alunoId}
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm text-gray-700 truncate max-w-[260px]">
            {turmaNome || item.turmaId}
          </div>
          {(item.origem || item.motivo) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  aria-label="Ver contexto da nota"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-sm text-xs leading-relaxed"
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-semibold">Origem</div>
                    {item.origem ? (
                      <div className="text-gray-100/90">
                        {getOrigemLabel(item.origem.tipo)}
                        {item.origem.titulo
                          ? ` • ${item.origem.titulo}`
                          : item.origem.id
                          ? ` • ${item.origem.id}`
                          : ""}
                      </div>
                    ) : (
                      <div className="text-gray-100/80">—</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">Motivo</div>
                    <div className="text-gray-100/90">
                      {item.motivo?.trim() ? item.motivo : "—"}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4 px-3 text-center">
        <span className="text-sm font-medium text-gray-900">
          {formatNota(item.nota)}
        </span>
      </TableCell>

      <TableCell className="py-4 px-3">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", situacao.className)}
        >
          {situacao.label}
        </Badge>
      </TableCell>

      <TableCell className="py-4 px-3 text-center whitespace-nowrap">
        <span className="text-sm text-gray-700">{formatDate(item.atualizadoEm)}</span>
      </TableCell>

      <TableCell className="py-4 px-3">
        <div className="flex items-center justify-end gap-2">
          {hasHistory && (
            <ButtonCustom
              variant="outline"
              size="sm"
              icon="History"
              onClick={() => setIsHistoryOpen(true)}
            >
              Histórico
            </ButtonCustom>
          )}
          {canRemove && (
            <ButtonCustom
              variant="outline"
              size="sm"
              icon="Trash2"
              isLoading={isRemoving}
              disabled={!onRemove || isRemoving}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-200"
              onClick={async () => {
                if (!onRemove) return;
                try {
                  await Promise.resolve(onRemove());
                  toastCustom.success("Nota removida.");
                } catch (err) {
                  const msg =
                    err instanceof Error ? err.message : "Não foi possível remover a nota.";
                  toastCustom.error(msg);
                }
              }}
            >
              Remover
            </ButtonCustom>
          )}
          {!hasHistory && !canRemove && (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </TableCell>
      </TableRow>

      <NotaHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        alunoNome={item.alunoNome}
        turmaNome={turmaNome}
        history={item.history ?? []}
      />
    </>
  );
}
