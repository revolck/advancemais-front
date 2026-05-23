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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  mapMinhaNotaToListItem,
  mapMinhasNotasCursosToOptions,
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
      className: "bg-gray-100 text-gray-800 border-gray-200",
      color: "text-gray-600",
    };
  }
  if (nota >= 7) {
    return {
      label: "Aprovado",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      color: "text-emerald-600",
    };
  }
  if (nota >= 5) {
    return {
      label: "Recuperação",
      className: "bg-red-100 text-red-800 border-red-200",
      color: "text-red-600",
    };
  }
  return {
    label: "Reprovado",
    className: "bg-red-100 text-red-800 border-red-200",
    color: "text-red-600",
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

type SituacaoFilter = "APROVADO" | "RECUPERACAO" | "REPROVADO" | null;

export function AlunoNotasView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSituacao, setSelectedSituacao] =
    useState<SituacaoFilter>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [selectedNotaHistory, setSelectedNotaHistory] =
    useState<AlunoNotaListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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
    [selectedDateRange.from]
  );
  const dataFim = useMemo(
    () => toApiDate(selectedDateRange.to),
    [selectedDateRange.to]
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
    [notasData?.filters.cursos]
  );

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
  const shouldShowFilters =
    isLoading ||
    cursosUnicos.length > 0 ||
    Boolean(selectedCourseId || selectedSituacao || dataInicio || dataFim);

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedSituacao, dataInicio, dataFim]);

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

  const situacaoOptions = useMemo(
    () => [
      { value: "APROVADO", label: "Aprovado" },
      { value: "RECUPERACAO", label: "Recuperação" },
      { value: "REPROVADO", label: "Reprovado" },
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
        placeholder: isLoadingNotas ? "Carregando..." : "Selecionar",
        disabled: isLoadingNotas && cursosUnicos.length === 0,
        emptyPlaceholder: "Sem cursos disponíveis",
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
    [cursosUnicos, isLoadingNotas, situacaoOptions]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      situacao: selectedSituacao,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedSituacao, selectedDateRange]
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Filtros */}
      {shouldShowFilters && (
        <div>
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
              }
              if (key === "situacao") {
                setSelectedSituacao((value as SituacaoFilter) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedSituacao(null);
              setSelectedDateRange(createEmptyDateRange());
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}

      {isNotasError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
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

      {/* Empty State */}
      {showEmptyState && (
        <div className="rounded-xl bg-white p-8 border border-gray-200/60">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma nota encontrada"
            description={
              selectedCourseId ||
              selectedSituacao ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhuma nota encontrada com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui notas registradas"
            }
          />
        </div>
      )}

      {/* Lista de Notas */}
      {!isLoading && !isNotasError && notas.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="divide-y divide-gray-200/60">
            {notas.map((nota) => {
              const situacao = getSituacao(nota.nota);
              const hasHistory =
                Boolean(nota.historicoNotaId || nota.notaId) ||
                (nota.history?.length ?? 0) > 0;

              return (
                <div
                  key={nota.key}
                  className="p-5 md:p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    {/* Nota - Destaque */}
                    <div className="flex items-center gap-4 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl cursor-help",
                              situacao.className
                                .replace("text-", "bg-")
                                .replace("-800", "-100"),
                              situacao.color
                            )}
                          >
                            {formatNota(nota.nota)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          Nota: {formatNota(nota.nota)} / 10
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Informações Principais */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Curso e Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="mb-0!">{nota.cursoNome}</h5>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium shrink-0",
                                situacao.className
                              )}
                            >
                              {situacao.label}
                            </Badge>
                          </div>

                          {/* Informações da Turma */}
                          <div className="mt-1 mb-0 flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                {nota.turmaNome}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data de Atualização */}
                      <div className="mt-[-5px] flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>
                          Atualizado em{" "}
                          <span className="font-medium text-gray-600">
                            {format(
                              new Date(nota.atualizadoEm),
                              "dd 'de' MMMM 'de' yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="shrink-0 lg:ml-auto">
                      {hasHistory && (
                        <ButtonCustom
                          variant="outline"
                          size="sm"
                          icon="History"
                          onClick={() => setSelectedNotaHistory(nota)}
                          className="w-full lg:w-auto"
                        >
                          Histórico
                        </ButtonCustom>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginação */}
          {totalItems > 0 && (
            <div className="flex flex-col gap-4 px-4 md:px-6 py-4 border-t border-gray-200/60 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {startIndex} a {endIndex} de {totalItems}
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
        </div>
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
