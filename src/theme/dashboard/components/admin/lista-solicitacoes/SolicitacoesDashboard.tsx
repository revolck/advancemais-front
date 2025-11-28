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
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SolicitacaoRow, SolicitacaoTableSkeleton } from "./components";
import type { SolicitacaoDashboardProps, SolicitacaoVaga, SolicitacaoStatus } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";

const SEARCH_HELPER_TEXT = "Pesquise por título da vaga ou nome da empresa.";

const createEmptyDateRange = (): DateRange => ({
  from: null,
  to: null,
});

const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ?? null,
  to: range.to ?? null,
});

const STATUS_FILTER_OPTIONS: { value: SolicitacaoStatus; label: string }[] = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "REJEITADA", label: "Rejeitada" },
  { value: "CANCELADA", label: "Cancelada" },
];

// Dados mockados para demonstração
const MOCK_SOLICITACOES: SolicitacaoVaga[] = [
  {
    id: "1",
    codigo: "SOL-001",
    vaga: { id: "v1", titulo: "Desenvolvedor Full Stack", codigo: "V95825" },
    empresa: { id: "e1", nome: "Tech Innovations LTDA", codigo: "EMP-81765" },
    solicitante: { id: "u1", nome: "Maria Silva" },
    status: "PENDENTE",
    dataSolicitacao: "2025-11-28T10:30:00Z",
  },
  {
    id: "2",
    codigo: "SOL-002",
    vaga: { id: "v2", titulo: "Analista de RH", codigo: "V95826" },
    empresa: { id: "e2", nome: "Consultoria RH Plus", codigo: "EMP-16951" },
    solicitante: { id: "u2", nome: "João Santos" },
    status: "PENDENTE",
    dataSolicitacao: "2025-11-28T09:15:00Z",
  },
  {
    id: "3",
    codigo: "SOL-003",
    vaga: { id: "v3", titulo: "Designer UX/UI", codigo: "V95599" },
    empresa: { id: "e1", nome: "Tech Innovations LTDA", codigo: "EMP-81765" },
    solicitante: { id: "u1", nome: "Maria Silva" },
    status: "APROVADA",
    dataSolicitacao: "2025-11-27T14:00:00Z",
    dataResposta: "2025-11-27T16:30:00Z",
  },
  {
    id: "4",
    codigo: "SOL-004",
    vaga: { id: "v4", titulo: "Vendedor Externo", codigo: "V95673" },
    empresa: { id: "e2", nome: "Consultoria RH Plus", codigo: "EMP-16951" },
    solicitante: { id: "u2", nome: "João Santos" },
    status: "REJEITADA",
    dataSolicitacao: "2025-11-26T11:00:00Z",
    dataResposta: "2025-11-26T15:00:00Z",
    motivoRejeicao: "Vaga não atende aos requisitos mínimos",
  },
  {
    id: "5",
    codigo: "SOL-005",
    vaga: { id: "v5", titulo: "Motorista Entregador", codigo: "V95451" },
    empresa: { id: "e3", nome: "Logística Express", codigo: "EMP-55432" },
    solicitante: { id: "u3", nome: "Pedro Costa" },
    status: "PENDENTE",
    dataSolicitacao: "2025-11-28T08:00:00Z",
  },
];

type SortField = "vaga" | "empresa" | "dataSolicitacao" | null;
type SortDirection = "asc" | "desc";

export function SolicitacoesDashboard({
  className,
  solicitacoes: solicitacoesProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: SolicitacaoDashboardProps) {
  const defaultPageSize = pageSizeProp ?? itemsPerPageProp ?? 10;
  const shouldFetch = fetchFromApi && !solicitacoesProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<SolicitacaoStatus[]>(["PENDENTE"]);
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(() => createEmptyDateRange());
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(() => createEmptyDateRange());

  // Sorting
  const [sortField, setSortField] = useState<SortField>("dataSolicitacao");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const normalizedSearch = useMemo(
    () => getNormalizedSearchOrUndefined(appliedSearchTerm, DEFAULT_SEARCH_MIN_LENGTH),
    [appliedSearchTerm]
  );

  // TODO: Substituir por chamada à API quando disponível
  const isLoading = false;
  const isFetching = false;
  const solicitacoes = solicitacoesProp ?? MOCK_SOLICITACOES;

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

  const sortList = useCallback(
    <T extends SolicitacaoVaga>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        let cmp = 0;
        if (sortField === "vaga") {
          const aName = a.vaga.titulo?.toLowerCase() ?? "";
          const bName = b.vaga.titulo?.toLowerCase() ?? "";
          cmp = aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
        } else if (sortField === "empresa") {
          const aName = a.empresa.nome?.toLowerCase() ?? "";
          const bName = b.empresa.nome?.toLowerCase() ?? "";
          cmp = aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
        } else if (sortField === "dataSolicitacao") {
          const aTime = a.dataSolicitacao ? new Date(a.dataSolicitacao).getTime() : 0;
          const bTime = b.dataSolicitacao ? new Date(b.dataSolicitacao).getTime() : 0;
          cmp = aTime - bTime;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Filtrar solicitações
  const filteredSolicitacoes = useMemo(() => {
    const query = (normalizedSearch ?? "").toLowerCase();

    return solicitacoes.filter((solicitacao) => {
      const matchesSearch =
        query.length === 0 ||
        solicitacao.vaga.titulo.toLowerCase().includes(query) ||
        solicitacao.empresa.nome.toLowerCase().includes(query) ||
        solicitacao.vaga.codigo?.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(solicitacao.status);

      // Filtro por data
      const matchesDateRange = (() => {
        if (!appliedDateRange.from && !appliedDateRange.to) return true;

        const solicitacaoDate = new Date(solicitacao.dataSolicitacao);
        const fromDate = appliedDateRange.from ? new Date(appliedDateRange.from) : null;
        const toDate = appliedDateRange.to ? new Date(appliedDateRange.to) : null;

        if (fromDate && toDate) {
          return solicitacaoDate >= fromDate && solicitacaoDate <= toDate;
        } else if (fromDate) {
          return solicitacaoDate >= fromDate;
        } else if (toDate) {
          return solicitacaoDate <= toDate;
        }

        return true;
      })();

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [solicitacoes, normalizedSearch, selectedStatuses, appliedDateRange]);

  const displayedSolicitacoes = useMemo(() => {
    const sorted = sortList(filteredSolicitacoes);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [filteredSolicitacoes, currentPage, pageSize, sortList]);

  const totalItems = filteredSolicitacoes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageValue = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, appliedDateRange, normalizedSearch]);

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;

      const trimmedValue = value.trim();
      setPendingSearchTerm(trimmedValue);
      setAppliedSearchTerm(trimmedValue);
      setAppliedDateRange(cloneDateRange(pendingDateRange));
      setCurrentPage(1);
    },
    [pendingSearchTerm, pendingDateRange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
    },
    [totalPages]
  );

  const handleAprovar = (id: string) => {
    // TODO: Implementar aprovação via API
    console.log("Aprovar solicitação:", id);
  };

  const handleRejeitar = (id: string) => {
    // TODO: Implementar rejeição via API
    console.log("Rejeitar solicitação:", id);
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: STATUS_FILTER_OPTIONS,
        placeholder: "Selecione status",
      },
      {
        key: "dateRange",
        label: "Data da solicitação",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    []
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      dateRange: pendingDateRange,
    }),
    [selectedStatuses, pendingDateRange]
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPageValue - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [currentPageValue, totalPages]);

  const showEmptyState = !isLoading && !isFetching && totalItems === 0;
  const shouldShowSkeleton = isLoading || (isFetching && solicitacoes.length === 0);

  return (
    <div className={cn("min-h-full", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            className="lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto]"
            onChange={(key, value) => {
              if (key === "status") {
                const values = Array.isArray(value) ? (value as SolicitacaoStatus[]) : [];
                setSelectedStatuses(values);
                setCurrentPage(1);
              } else if (key === "dateRange") {
                const range = value ? cloneDateRange(value as DateRange) : createEmptyDateRange();
                setPendingDateRange(range);
                setAppliedDateRange(range);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedStatuses([]);
              const resetRange = createEmptyDateRange();
              setPendingDateRange(resetRange);
              setAppliedDateRange(resetRange);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar solicitação",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar vaga ou empresa...",
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
                disabled={isLoading || isFetching || !isSearchInputValid}
                fullWidth
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

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
                        sortField === "vaga"
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
                              onClick={() => toggleSort("vaga")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "vaga" && "text-gray-900"
                              )}
                            >
                              Vaga
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "vaga"
                              ? sortDirection === "asc"
                                ? "A → Z (clique para Z → A)"
                                : "Z → A (clique para A → Z)"
                              : "Ordenar por vaga"}
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
                                  setSort("vaga", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "vaga" &&
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
                                  setSort("vaga", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "vaga" &&
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

                    <TableHead
                      className="font-medium text-gray-700"
                      aria-sort={
                        sortField === "empresa"
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
                              onClick={() => toggleSort("empresa")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "empresa" && "text-gray-900"
                              )}
                            >
                              Empresa
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "empresa"
                              ? sortDirection === "asc"
                                ? "A → Z (clique para Z → A)"
                                : "Z → A (clique para A → Z)"
                              : "Ordenar por empresa"}
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
                                  setSort("empresa", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "empresa" &&
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
                                  setSort("empresa", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "empresa" &&
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
                      Status
                    </TableHead>

                    <TableHead
                      className="font-medium text-gray-700 text-center"
                      aria-sort={
                        sortField === "dataSolicitacao"
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
                              onClick={() => toggleSort("dataSolicitacao")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "dataSolicitacao" && "text-gray-900"
                              )}
                            >
                              Data da solicitação
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "dataSolicitacao"
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
                                  setSort("dataSolicitacao", "desc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "dataSolicitacao" &&
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
                                  setSort("dataSolicitacao", "asc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "dataSolicitacao" &&
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

                    <TableHead className="font-medium text-gray-700 text-right pr-4">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shouldShowSkeleton ? (
                    <SolicitacaoTableSkeleton rows={pageSize} />
                  ) : (
                    displayedSolicitacoes.map((solicitacao) => (
                      <SolicitacaoRow
                        key={solicitacao.id}
                        solicitacao={solicitacao}
                        onAprovar={handleAprovar}
                        onRejeitar={handleRejeitar}
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
                    Mostrando {Math.min((currentPageValue - 1) * pageSize + 1, totalItems)} a{" "}
                    {Math.min(currentPageValue * pageSize, totalItems)} de {totalItems}{" "}
                    {totalItems === 1 ? "solicitação" : "solicitações"}
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <ButtonCustom
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPageValue - 1)}
                      disabled={currentPageValue === 1}
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
                        {visiblePages[0] > 2 && <span className="text-gray-400">...</span>}
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
                        {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <ButtonCustom
                          variant={currentPageValue === totalPages ? "primary" : "outline"}
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
                      disabled={currentPageValue === totalPages}
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
              title="Nenhuma solicitação encontrada"
              description="Revise os filtros aplicados ou aguarde novas solicitações de publicação de vagas."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SolicitacoesDashboard;
