"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AvatarCustom, ButtonCustom, toastCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { cn } from "@/lib/utils";
import type { NotaListItem } from "../hooks/useNotasDashboardQuery";
import { NotaHistoryModal } from "./NotaHistoryModal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Info,
  Loader2,
} from "lucide-react";

interface NotaRowProps {
  item: NotaListItem;
  cursoNome?: string;
  turmaNome?: string;
  isRemoving?: boolean;
  onRemove?: () => Promise<void> | void;
  showActionsColumn?: boolean;
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

function formatCpf(value?: string | null) {
  if (!value) return "CPF não informado";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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
  cursoNome,
  turmaNome,
  isRemoving = false,
  onRemove,
  showActionsColumn = true,
}: NotaRowProps) {
  const router = useRouter();
  const situacao = useMemo(() => getSituacao(item.nota), [item.nota]);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const canRemove = item.isManual === true;
  const hasHistory = (item.history?.length ?? 0) > 0;
  const codigoExibicao = item.codigoMatricula || item.alunoCodigo;
  const cursoNomeExibicao = cursoNome || item.cursoNome || item.cursoId || "—";
  const turmaNomeExibicao = turmaNome || item.turmaNome || item.turmaId || "—";
  const cursoCodigoExibicao = item.cursoCodigo;
  const turmaCodigoExibicao = item.turmaCodigo;

  const handleConfirmRemove = async () => {
    if (!onRemove) return;
    try {
      await Promise.resolve(onRemove());
      toastCustom.success("Nota removida.");
      setIsConfirmRemoveOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Não foi possível remover a nota.";
      toastCustom.error(msg);
    }
  };

  const handleNavigateAluno = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.push(
      `/dashboard/cursos/alunos/${encodeURIComponent(item.alunoId)}?tab=notas`
    );
  };

  return (
    <>
      <TableRow
        className={cn("border-gray-100 transition-colors hover:bg-gray-50/50")}
      >
      <TableCell className="py-4 px-3">
        <div className="flex items-center gap-3">
          <AvatarCustom
            name={item.alunoNome}
            src={item.alunoAvatarUrl || undefined}
            size="sm"
            showStatus={false}
          />
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <div className="max-w-[240px] truncate text-sm font-medium text-gray-900">
                {item.alunoNome}
              </div>
              {codigoExibicao && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {codigoExibicao}
                </code>
              )}
            </div>
            <div className="max-w-[320px] truncate font-mono text-xs text-gray-500">
              {formatCpf(item.alunoCpf)}
            </div>
          </div>
        </div>
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
              {cursoCodigoExibicao && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {cursoCodigoExibicao}
                </code>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-gray-500">Turma</span>
              <span className="min-w-0 truncate text-sm text-gray-700">
                {turmaNomeExibicao}
              </span>
              {turmaCodigoExibicao && (
                <code className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
                  {turmaCodigoExibicao}
                </code>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            {formatNota(item.nota)}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", situacao.className)}
          >
            {situacao.label}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="py-4 px-3 text-center whitespace-nowrap">
        <div className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700">{formatDate(item.atualizadoEm)}</span>
          <span className="text-gray-300">|</span>
          {(item.origem || item.motivo) ? (
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
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-300">
              <Info className="h-4 w-4" />
            </span>
          )}
        </div>
      </TableCell>

      {showActionsColumn ? (
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
                onClick={() => setIsConfirmRemoveOpen(true)}
              >
                Remover
              </ButtonCustom>
            )}
          </div>
        </TableCell>
      ) : null}

      <TableCell className="text-right w-16 py-4 px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigateAluno}
              disabled={isNavigating}
              className={cn(
                "h-8 w-8 rounded-full cursor-pointer",
                isNavigating
                  ? "text-blue-600 bg-blue-100"
                  : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                "disabled:opacity-50 disabled:cursor-wait"
              )}
              aria-label="Visualizar aluno"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>
            {isNavigating ? "Carregando..." : "Visualizar aluno"}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      </TableRow>

      <NotaHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        alunoNome={item.alunoNome}
        turmaNome={turmaNome}
        history={item.history ?? []}
      />

      <ModalCustom
        isOpen={isConfirmRemoveOpen}
        onClose={() => setIsConfirmRemoveOpen(false)}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Remover nota</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-700">
              Tem certeza que deseja remover a nota manual de{" "}
              <strong>{item.alunoNome}</strong>?
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Essa ação não pode ser desfeita.
            </p>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full justify-end gap-2">
              <ButtonCustom
                variant="outline"
                onClick={() => setIsConfirmRemoveOpen(false)}
                disabled={Boolean(isRemoving)}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="danger"
                icon="Trash2"
                onClick={handleConfirmRemove}
                isLoading={isRemoving}
                disabled={!onRemove || isRemoving}
              >
                Confirmar remoção
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </>
  );
}
