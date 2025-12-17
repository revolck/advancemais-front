"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { TransacaoRow } from "./components/TransacaoRow";
import { TransacaoTableSkeleton } from "./components/TransacaoTableSkeleton";
import type { SelectOption } from "@/components/ui/custom/select";
import type { FilterField } from "@/components/ui/custom/filters";
import { useTransacoesDashboardQuery } from "./hooks/useTransacoesDashboardQuery";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT = "Pesquise por ID, descrição ou gateway.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function TransacoesDashboard({ className }: { className?: string }) {
  const defaultPageSize = 10;
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
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

  const tipoOptions: SelectOption[] = useMemo(() => [
    { value: "PAGAMENTO", label: "Pagamento" },
    { value: "REEMBOLSO", label: "Reembolso" },
    { value: "ESTORNO", label: "Estorno" },
    { value: "ASSINATURA", label: "Assinatura" },
    { value: "CUPOM", label: "Cupom" },
    { value: "TAXA", label: "Taxa" },
  ], []);

  const statusOptions: SelectOption[] = useMemo(() => [
    { value: "PENDENTE", label: "Pendente" },
    { value: "PROCESSANDO", label: "Processando" },
    { value: "APROVADA", label: "Aprovada" },
    { value: "RECUSADA", label: "Recusada" },
    { value: "CANCELADA", label: "Cancelada" },
    { value: "ESTORNADA", label: "Estornada" },
  ], []);

  const normalizedFilters = useMemo(() => {
    return {
      page: currentPage,
      pageSize,
      tipo: selectedTipos.length > 0
        ? selectedTipos.length === 1
          ? selectedTipos[0]
          : selectedTipos
        : null,
      status: selectedStatuses.length > 0
        ? selectedStatuses.length === 1
          ? selectedStatuses[0]
          : selectedStatuses
        : null,
    };
  }, [
    currentPage,
    pageSize,
    selectedTipos,
    selectedStatuses,
  ]);

  const transacoesQuery = useTransacoesDashboardQuery(normalizedFilters);
  const transacoes = useMemo(() => transacoesQuery.data?.transacoes ?? [], [transacoesQuery.data?.transacoes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTipos, selectedStatuses]);

  const transacoesPagination = transacoesQuery.data?.pagination ?? {
    page: normalizedFilters.page,
    pageSize: normalizedFilters.pageSize,
    total: transacoes.length,
    totalPages: Math.max(
      1,
      Math.ceil(transacoes.length / normalizedFilters.pageSize)
    ),
  };
  const pagination = transacoesPagination;

  useEffect(() => {
    if (currentPage > transacoesPagination.totalPages) {
      setCurrentPage(Math.max(1, transacoesPagination.totalPages));
    }
  }, [transacoesPagination.totalPages, currentPage]);
  
  const isLoading = transacoesQuery.isLoading;
  const isFetching = transacoesQuery.isFetching;
  const showSkeleton = isFetching;
  
  const errorMessage = transacoesQuery.error
    ? transacoesQuery.error.message || "Erro ao carregar transações"
    : null;
  const showEmptyState = !isLoading && !isFetching && transacoes.length === 0;
  const emptyStateTitle = "Nenhuma transação encontrada";
  const emptyStateDescription = "Não encontramos transações com os filtros aplicados. Tente ajustar sua busca.";

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
      const stored = localStorage.getItem("transacoesList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as { dir: SortDirection };
        if (parsed.dir) setSortDirection(parsed.dir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "transacoesList.sort",
        JSON.stringify({ dir: sortDirection })
      );
    } catch {}
  }, [sortDirection]);

  // Ordenar transações
  const sortedTransacoes = useMemo(() => {
    const sorted = [...transacoes];
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
  }, [transacoes, sortDirection]);

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
        key: "tipo",
        label: "Tipo",
        mode: "multiple",
        options: tipoOptions,
        placeholder: "Selecione tipo",
      },
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: statusOptions,
        placeholder: "Selecione status",
      },
    ],
    [tipoOptions, statusOptions]
  );

  const filterValues = useMemo(
    () => ({
      tipo: selectedTipos,
      status: selectedStatuses,
    }),
    [selectedTipos, selectedStatuses]
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
              if (key === "tipo") {
                setSelectedTipos(
                  Array.isArray(value) ? (value as string[]) : []
                );
                setCurrentPage(1);
              } else if (key === "status") {
                setSelectedStatuses(
                  Array.isArray(value) ? (value as string[]) : []
                );
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedTipos([]);
              setSelectedStatuses([]);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar transações",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "ID, descrição, gateway...",
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
            <span>Erro ao carregar transações: {errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => transacoesQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {showSkeleton && transacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    ID
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Tipo
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Valor
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Gateway
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Descrição
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
                <TransacaoTableSkeleton rows={10} />
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
                    ID
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Tipo
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Valor
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Gateway
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Descrição
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
                  <TransacaoTableSkeleton rows={pageSize} />
                ) : (
                  sortedTransacoes.map((transacao) => (
                    <TransacaoRow
                      key={transacao.id}
                      transacao={transacao}
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
                  {pagination.total === 1 ? "transação" : "transações"}
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

export default TransacoesDashboard;

