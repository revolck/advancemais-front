"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import { getMinhaNotaHistorico, listMinhasNotas } from "@/api/cursos";
import { NotaHistoryModal } from "@/theme/dashboard/components/admin/lista-notas/components/NotaHistoryModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, CalendarDays, History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  mapMinhaNotaToListItem,
  mapMinhasNotasCursosToOptions,
  mapMinhasNotasTurmasToOptions,
  shouldShowNotasAsEmptyState,
  toApiDate,
  type AlunoNotaListItem,
} from "./alunoNotas.mapper";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function getSituacao(nota: number | null) {
  if (nota === null) {
    return {
      label: "Sem nota",
      detail: "Aguardando lançamento",
      tooltip: "Ainda não há nota registrada para esta turma.",
      className: "border-gray-200 bg-gray-100 text-gray-700",
    };
  }
  if (nota >= 7) {
    return {
      label: "Aprovado",
      detail: "Média atingida",
      tooltip: "Nota igual ou acima de 7.",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }
  if (nota >= 5) {
    return {
      label: "Recuperação",
      detail: "Entre 5 e 6,9",
      tooltip: "Nota entre 5 e 6,9.",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  return {
    label: "Reprovado",
    detail: "Abaixo da média",
    tooltip: "Nota abaixo de 5.",
    className: "border-red-200 bg-red-50 text-red-700",
  };
}

function formatNota(nota: number | null): string {
  if (nota === null) return "—";
  if (!Number.isFinite(nota)) return "—";
  return nota.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(nota) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatAtualizacao(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return dateTimeFormatter.format(date);
}

function shouldShowMotivo(motivo?: string | null) {
  const value = motivo?.trim();
  if (!value) return false;
  return (
    value.toLocaleLowerCase("pt-BR") !==
    "nota consolidada automaticamente pelo sistema"
  );
}

type SituacaoFilter = "APROVADO" | "RECUPERACAO" | "REPROVADO" | null;

export function AlunoNotasView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseLabel, setSelectedCourseLabel] = useState<string | null>(
    null,
  );
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedTurmaLabel, setSelectedTurmaLabel] = useState<string | null>(
    null,
  );
  const [selectedSituacao, setSelectedSituacao] =
    useState<SituacaoFilter>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange(),
  );
  const [selectedNotaHistory, setSelectedNotaHistory] =
    useState<AlunoNotaListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const token = useMemo(() => getCookieValue("token"), []);

  // Buscar perfil do usuário logado
  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!token) throw new Error("Token não encontrado");
      return getUserProfile(token);
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });

  const dataInicio = useMemo(
    () => toApiDate(selectedDateRange.from),
    [selectedDateRange.from],
  );
  const dataFim = useMemo(
    () => toApiDate(selectedDateRange.to),
    [selectedDateRange.to],
  );

  const {
    data: notasData,
    isLoading: isLoadingNotas,
    isError: isNotasError,
    error: notasError,
    refetch: refetchNotas,
  } = useQuery({
    queryKey: [
      "aluno-notas-reais",
      selectedCourseId,
      selectedTurmaId,
      selectedSituacao,
      dataInicio,
      dataFim,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      try {
        const response = await listMinhasNotas({
          cursoId: selectedCourseId,
          turmaId: selectedTurmaId,
          situacao: selectedSituacao,
          dataInicio,
          dataFim,
          page: currentPage,
          pageSize,
          orderBy: "atualizadoEm",
          order: "desc",
        });

        return {
          items: (response.data.items ?? []).map(mapMinhaNotaToListItem),
          pagination: response.data.pagination,
          filters: response.data.filters,
        };
      } catch (error) {
        if (shouldShowNotasAsEmptyState(error)) {
          return {
            items: [],
            pagination: {
              page: 1,
              requestedPage: currentPage,
              pageSize,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
              isPageAdjusted: false,
            },
            filters: {
              cursos: [],
            },
          };
        }

        throw error;
      }
    },
    staleTime: 60 * 1000,
  });

  const cursosUnicos = useMemo(
    () => mapMinhasNotasCursosToOptions(notasData?.filters.cursos ?? []),
    [notasData?.filters.cursos],
  );

  const turmasUnicas = useMemo(
    () =>
      mapMinhasNotasTurmasToOptions(
        notasData?.filters.cursos ?? [],
        selectedCourseId,
      ),
    [notasData?.filters.cursos, selectedCourseId],
  );

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourseLabel(null);
      return;
    }

    const selectedOption = cursosUnicos.find(
      (curso) => curso.value === selectedCourseId,
    );
    if (selectedOption?.label) {
      setSelectedCourseLabel(selectedOption.label);
    }
  }, [cursosUnicos, selectedCourseId]);

  useEffect(() => {
    if (!selectedTurmaId) {
      setSelectedTurmaLabel(null);
      return;
    }

    const selectedOption = turmasUnicas.find(
      (turma) => turma.value === selectedTurmaId,
    );
    if (selectedOption?.label) {
      setSelectedTurmaLabel(selectedOption.label);
    }
  }, [selectedTurmaId, turmasUnicas]);

  useEffect(() => {
    if (
      selectedTurmaId &&
      turmasUnicas.length > 0 &&
      !turmasUnicas.some((turma) => turma.value === selectedTurmaId)
    ) {
      setSelectedTurmaId(null);
      setSelectedTurmaLabel(null);
    }
  }, [selectedTurmaId, turmasUnicas]);

  const cursoOptions = useMemo(() => {
    if (
      !selectedCourseId ||
      !selectedCourseLabel ||
      cursosUnicos.some((curso) => curso.value === selectedCourseId)
    ) {
      return cursosUnicos;
    }

    return [
      {
        value: selectedCourseId,
        label: selectedCourseLabel,
      },
      ...cursosUnicos,
    ];
  }, [cursosUnicos, selectedCourseId, selectedCourseLabel]);

  const turmaOptions = useMemo(() => {
    if (
      !selectedTurmaId ||
      !selectedTurmaLabel ||
      turmasUnicas.some((turma) => turma.value === selectedTurmaId)
    ) {
      return turmasUnicas;
    }

    return [
      {
        value: selectedTurmaId,
        label: selectedTurmaLabel,
      },
      ...turmasUnicas,
    ];
  }, [selectedTurmaId, selectedTurmaLabel, turmasUnicas]);

  const isLoading = isLoadingNotas;
  const notasFiltradas = notasData?.items ?? [];

  const pagination = notasData?.pagination;
  const effectivePage = pagination?.page ?? currentPage;
  const totalItems = pagination?.total ?? notasFiltradas.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startIndex = totalItems === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const endIndex = Math.min(effectivePage * pageSize, totalItems);
  const notas = notasFiltradas;

  const showEmptyState =
    !isLoading && !isNotasError && notasFiltradas.length === 0;
  const shouldShowFilters = true;

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedTurmaId, selectedSituacao, dataInicio, dataFim]);

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages],
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, effectivePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [effectivePage, totalPages]);

  const situacaoOptions = useMemo(
    () => [
      { value: "APROVADO", label: "Aprovado" },
      { value: "RECUPERACAO", label: "Recuperação" },
      { value: "REPROVADO", label: "Reprovado" },
    ],
    [],
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursoOptions,
        placeholder: isLoadingNotas ? "Carregando…" : "Selecionar",
        disabled: isLoadingNotas && cursoOptions.length === 0,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "turmaId",
        label: "Turma",
        mode: "single" as const,
        options: turmaOptions,
        placeholder: isLoadingNotas ? "Carregando…" : "Selecionar turma",
        disabled: isLoadingNotas && turmaOptions.length === 0,
        emptyPlaceholder: selectedCourseId
          ? "Sem turmas neste curso"
          : "Sem turmas disponíveis",
      },
      {
        key: "situacao",
        label: "Situação",
        mode: "single" as const,
        options: situacaoOptions,
        placeholder: "Selecionar situação",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursoOptions, isLoadingNotas, selectedCourseId, situacaoOptions, turmaOptions],
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaId: selectedTurmaId,
      situacao: selectedSituacao,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedTurmaId, selectedSituacao, selectedDateRange],
  );

  return (
    <div className="space-y-6 pb-8">
      {shouldShowFilters && (
        <FilterBar
          className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_auto]"
          fields={filterFields}
          values={filterValues}
          onChange={(key, value) => {
            if (key === "cursoId") {
              const nextCourseId = (value as string) || null;
              const nextCourseLabel =
                cursoOptions.find((curso) => curso.value === nextCourseId)
                  ?.label ?? null;
              setSelectedCourseId(nextCourseId);
              setSelectedCourseLabel(nextCourseLabel);
              if (nextCourseId !== selectedCourseId) {
                setSelectedTurmaId(null);
                setSelectedTurmaLabel(null);
              }
            }
            if (key === "turmaId") {
              const nextTurmaId = (value as string) || null;
              const nextTurmaLabel =
                turmaOptions.find((turma) => turma.value === nextTurmaId)
                  ?.label ?? null;
              setSelectedTurmaId(nextTurmaId);
              setSelectedTurmaLabel(nextTurmaLabel);
            }
            if (key === "situacao") {
              setSelectedSituacao((value as SituacaoFilter) || null);
            }
            if (key === "periodo") {
              setSelectedDateRange(
                (value as DateRange) || createEmptyDateRange(),
              );
            }
          }}
          onClearAll={() => {
            setSelectedCourseId(null);
            setSelectedCourseLabel(null);
            setSelectedTurmaId(null);
            setSelectedTurmaLabel(null);
            setSelectedSituacao(null);
            setSelectedDateRange(createEmptyDateRange());
          }}
        />
      )}

      {isLoading && (
        <div
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          role="status"
          aria-live="polite"
          aria-label="Carregando notas"
        >
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="px-3 py-4 font-medium text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="px-3 py-4 text-center font-medium text-gray-700">
                    Nota/Situação
                  </TableHead>
                  <TableHead className="px-3 py-4 text-center font-medium text-gray-700">
                    Atualizado em
                  </TableHead>
                  <TableHead className="w-16 px-3 py-4 text-right font-medium text-gray-700">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4].map((item) => (
                  <TableRow
                    key={item}
                    className="border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <TableCell className="px-3 py-4">
                      <div className="flex min-w-0 items-start gap-2">
                        <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
                        <div className="min-w-0 space-y-2">
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-3 w-80" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-4 text-center">
                      <Skeleton className="mx-auto h-6 w-28 rounded-full" />
                    </TableCell>
                    <TableCell className="px-3 py-4 text-center">
                      <Skeleton className="mx-auto h-4 w-32" />
                    </TableCell>
                    <TableCell className="px-3 py-4 text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isNotasError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {notasError?.message || "Não foi possível carregar suas notas."}
            </span>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => refetchNotas()}
              className="w-full border-red-200 bg-white text-red-700 hover:bg-red-100 sm:w-auto"
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {showEmptyState && (
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma nota encontrada"
            description={
              selectedCourseId ||
              selectedTurmaId ||
              selectedSituacao ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhuma nota corresponde aos filtros selecionados."
                : "Suas notas aparecerão aqui quando forem registradas."
            }
          />
        </div>
      )}

      {!isLoading && !isNotasError && notas.length > 0 && (
        <section
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          aria-label="Notas"
        >
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="px-3 py-4 font-medium text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="px-3 py-4 text-center font-medium text-gray-700">
                    Nota/Situação
                  </TableHead>
                  <TableHead className="px-3 py-4 text-center font-medium text-gray-700">
                    Atualizado em
                  </TableHead>
                  <TableHead className="w-16 px-3 py-4 text-right font-medium text-gray-700">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notas.map((nota) => {
                  const situacao = getSituacao(nota.nota);
                  const showMotivo = shouldShowMotivo(nota.motivo);
                  const hasHistory =
                    nota.nota !== null &&
                    (Boolean(nota.historicoNotaId || nota.notaId) ||
                      (nota.history?.length ?? 0) > 0);

                  return (
                    <TableRow
                      key={nota.key}
                      className="border-gray-100 transition-colors hover:bg-gray-50/50"
                    >
                      <TableCell className="px-3 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Curso
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {nota.cursoNome}
                              </span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Turma
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {nota.turmaNome}
                              </span>
                            </div>
                            {showMotivo && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="mb-0! line-clamp-1 max-w-[520px] cursor-help text-xs! text-gray-500!">
                                    {nota.motivo}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent
                                  sideOffset={8}
                                  className="max-w-sm text-xs"
                                >
                                  {nota.motivo}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-3 py-4 text-center">
                        <div className="inline-flex min-w-[150px] flex-col items-center gap-1">
                          <span className="inline-flex items-baseline gap-1 text-sm! font-medium! text-gray-900!">
                            <strong className="text-3xl! leading-none! font-semibold! tabular-nums text-gray-950!">
                              {formatNota(nota.nota)}
                            </strong>
                            {nota.nota !== null ? (
                              <span className="text-sm! font-normal! text-gray-500!">
                                /10
                              </span>
                            ) : null}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex cursor-help flex-col items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "h-5 rounded px-1.5 text-[11px]! leading-none! font-medium!",
                                    situacao.className,
                                  )}
                                >
                                  {situacao.label}
                                </Badge>
                                <span className="text-[11px]! leading-none! text-gray-500!">
                                  {situacao.detail}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              {situacao.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="inline-flex items-center gap-2 text-sm! text-gray-700!">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {formatAtualizacao(nota.atualizadoEm)}
                        </span>
                      </TableCell>

                      <TableCell className="w-16 px-3 py-4 text-right">
                        {hasHistory ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ButtonCustom
                                type="button"
                                variant="ghost"
                                size="icon"
                                withAnimation={false}
                                aria-label={`Ver histórico de ${nota.cursoNome}`}
                                onClick={() => setSelectedNotaHistory(nota)}
                                className="h-8 w-8 cursor-pointer rounded-full bg-transparent text-gray-500 hover:bg-[var(--primary-color)] hover:text-white"
                              >
                                <History
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </ButtonCustom>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8}>
                              Histórico
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalItems > 0 && (
            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {startIndex} a {endIndex} de {totalItems} nota
                  {totalItems === 1 ? "" : "s"}
                </span>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(effectivePage - 1)}
                    disabled={effectivePage === 1}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages[0] > 1 && (
                    <>
                      <ButtonCustom
                        variant={effectivePage === 1 ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="h-8 w-8 p-0"
                      >
                        1
                      </ButtonCustom>
                      {visiblePages[0] > 2 && (
                        <span className="text-gray-400">...</span>
                      )}
                    </>
                  )}

                  {visiblePages.map((page) => (
                    <ButtonCustom
                      key={page}
                      variant={effectivePage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  {visiblePages[visiblePages.length - 1] < totalPages && (
                    <>
                      {visiblePages[visiblePages.length - 1] <
                        totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          effectivePage === totalPages ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-8 w-8 p-0"
                      >
                        {totalPages}
                      </ButtonCustom>
                    </>
                  )}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(effectivePage + 1)}
                    disabled={effectivePage === totalPages}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Modal de Histórico */}
      {selectedNotaHistory && (
        <NotaHistoryModal
          isOpen={true}
          onClose={() => setSelectedNotaHistory(null)}
          alunoNome={
            profileResponse && "usuario" in profileResponse
              ? profileResponse.usuario.nomeCompleto
              : "Aluno"
          }
          turmaNome={selectedNotaHistory.turmaNome}
          cursoId={selectedNotaHistory.cursoId}
          turmaId={selectedNotaHistory.turmaId}
          historicoNotaId={
            selectedNotaHistory.historicoNotaId ?? selectedNotaHistory.notaId
          }
          fallbackHistory={selectedNotaHistory.history ?? []}
          notaAtual={selectedNotaHistory.nota}
          fetchHistory={getMinhaNotaHistorico}
        />
      )}
    </div>
  );
}
