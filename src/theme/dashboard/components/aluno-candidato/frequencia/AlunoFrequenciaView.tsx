"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { listMinhasFrequencias } from "@/api/cursos";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Video, BookOpen, PlayCircle } from "lucide-react";
import type { DateRange } from "@/components/ui/custom/date-picker";
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
import {
  mapMinhaFrequenciaToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
  type AlunoFrequenciaListItem,
} from "./alunoFrequencia.mapper";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getStatusConfig(status: AlunoFrequenciaListItem["statusAtual"]) {
  switch (status) {
    case "PRESENTE":
      return {
        label: "Presente",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "AUSENTE":
    default:
      return {
        label: "Ausente",
        className: "bg-red-100 text-red-800 border-red-200",
      };
  }
}

type FrequenciaStatusFilter = "PRESENTE" | "AUSENTE" | null;

export function AlunoFrequenciaView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<FrequenciaStatusFilter>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const dataInicio = toApiDate(selectedDateRange.from);
  const dataFim = toApiDate(selectedDateRange.to);

  const {
    data: frequenciasData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "aluno-frequencias-reais",
      selectedCourseId,
      selectedAulaId,
      selectedStatus,
      dataInicio,
      dataFim,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      try {
        const response = await listMinhasFrequencias({
          cursoId: selectedCourseId,
          aulaId: selectedAulaId,
          status: selectedStatus,
          dataInicio,
          dataFim,
          page: currentPage,
          pageSize,
          orderBy: "atualizadoEm",
          order: "desc",
        });
        return {
          items: response.data.items.map(mapMinhaFrequenciaToListItem),
          pagination: response.data.pagination,
          filters: response.data.filters,
        };
      } catch (error) {
        if (shouldShowAlunoDataAsEmptyState(error)) {
          return {
            items: [],
            pagination: {
              page: 1,
              pageSize,
              total: 0,
              totalPages: 1,
            },
            filters: { cursos: [], aulas: [] },
          };
        }
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });

  const cursosUnicos = useMemo(
    () =>
      (frequenciasData?.filters.cursos ?? []).map((curso) => ({
        value: curso.id,
        label: curso.nome,
      })),
    [frequenciasData?.filters.cursos]
  );
  const aulasUnicas = useMemo(
    () =>
      (frequenciasData?.filters.aulas ?? [])
        .filter((aula) => !selectedCourseId || aula.cursoId === selectedCourseId)
        .map((aula) => ({ value: aula.id, label: aula.nome })),
    [frequenciasData?.filters.aulas, selectedCourseId]
  );
  const frequencias = frequenciasData?.items ?? [];
  const pagination = frequenciasData?.pagination;
  const effectivePage = pagination?.page ?? currentPage;
  const totalItems = pagination?.total ?? frequencias.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startIndex = totalItems === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const endIndex = Math.min(effectivePage * pageSize, totalItems);
  const showEmptyState = !isLoading && !isError && frequencias.length === 0;
  const shouldShowFilters = true;

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCourseId,
    selectedAulaId,
    selectedStatus,
    selectedDateRange.from,
    selectedDateRange.to,
  ]);

  // Reset aula quando curso muda
  useEffect(() => {
    setSelectedAulaId(null);
  }, [selectedCourseId]);

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
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

  const statusOptions = useMemo(
    () => [
      { value: "PRESENTE", label: "Presente" },
      { value: "AUSENTE", label: "Ausente" },
    ],
    []
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursosUnicos,
        placeholder: isLoading ? "Carregando..." : "Selecionar",
        disabled: isLoading && cursosUnicos.length === 0,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "aulaId",
        label: "Aula",
        mode: "single" as const,
        options: aulasUnicas,
        placeholder: "Selecionar aula",
        disabled: !selectedCourseId || aulasUnicas.length === 0,
        emptyPlaceholder: "Selecione um curso primeiro",
      },
      {
        key: "status",
        label: "Frequência",
        mode: "single" as const,
        options: statusOptions,
        placeholder: "Selecionar frequência",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, aulasUnicas, isLoading, selectedCourseId, statusOptions]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      aulaId: selectedAulaId,
      status: selectedStatus,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedAulaId, selectedStatus, selectedDateRange]
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Filtros */}
      {shouldShowFilters && (
        <div>
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
              }
              if (key === "aulaId") {
                setSelectedAulaId((value as string) || null);
              }
              if (key === "status") {
                setSelectedStatus((value as FrequenciaStatusFilter) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedAulaId(null);
              setSelectedStatus(null);
              setSelectedDateRange(createEmptyDateRange());
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Aula
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Data
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Evidência
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Motivo
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Frequência
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="border-gray-100 bg-white">
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-52" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {(error as Error)?.message ||
                "Não foi possível carregar suas frequências."}
            </span>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="w-full border-red-200 bg-white text-red-700 hover:bg-red-100 sm:w-auto"
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200/60">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma frequência encontrada"
            description={
              selectedCourseId ||
              selectedAulaId ||
              selectedStatus ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhuma frequência encontrada com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui frequências registradas"
            }
          />
        </div>
      )}

      {/* Lista de Frequências */}
      {!isLoading && !isError && frequencias.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Aula
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Data
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Evidência
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 w-[420px]">
                    Motivo
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-right">
                    Frequência
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequencias.map((freq) => {
                  const statusConfig = getStatusConfig(freq.statusAtual);

                  return (
                    <TableRow
                      key={freq.key}
                      className="border-gray-100 bg-white transition-colors hover:bg-blue-50/40"
                    >
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <PlayCircle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>{freq.aulaNome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Curso
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {freq.cursoNome}
                              </span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Turma
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {freq.turmaNome}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {format(
                              new Date(freq.dataReferencia),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        {freq.evidence?.tempoAoVivoMin ? (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-default">
                                <Video className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {freq.evidence.tempoAoVivoMin} min
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8} className="max-w-sm">
                              <div className="space-y-1 text-xs leading-relaxed">
                                <div>
                                  Você assistiu a aula por{" "}
                                  <b>
                                    {Math.floor(
                                      freq.evidence.tempoAoVivoMin / 60
                                    ) > 0
                                      ? `${Math.floor(
                                          freq.evidence.tempoAoVivoMin / 60
                                        )}h `
                                      : ""}
                                    {freq.evidence.tempoAoVivoMin % 60}min
                                  </b>
                                </div>
                                {freq.evidence.ultimoLogin && (
                                  <div>
                                    Último acesso:{" "}
                                    <b>
                                      {format(
                                        new Date(freq.evidence.ultimoLogin),
                                        "dd/MM/yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </b>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        {freq.justificativa ? (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="cursor-default min-w-0">
                                <div className="text-sm font-medium text-gray-900 break-words leading-snug line-clamp-2 max-w-[400px]">
                                  {freq.justificativa.length > 100
                                    ? `${freq.justificativa.substring(
                                        0,
                                        100
                                      )}...`
                                    : freq.justificativa}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8} className="max-w-lg">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold">
                                  Justificativa
                                </div>
                                <div className="text-xs whitespace-pre-wrap break-words">
                                  {freq.justificativa}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                              statusConfig.className
                            )}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalItems > 0 && (
            <div className="flex flex-col gap-4 px-4 md:px-6 py-4 border-t border-gray-200/60 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                  {startIndex} a {endIndex} de {totalItems}
                </span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
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
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="h-8 px-3"
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
                      variant={effectivePage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 px-3"
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
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-8 px-3"
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
        </div>
      )}
    </div>
  );
}
