"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useTurmasForSelect } from "./hooks/useTurmasForSelect";
import { useNotasDashboardQuery } from "./hooks/useNotasDashboardQuery";
import { useUpdateNotaMutation } from "./hooks/useUpdateNotaMutation";
import { NotaRow } from "./components/NotaRow";
import { NotasTableSkeleton } from "./components/NotasTableSkeleton";
import { CreateNotaModal } from "./components/CreateNotaModal";

const SEARCH_HELPER_TEXT = "Pesquise pelo nome ou código do aluno.";

type SortField = "alunoNome" | "nota" | "atualizadoEm" | null;
type SortDirection = "asc" | "desc";

export function NotasDashboard({ className }: { className?: string }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<string[]>([]);

  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState<SortField>("alunoNome");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { turmas, isLoading: loadingTurmas } = useTurmasForSelect(selectedCourseId);

  useEffect(() => {
    setSelectedTurmaIds([]);
  }, [selectedCourseId]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const normalizedSearch = useMemo(
    () =>
      getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH
      ),
    [appliedSearchTerm]
  );

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;
      const trimmedValue = value.trim();
      setPendingSearchTerm(value);
      setAppliedSearchTerm(trimmedValue);
      setCurrentPage(1);
    },
    [pendingSearchTerm]
  );

  const notasQuery = useNotasDashboardQuery({
    cursoId: selectedCourseId,
    turmaIds: selectedTurmaIds,
    search: normalizedSearch,
    page: currentPage,
    pageSize,
    orderBy: sortField ?? "alunoNome",
    order: sortDirection,
  });

  const notas = useMemo(() => notasQuery.data?.items ?? [], [notasQuery.data]);
  const pagination = notasQuery.data?.pagination;
  const updateNota = useUpdateNotaMutation();

  const hasFiltersSelected = Boolean(
    selectedCourseId && selectedTurmaIds.length > 0
  );
  const isLoadingNotas = notasQuery.status === "pending";
  const isFetchingNotas = notasQuery.isFetching;
  const shouldShowSkeleton =
    hasFiltersSelected && (isLoadingNotas || isFetchingNotas);

  const errorMessage =
    notasQuery.status === "error"
      ? notasQuery.error?.message ?? "Não foi possível carregar as notas."
      : null;

  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const turmaLabelById = useMemo(() => {
    const map = new Map<string, string>();
    turmas.forEach((t) => map.set(t.value, t.label));
    return map;
  }, [turmas]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursos,
        placeholder: loadingCursos ? "Carregando..." : "Selecionar",
        disabled: loadingCursos,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "turmaIds",
        label: "Turmas",
        mode: "multiple" as const,
        options: turmas,
        placeholder: !selectedCourseId
          ? "Selecione um curso"
          : loadingTurmas
          ? "Carregando..."
          : "Selecionar",
        disabled: !selectedCourseId || loadingTurmas,
        emptyPlaceholder: selectedCourseId
          ? "Sem turmas disponíveis"
          : "Selecione um curso primeiro",
      },
    ],
    [cursos, loadingCursos, loadingTurmas, selectedCourseId, turmas]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaIds: selectedTurmaIds,
    }),
    [selectedCourseId, selectedTurmaIds]
  );

  const toggleSort = useCallback((field: SortField) => {
    if (field === null) return;
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
    setCurrentPage(1);
  }, []);

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const safe = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(safe);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const showEmptyState = !shouldShowSkeleton && (!hasFiltersSelected || notas.length === 0);

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Adicionar nota
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
                setCurrentPage(1);
              }
              if (key === "turmaIds") {
                setSelectedTurmaIds(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedCourseId(null);
              setSelectedTurmaIds([]);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar aluno",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por nome ou ID...",
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit((e.target as HTMLInputElement).value);
                }
              },
              error: searchValidationMessage,
              helperText: SEARCH_HELPER_TEXT,
              helperPlacement: "tooltip",
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => handleSearchSubmit()}
                disabled={!isSearchInputValid}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <ButtonCustom size="sm" variant="ghost" onClick={() => notasQuery.refetch()}>
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {!showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead
                    className="font-medium text-gray-700 py-4 px-3"
                    aria-sort={
                      sortField === "alunoNome"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("alunoNome")}
                            className={cn(
                              "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "alunoNome" && "text-gray-900"
                            )}
                          >
                            Aluno
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "alunoNome"
                            ? sortDirection === "asc"
                              ? "A → Z"
                              : "Z → A"
                            : "Ordenar por aluno"}
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar A → Z"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("alunoNome", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "alunoNome" &&
                                    sortDirection === "asc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>A → Z</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar Z → A"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("alunoNome", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "alunoNome" &&
                                    sortDirection === "desc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Z → A</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">Turma</TableHead>
                  <TableHead
                    className="font-medium text-gray-700 py-4 px-3 text-center"
                    aria-sort={
                      sortField === "nota"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("nota")}
                            className={cn(
                              "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "nota" && "text-gray-900"
                            )}
                          >
                            Nota
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "nota"
                            ? sortDirection === "asc"
                              ? "Menor → maior"
                              : "Maior → menor"
                            : "Ordenar por nota"}
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar menor → maior"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("nota", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "nota" &&
                                    sortDirection === "asc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Menor → maior</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar maior → menor"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("nota", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "nota" &&
                                    sortDirection === "desc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Maior → menor</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
	                  <TableHead className="font-medium text-gray-700 py-4 px-3">Situação</TableHead>
                  <TableHead
                    className="font-medium text-gray-700 py-4 px-3 text-center"
                    aria-sort={
                      sortField === "atualizadoEm"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center justify-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("atualizadoEm")}
                            className={cn(
                              "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "atualizadoEm" && "text-gray-900"
                            )}
                          >
                            Atualizado em
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "atualizadoEm"
                            ? sortDirection === "asc"
                              ? "Mais antiga → mais nova"
                              : "Mais nova → mais antiga"
                            : "Ordenar por data"}
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais antiga → mais nova"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("atualizadoEm", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "atualizadoEm" &&
                                    sortDirection === "asc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            Mais antiga → mais nova
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais nova → mais antiga"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("atualizadoEm", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "atualizadoEm" &&
                                    sortDirection === "desc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            Mais nova → mais antiga
                          </TooltipContent>
                        </Tooltip>
	                      </div>
	                    </div>
		                  </TableHead>
		                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-right">
                        <span className="sr-only">Ações</span>
                      </TableHead>
		                </TableRow>
		              </TableHeader>
		              <TableBody>
		                {shouldShowSkeleton ? (
                  <NotasTableSkeleton rows={8} />
                ) : (
		                  notas.map((item) => (
		                    <NotaRow
		                      key={item.key}
		                      item={item}
		                      turmaNome={turmaLabelById.get(item.turmaId) ?? item.turmaId}
                          isRemoving={
                            updateNota.isPending &&
                            updateNota.variables?.alunoId === item.alunoId &&
                            updateNota.variables?.turmaId === item.turmaId &&
                            updateNota.variables?.nota === null
                          }
                          onRemove={() =>
                            updateNota
                              .mutateAsync({
                                cursoId: item.cursoId,
                                turmaId: item.turmaId,
                                alunoId: item.alunoId,
                                nota: null,
                              })
                              .then(() => undefined)
                          }
		                    />
		                  ))
		                )}
		              </TableBody>
		            </Table>

            {totalItems > 0 && (
              <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {(() => {
                      const startIndex =
                        pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
                      const endIndex = pagination
                        ? Math.min(pagination.page * pagination.pageSize, totalItems)
                        : Math.min(pageSize, totalItems);
                      return `Mostrando ${startIndex} a ${endIndex} de ${totalItems} aluno${totalItems === 1 ? "" : "s"}`;
                    })()}
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <ButtonCustom
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Anterior
                    </ButtonCustom>

                    {visiblePages[0] > 1 && (
                      <>
                        <ButtonCustom
                          variant={currentPage === 1 ? "primary" : "outline"}
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
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </ButtonCustom>
                    ))}

                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <ButtonCustom
                          variant={currentPage === totalPages ? "primary" : "outline"}
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Próxima
                    </ButtonCustom>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

	      {showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de notas"
            title={
              hasFiltersSelected
                ? "Nenhuma nota encontrada"
                : "Selecione curso e turma"
            }
            description={
              hasFiltersSelected
                ? "Nenhum aluno encontrado para os filtros aplicados. Tente ajustar sua busca."
                : "Escolha um curso e uma ou mais turmas para listar as notas."
            }
          />
        </div>
	      )}

        <CreateNotaModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultCursoId={selectedCourseId}
          defaultTurmaId={selectedTurmaIds.length === 1 ? selectedTurmaIds[0] : null}
        />
	    </div>
	  );
	}

export default NotasDashboard;
