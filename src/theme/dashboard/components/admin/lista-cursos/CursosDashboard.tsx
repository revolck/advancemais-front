"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { useCursosDashboardQuery } from "./hooks/useCursosDashboardQuery";
import { useCursoCategorias } from "./hooks/useCursoCategorias";
import {
  useCursoSubcategorias,
  useAllSubcategorias,
} from "./hooks/useCursoSubcategorias";
import type { CursosDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { Curso } from "@/api/cursos";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { CursoRow } from "./components/CursoRow";
import { CursoTableSkeleton } from "./components/CursoTableSkeleton";

// STATUS_FILTER_OPTIONS será populado dinamicamente com filters.summary.statusPadrao

const SEARCH_HELPER_TEXT = "Pesquise por nome ou código do curso.";

export function CursosDashboard({
  className,
  cursos: cursosProp,
  fetchFromApi = true,
  itemsPerPage: _itemsPerPage,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: CursosDashboardProps) {
  const defaultPageSize = pageSizeProp ?? 10;
  const shouldFetch = fetchFromApi && !cursosProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    null
  );
  // Estado para controlar inicialização dos filtros (deve estar com os outros useState)
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Sorting - todos os useState devem estar no topo
  type SortField = "nome" | "criadoEm" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;
  const searchHelperText = SEARCH_HELPER_TEXT;

  const normalizedSearch = useMemo(
    () =>
      getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH
      ),
    [appliedSearchTerm]
  );

  const { categoriaNameById, categoriaOptions } = useCursoCategorias();
  const {
    subcategoriaOptions,
    isLoading: isLoadingSubcategorias,
  } = useCursoSubcategorias(
    selectedCategoryId ? Number(selectedCategoryId) : null
  );
  const { subcategoriaNameById } = useAllSubcategorias();

  useEffect(() => {
    setSelectedSubcategoryId(null);
  }, [selectedCategoryId]);

  const normalizedFilters = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      statuses: selectedStatuses,
      search: normalizedSearch,
      categoriaId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
      subcategoriaId: selectedSubcategoryId ? Number(selectedSubcategoryId) : undefined,
    }),
    [currentPage, pageSize, selectedStatuses, normalizedSearch, selectedCategoryId, selectedSubcategoryId]
  );

  const {
    data: queryData,
    error: queryError,
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useCursosDashboardQuery(normalizedFilters, shouldFetch);

  useEffect(() => {
    if (!shouldFetch && cursosProp) {
      onDataLoaded?.(cursosProp, null);
    }
  }, [shouldFetch, cursosProp, onDataLoaded]);

  useEffect(() => {
    if (shouldFetch && queryData) {
      onDataLoaded?.(queryData.cursos, queryData.pagination);
    }
  }, [shouldFetch, queryData, onDataLoaded]);

  useEffect(() => {
    if (shouldFetch && queryError && onError) {
      onError(queryError.message || "Erro ao carregar cursos");
    }
  }, [shouldFetch, queryError, onError]);

  // Sincroniza paginação quando isPageAdjusted for true
  useEffect(() => {
    if (!shouldFetch || !queryData?.pagination) return;
    const { pagination } = queryData;
    
    // Se a página foi ajustada pelo servidor, reposiciona a UI
    if (pagination.isPageAdjusted && pagination.page !== currentPage) {
      setCurrentPage(pagination.page);
    }
  }, [shouldFetch, queryData?.pagination?.isPageAdjusted, queryData?.pagination?.page, currentPage]);

  useEffect(() => {
    if (!shouldFetch) return;
    const serverPageSize = queryData?.pagination.pageSize;
    if (serverPageSize && serverPageSize !== pageSize) {
      setPageSize(serverPageSize);
    }
  }, [shouldFetch, queryData?.pagination.pageSize, pageSize]);

  // Persiste estado dos filtros a partir de filters.applied (apenas na primeira carga)
  useEffect(() => {
    if (!shouldFetch || !queryData?.filters?.applied || filtersInitialized) return;

    const applied = queryData.filters.applied;
    
    // Restaura search
    if (applied.search) {
      setAppliedSearchTerm(applied.search);
      setPendingSearchTerm(applied.search);
    }
    
    // Restaura status a partir de filters.applied.statusPadrao
    if (applied.statusPadrao && Array.isArray(applied.statusPadrao) && applied.statusPadrao.length > 0) {
      setSelectedStatuses(applied.statusPadrao);
    }
    
    // Restaura categoria (apenas se não for null/undefined)
    if (applied.categoriaId != null) {
      setSelectedCategoryId(String(applied.categoriaId));
    } else {
      // Se o backend retornou null/undefined, limpa o estado
      setSelectedCategoryId(null);
    }
    
    // Restaura subcategoria (apenas se não for null/undefined)
    if (applied.subcategoriaId != null) {
      setSelectedSubcategoryId(String(applied.subcategoriaId));
    } else {
      // Se o backend retornou null/undefined, limpa o estado
      setSelectedSubcategoryId(null);
    }
    
    setFiltersInitialized(true);
  }, [shouldFetch, queryData?.filters?.applied, filtersInitialized]);

  // Reseta para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedCategoryId, selectedSubcategoryId, normalizedSearch]);

  const fetchedCursos = queryData?.cursos ?? [];
  const remoteTotalPages = Math.max(
    1,
    Math.ceil(fetchedCursos.length / normalizedFilters.pageSize)
  );
  const remotePagination = queryData?.pagination ?? {
    requestedPage: normalizedFilters.page,
    page: normalizedFilters.page,
    isPageAdjusted: false,
    pageSize: normalizedFilters.pageSize,
    total: fetchedCursos.length,
    totalPages: remoteTotalPages,
    hasNext: normalizedFilters.page < remoteTotalPages,
    hasPrevious: normalizedFilters.page > 1,
  };

  const cursos = cursosProp ?? fetchedCursos;

  // Sorting functions
  const setSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const toggleSort = (field: SortField) => {
    if (field === null) return;
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return field;
    });
  };

  // Persist sort
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cursoList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          field: SortField;
          dir: SortDirection;
        };
        if (parsed.field) setSortField(parsed.field);
        if (parsed.dir) setSortDirection(parsed.dir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "cursoList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const sortList = useCallback(
    <T extends (typeof cursos)[number]>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "nome") {
          const aNome = a.nome?.toLocaleLowerCase?.() ?? "";
          const bNome = b.nome?.toLocaleLowerCase?.() ?? "";
          const cmp = aNome.localeCompare(bNome, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        const aTime = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
        const bTime = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Quando shouldFetch é true, a API já faz a filtragem, não precisa filtrar localmente
  const filteredCursos = useMemo(() => {
    if (shouldFetch) {
      // API já filtra, retorna os cursos como vêm
      return cursos;
    }
    
    // Filtragem local apenas quando não está usando API
    const query = (normalizedSearch ?? "").toLowerCase();
    return cursos.filter((curso) => {
      const matchesSearch =
        query.length === 0 ||
        curso.nome.toLowerCase().includes(query) ||
        curso.codigo.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(curso.statusPadrao);

      const matchesCategory =
        !selectedCategoryId ||
        Number(selectedCategoryId) === Number(curso.categoriaId);

      // subcategoria pode vir em curso.subcategoria.id ou (em alguns payloads) curso.subcategoriaId
      const cursoSubId: number | null =
        (curso as any)?.subcategoria?.id ??
        (curso as any)?.subcategoriaId ??
        null;
      const matchesSubcategory =
        !selectedSubcategoryId ||
        (cursoSubId != null &&
          Number(selectedSubcategoryId) === Number(cursoSubId));

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesSubcategory
      );
    });
  }, [
    cursos,
    shouldFetch,
    normalizedSearch,
    selectedStatuses,
    selectedCategoryId,
    selectedSubcategoryId,
  ]);

  const displayedCursos: Curso[] = useMemo(() => {
    const sorted = sortList(filteredCursos);
    if (shouldFetch) return sorted;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [filteredCursos, currentPage, pageSize, shouldFetch, sortList]);

  const localTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCursos.length / pageSize)),
    [filteredCursos.length, pageSize]
  );

  const pagination = shouldFetch
    ? remotePagination
    : {
        requestedPage: currentPage,
        page: currentPage,
        isPageAdjusted: false,
        pageSize,
        total: filteredCursos.length,
        totalPages: localTotalPages,
        hasNext: currentPage < localTotalPages,
        hasPrevious: currentPage > 1,
      };

  const totalItems = pagination.total ?? filteredCursos.length;
  const totalPages = pagination.totalPages ?? 1;
  const currentPageValue = pagination.page ?? currentPage;
  const pageSizeValue = pagination.pageSize ?? pageSize;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // Verifica se há filtros ativos (usado antes de isFetchingData para evitar erro de ordem)
  const hasActiveFilters = selectedStatuses.length > 0 || selectedCategoryId || selectedSubcategoryId || appliedSearchTerm.length > 0;

  const isLoadingData = shouldFetch && queryLoading;
  const isFetchingData = shouldFetch && isFetching;

  const errorMessage = shouldFetch && queryError
    ? queryError.message || "Erro ao carregar cursos"
    : null;

  // Mostra skeleton quando:
  // 1. Está carregando pela primeira vez
  // 2. Está fazendo fetch E não há cursos ainda (primeira carga)
  // 3. Está fazendo fetch E há filtros aplicados (busca com filtros)
  const shouldShowSkeleton =
    shouldFetch && (
      isLoadingData || 
      (isFetchingData && fetchedCursos.length === 0) ||
      (isFetchingData && hasActiveFilters)
    );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    const start = Math.max(1, currentPageValue - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPageValue, totalPages]);

  // Popula checkboxes de status com filters.summary.statusPadrao
  // O backend retorna label e total, e pode incluir value separado
  const statusFilterOptions = useMemo(() => {
    if (queryData?.filters?.summary?.statusPadrao) {
      return queryData.filters.summary.statusPadrao.map((status) => {
        // Usa value se disponível, senão normaliza o label
        const statusValue = status.value || status.label.toUpperCase().replace(/\s+/g, "_");
        // Normaliza o label para exibição (primeira letra maiúscula)
        const normalizedLabel = status.label.charAt(0).toUpperCase() + status.label.slice(1).toLowerCase();
        return {
          value: statusValue,
          label: `${normalizedLabel} (${status.total})`,
          total: status.total,
          selected: status.selected ?? false,
        };
      });
    }
    // Fallback para opções padrão
    return [
      { value: "PUBLICADO", label: "Publicado (0)", total: 0, selected: false },
      { value: "RASCUNHO", label: "Rascunho (0)", total: 0, selected: false },
    ];
  }, [queryData?.filters?.summary?.statusPadrao]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: statusFilterOptions.map(({ value, label }) => ({ value, label })),
        placeholder: "Selecione status",
      },
      {
        key: "category",
        label: "Categoria",
        options: categoriaOptions,
        placeholder: "Selecionar categoria",
      },
      {
        key: "subcategory",
        label: "Subcategoria",
        options: subcategoriaOptions,
        placeholder: !selectedCategoryId
          ? "Selecione uma categoria primeiro"
          : isLoadingSubcategorias
          ? "Carregando subcategorias..."
          : subcategoriaOptions.length === 0
          ? "Nenhuma subcategoria encontrada"
          : "Selecione uma subcategoria",
        disabled:
          !selectedCategoryId ||
          isLoadingSubcategorias ||
          subcategoriaOptions.length === 0,
        emptyPlaceholder: "Sem opções disponíveis",
      },
    ],
    [
      categoriaOptions,
      subcategoriaOptions,
      selectedCategoryId,
      isLoadingSubcategorias,
      statusFilterOptions,
    ]
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      category: selectedCategoryId ?? null, // Garante que undefined vira null
      subcategory: selectedSubcategoryId ?? null, // Garante que undefined vira null
    }),
    [selectedStatuses, selectedCategoryId, selectedSubcategoryId]
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

  const handlePageSizeChange = useCallback((value: string) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) return;
      setPageSize(numericValue);
        setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
    },
    [totalPages]
  );

  const handleRetry = useCallback(() => {
    if (shouldFetch) {
      void refetch();
    }
  }, [shouldFetch, refetch]);

  // Trata estados vazios com base em meta.empty
  const isEmptyBasedOnMeta = queryData?.meta?.empty ?? false;
  const showEmptyState =
    !isLoadingData && !isFetchingData && !shouldShowSkeleton && (isEmptyBasedOnMeta || displayedCursos.length === 0);

  return (
    <div className={cn("min-h-full", className)}>
      {/* Top action bar */}
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          asChild
        >
          <Link href="/dashboard/cursos/cadastrar">Adicionar curso</Link>
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "status") {
                setSelectedStatuses(value === null ? [] : ((value as string[]) || []));
                setCurrentPage(1);
              } else if (key === "category") {
                // Garante que quando value é null, seta como null explicitamente
                const newCategoryId = value === null ? null : ((value as string) || null);
                setSelectedCategoryId(newCategoryId);
                // Limpar subcategoria quando mudar categoria
                setSelectedSubcategoryId(null);
                setCurrentPage(1);
              } else if (key === "subcategory") {
                // Garante que quando value é null, seta como null explicitamente
                const newSubcategoryId = value === null ? null : ((value as string) || null);
                setSelectedSubcategoryId(newSubcategoryId);
                setCurrentPage(1);
              }
            }}
            search={{
              label: "Pesquisar curso",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por nome ou código...",
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit((e.target as HTMLInputElement).value);
                }
              },
              error: searchValidationMessage,
              helperText: searchHelperText,
              helperPlacement: "tooltip",
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => handleSearchSubmit()}
                disabled={
                  (shouldFetch && (isLoadingData || (isFetchingData && hasActiveFilters))) ||
                  !isSearchInputValid
                }
                isLoading={shouldFetch && isFetchingData && hasActiveFilters}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between">
            <span>Erro ao carregar cursos: {errorMessage}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              disabled={!shouldFetch}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <div className="py-6">
        {!showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead
                    className="font-medium text-gray-700 py-4"
                    aria-sort={
                      sortField === "nome"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("nome")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "nome" && "text-gray-900"
                            )}
                          >
                            Curso
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "nome"
                            ? sortDirection === "asc"
                              ? "A → Z"
                              : "Z → A"
                            : "Ordenar por nome"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar A → Z"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("nome", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "nome" &&
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
                                setSort("nome", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "nome" &&
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
                  <TableHead className="font-medium text-gray-700">
                    Categoria
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Subcategoria
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Carga horária
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead
                    className="font-medium text-gray-700 text-center"
                    aria-sort={
                      sortField === "criadoEm"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("criadoEm")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "criadoEm" && "text-gray-900"
                            )}
                          >
                            Data da criação
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "criadoEm"
                            ? sortDirection === "asc"
                              ? "Mais antiga → mais nova"
                              : "Mais nova → mais antiga"
                            : "Ordenar por data"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Mais nova → mais antiga"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("criadoEm", "desc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "criadoEm" &&
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Mais antiga → mais nova"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("criadoEm", "asc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "criadoEm" &&
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
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                  {shouldShowSkeleton ? (
                    <CursoTableSkeleton rows={pageSizeValue} />
                  ) : (
                  displayedCursos.map((curso) => (
                    <CursoRow
                      key={curso.id}
                      curso={curso}
                      categoriaName={categoriaNameById[curso.categoriaId]}
                      subcategoriaName={
                        curso.subcategoriaId
                          ? subcategoriaNameById[curso.subcategoriaId]
                          : null
                      }
                    />
                    ))
                  )}
              </TableBody>
            </Table>
          </div>

            {(totalItems > 0 || shouldShowSkeleton) && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                    {Math.min((currentPageValue - 1) * pageSizeValue + 1, totalItems)} a{" "}
                    {Math.min(currentPageValue * pageSizeValue, totalItems)} de {totalItems}{" "}
                  curso{totalItems === 1 ? "" : "s"}
                </span>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                      onClick={() => handlePageChange(currentPageValue - 1)}
                      disabled={!pagination.hasPrevious || currentPageValue === 1}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages[0] > 1 && (
                    <>
                      <ButtonCustom
                          variant={currentPageValue === 1 ? "primary" : "outline"}
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
                        variant={currentPageValue === page ? "primary" : "outline"}
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
                            currentPageValue === totalPages ? "primary" : "outline"
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
                      onClick={() => handlePageChange(currentPageValue + 1)}
                      disabled={!pagination.hasNext || currentPageValue === totalPages}
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

        {showEmptyState && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt="Ilustração de arquivo não encontrado"
            title="Nenhum curso encontrado"
              description={
                hasFilters
                  ? "Não encontramos cursos com os filtros aplicados. Tente limpar os filtros ou ajustar sua busca."
                  : "Não há cursos cadastrados no momento. Cadastre um novo curso para começar."
              }
          />
          </div>
        )}
      </div>

      {/* Modal removida: criação ocorre na rota /dashboard/cursos/cadastrar */}
    </div>
  );
}

export default CursosDashboard;
