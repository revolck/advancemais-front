"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HistoricoRow } from "./components/HistoricoRow";
import { HistoricoTableSkeleton } from "./components/HistoricoTableSkeleton";
import type { SelectOption } from "@/components/ui/custom/select";
import type { FilterField } from "@/components/ui/custom/filters";
import { useHistoricoDashboardQuery } from "./hooks/useHistoricoDashboardQuery";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT = "Pesquise por descrição, ação ou tipo.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function HistoricoDashboard({ className }: { className?: string }) {
  const defaultPageSize = 10;
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const pageSize = defaultPageSize;
  const [currentPage, setCurrentPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 5000);
  }, []);

  // Estados de ordenação
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const categoriaOptions: SelectOption[] = useMemo(() => [
    { value: "SISTEMA", label: "Sistema" },
    { value: "USUARIO", label: "Usuário" },
    { value: "EMPRESA", label: "Empresa" },
    { value: "VAGA", label: "Vaga" },
    { value: "CURSO", label: "Curso" },
    { value: "PAGAMENTO", label: "Pagamento" },
    { value: "SEGURANCA", label: "Segurança" },
  ], []);

  const normalizedFilters = useMemo(() => {
    return {
      page: currentPage,
      pageSize,
      categoria: selectedCategorias.length > 0
        ? selectedCategorias.length === 1
          ? selectedCategorias[0]
          : selectedCategorias
        : null,
      tipo: selectedTipo,
      search:
        appliedSearchTerm.length >= MIN_SEARCH_LENGTH
          ? appliedSearchTerm
          : "",
    };
  }, [
    currentPage,
    pageSize,
    selectedCategorias,
    selectedTipo,
    appliedSearchTerm,
  ]);

  const historicoQuery = useHistoricoDashboardQuery(normalizedFilters);
  const logs = useMemo(() => historicoQuery.data?.logs ?? [], [historicoQuery.data?.logs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorias, selectedTipo]);

  const historicoPagination = historicoQuery.data?.pagination ?? {
    page: normalizedFilters.page,
    pageSize: normalizedFilters.pageSize,
    total: logs.length,
    totalPages: Math.max(
      1,
      Math.ceil(logs.length / normalizedFilters.pageSize)
    ),
  };
  const pagination = historicoPagination;

  useEffect(() => {
    if (currentPage > historicoPagination.totalPages) {
      setCurrentPage(Math.max(1, historicoPagination.totalPages));
    }
  }, [historicoPagination.totalPages, currentPage]);
  
  const isLoading = historicoQuery.isLoading;
  const isFetching = historicoQuery.isFetching;
  const showSkeleton = isFetching;
  
  const errorMessage = historicoQuery.error
    ? historicoQuery.error.message || "Erro ao carregar histórico"
    : null;
  const showEmptyState = !isLoading && !isFetching && logs.length === 0;
  const emptyStateTitle = "Nenhum registro encontrado";
  const emptyStateDescription = "Não encontramos registros com os filtros aplicados. Tente ajustar sua busca.";

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, Math.max(1, pagination.totalPages)));
    setCurrentPage(nextPage);
  };

  const handleSearchSubmit = (rawValue?: string) => {
    const value = rawValue ?? pendingSearchTerm;
    const validationMessage = getSearchValidationMessage(value);
    if (validationMessage) return;
    const trimmedValue = value.trim();
    setPendingSearchTerm(value);
    setAppliedSearchTerm(trimmedValue);
    setCurrentPage(1);
  };

  // Persistir ordenação no localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("historicoList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as { dir: SortDirection };
        if (parsed.dir) setSortDirection(parsed.dir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "historicoList.sort",
        JSON.stringify({ dir: sortDirection })
      );
    } catch {}
  }, [sortDirection]);

  // Ordenar logs
  const sortedLogs = useMemo(() => {
    const sorted = [...logs];
    sorted.sort((a, b) => {
      const dateA = new Date(a.criadoEm).getTime();
      const dateB = new Date(b.criadoEm).getTime();
      if (sortDirection === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
    return sorted;
  }, [logs, sortDirection]);

  // Páginas visíveis para navegação
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "categoria",
        label: "Categoria",
        mode: "multiple",
        options: categoriaOptions,
        placeholder: "Selecione categoria",
      },
      {
        key: "tipo",
        label: "Tipo",
        options: [],
        placeholder: "Selecione tipo",
        disabled: true, // Pode ser implementado depois
      },
    ],
    [categoriaOptions]
  );

  const filterValues = useMemo(
    () => ({
      categoria: selectedCategorias,
      tipo: selectedTipo,
    }),
    [selectedCategorias, selectedTipo]
  );

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "categoria") {
                setSelectedCategorias(
                  Array.isArray(value) ? (value as string[]) : []
                );
                setCurrentPage(1);
              } else if (key === "tipo") {
                setSelectedTipo((value as string) || null);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedCategorias([]);
              setSelectedTipo(null);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar histórico",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Descrição, ação, tipo...",
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
                fullWidth
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
          <div className="flex items-center justify-between">
            <span>Erro ao carregar histórico: {errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => historicoQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {showSkeleton && logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Descrição
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Categoria
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Ação
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Usuário
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    IP
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    <div className="flex items-center gap-1">
                      <span>Data</span>
                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais antigo"
                              onClick={() => setSortDirection("asc")}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortDirection === "asc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Mais antigo primeiro</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais recente"
                              onClick={() => setSortDirection("desc")}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortDirection === "desc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Mais recente primeiro</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <HistoricoTableSkeleton rows={10} />
              </TableBody>
            </Table>
          </div>
        </div>
      ) : showEmptyState ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt={emptyStateTitle}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Descrição
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Categoria
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Ação
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Usuário
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    IP
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    <div className="flex items-center gap-1">
                      <span>Data</span>
                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais antigo"
                              onClick={() => setSortDirection("asc")}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortDirection === "asc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Mais antigo primeiro</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar mais recente"
                              onClick={() => setSortDirection("desc")}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortDirection === "desc" &&
                                    "text-[var(--primary-color)]"
                                )}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>Mais recente primeiro</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showSkeleton ? (
                  <HistoricoTableSkeleton rows={pageSize} />
                ) : (
                  sortedLogs.map((log) => (
                    <HistoricoRow
                      key={log.id}
                      log={log}
                      isDisabled={isNavigating}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.total > 0 && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                  {Math.min(
                    (pagination.page - 1) * pagination.pageSize + 1,
                    pagination.total
                  )}{" "}
                  a{" "}
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  )}{" "}
                  de {pagination.total}{" "}
                  {pagination.total === 1 ? "registro" : "registros"}
                </span>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="h-8 px-3"
                  >
                    Anterior
                  </ButtonCustom>

                  {visiblePages[0] > 1 && (
                    <>
                      <ButtonCustom
                        variant={pagination.page === 1 ? "primary" : "outline"}
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
                      variant={pagination.page === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </ButtonCustom>
                  ))}

                  {visiblePages[visiblePages.length - 1] < pagination.totalPages && (
                    <>
                      {visiblePages[visiblePages.length - 1] <
                        pagination.totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          pagination.page === pagination.totalPages
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="h-8 w-8 p-0"
                      >
                        {pagination.totalPages}
                      </ButtonCustom>
                    </>
                  )}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
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

export default HistoricoDashboard;

