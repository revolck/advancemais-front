"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { EstagioFrequencia } from "@/api/cursos";
import {
  CalendarDays,
  CheckCircle2,
  History,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ActionStatus = "PRESENTE" | "AUSENTE";

export interface EstagioAttendanceDateGroup {
  date: string;
  items: EstagioFrequencia[];
}

interface EstagioAttendanceByDateProps {
  groups: EstagioAttendanceDateGroup[];
  isLoading?: boolean;
  hideAlunoColumn?: boolean;
  renderAlunoCell?: (item: EstagioFrequencia) => ReactNode;
  renderGrupoCell?: (item: EstagioFrequencia) => ReactNode;
  renderPeriodoHorarioCell?: (item: EstagioFrequencia) => ReactNode;
  renderGroupHeaderRight?: (group: EstagioAttendanceDateGroup) => ReactNode;
  renderGroupFooter?: (group: EstagioAttendanceDateGroup) => ReactNode;
  onMarkStatus: (item: EstagioFrequencia, status: ActionStatus) => void;
  onOpenHistory: (item: EstagioFrequencia) => void;
  isSavingRow: (item: EstagioFrequencia) => boolean;
  activeSavingStatus: (item: EstagioFrequencia) => ActionStatus | null;
  formatDate: (value?: string | null) => string;
  formatStatus: (
    status?: string | null
  ) => {
    label: string;
    className: string;
  };
}

export function EstagioAttendanceByDate({
  groups,
  isLoading = false,
  hideAlunoColumn = false,
  renderAlunoCell,
  renderGrupoCell,
  renderPeriodoHorarioCell,
  renderGroupHeaderRight,
  renderGroupFooter,
  onMarkStatus,
  onOpenHistory,
  isSavingRow,
  activeSavingStatus,
  formatDate,
  formatStatus,
}: EstagioAttendanceByDateProps) {
  if (isLoading) {
    return (
      <div className="min-w-0 space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`skeleton-group-${idx}`}
            className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white"
          >
            <div className="border-b border-gray-100 px-3 py-2.5">
              <Skeleton className="h-5 w-44" />
            </div>
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((__, rowIdx) => (
                <Skeleton key={`row-${idx}-${rowIdx}`} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
        Nenhum registro de frequência encontrado para o período selecionado.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      {groups.map((group) => (
        <section
          key={group.date}
          className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white"
        >
          <header className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
                <CalendarDays className="h-4 w-4" />
              </span>
              <h3 className="text-sm! font-semibold! text-gray-800! mb-0!">
                {formatDate(group.date)}
              </h3>
            </div>
            {renderGroupHeaderRight ? (
              renderGroupHeaderRight(group)
            ) : (
              <Badge
                variant="outline"
                className="text-xs! font-medium! text-gray-600! border-gray-200!"
              >
                {group.items.length} aluno{group.items.length === 1 ? "" : "s"}
              </Badge>
            )}
          </header>

          <Table className={cn(hideAlunoColumn ? "min-w-[860px]" : "min-w-[960px]")}>
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  {!hideAlunoColumn && (
                    <TableHead className="py-3 px-3 font-medium text-gray-700">
                      Aluno
                    </TableHead>
                  )}
                  <TableHead className="py-3 px-3 font-medium text-gray-700">
                    Grupo
                  </TableHead>
                  <TableHead className="py-3 px-3 font-medium text-gray-700">
                    Período/Horário
                  </TableHead>
                  <TableHead className="py-3 px-3 font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="py-3 px-3 font-medium text-gray-700 w-[280px]">
                    Motivo
                  </TableHead>
                  <TableHead className="py-3 px-3 font-medium text-gray-700 text-right">
                    Frequência
                  </TableHead>
                  <TableHead className="py-3 px-3 font-medium text-gray-700 text-center">
                    Atualizado em
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={hideAlunoColumn ? 6 : 7}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      Nenhum aluno encontrado para esta data.
                    </TableCell>
                  </TableRow>
                ) : (
                  group.items.map((item) => {
                    const isPresent = item.status === "PRESENTE";
                    const isAbsent = item.status === "AUSENTE";
                    const badge = formatStatus(item.status);
                    const savingRow = isSavingRow(item);
                    const savingStatus = activeSavingStatus(item);

                    return (
                      <TableRow
                        key={`${item.estagioAlunoId}-${item.dataReferencia}`}
                        className="border-gray-100 bg-white transition-colors hover:bg-blue-50/40"
                      >
                        {!hideAlunoColumn && (
                          <TableCell className="py-3 px-3">
                            {renderAlunoCell ? (
                              renderAlunoCell(item)
                            ) : (
                              <div className="min-w-0">
                                <span className="block truncate text-sm! font-medium! text-gray-900!">
                                  {item.alunoNome}
                                </span>
                                <span className="mt-1 block truncate text-xs text-gray-500">
                                  {item.codigoInscricao || item.inscricaoId || "Sem código"}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        )}

                        <TableCell className="py-3 px-3 text-sm text-gray-700">
                          {renderGrupoCell ? (
                            renderGrupoCell(item)
                          ) : (
                            <span>{item.grupoNome || "—"}</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-3 text-sm text-gray-700">
                          {renderPeriodoHorarioCell ? (
                            renderPeriodoHorarioCell(item)
                          ) : (
                            <div className="min-w-0">
                              <span className="block text-sm! font-medium! text-gray-900!">
                                {formatDate(item.dataReferencia)}
                              </span>
                              <span className="mt-1 block text-xs text-gray-500">
                                Sem horário
                              </span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={cn("border text-xs font-medium", badge.className)}
                          >
                            {badge.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3 px-3 text-sm text-gray-700">
                          {item.motivo?.trim() ? (
                            <span className="block text-sm! font-medium! text-gray-900! break-words leading-snug line-clamp-2">
                              {item.motivo}
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onMarkStatus(item, "PRESENTE")}
                                  disabled={savingRow}
                                  className={cn(
                                    "h-8 w-8 rounded-full cursor-pointer border transition-all",
                                    isPresent
                                      ? "text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:text-white hover:border-emerald-700"
                                      : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:text-white hover:bg-emerald-600 hover:border-emerald-600",
                                    isPresent && "ring-2 ring-emerald-200 ring-offset-1",
                                    savingRow &&
                                      "opacity-50 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                  )}
                                >
                                  <span className="sr-only">Marcar como presente</span>
                                  {savingStatus === "PRESENTE" ? (
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
                                  onClick={() => onMarkStatus(item, "AUSENTE")}
                                  disabled={savingRow}
                                  className={cn(
                                    "h-8 w-8 rounded-full cursor-pointer border transition-all",
                                    isAbsent
                                      ? "text-white bg-red-600 border-red-600 hover:bg-red-700 hover:text-white hover:border-red-700"
                                      : "text-red-600 bg-red-50 border-red-200 hover:text-white hover:bg-red-600 hover:border-red-600",
                                    isAbsent && "ring-2 ring-red-200 ring-offset-1",
                                    savingRow &&
                                      "opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  )}
                                >
                                  <span className="sr-only">Marcar como ausente</span>
                                  {savingStatus === "AUSENTE" ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={8}>Ausente</TooltipContent>
                            </Tooltip>

                            <Tooltip disableHoverableContent>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onOpenHistory(item)}
                                  disabled={savingRow}
                                  className="h-8 w-8 rounded-full cursor-pointer border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed"
                                >
                                  <span className="sr-only">Histórico</span>
                                  <History className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={8}>Histórico</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-3 text-center text-sm text-gray-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {formatDate(item.atualizadoEm || item.criadoEm)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

          {renderGroupFooter ? (
            <footer className="border-t border-gray-100 bg-gray-50/40 px-4 py-3">
              {renderGroupFooter(group)}
            </footer>
          ) : null}
        </section>
      ))}
    </div>
  );
}
