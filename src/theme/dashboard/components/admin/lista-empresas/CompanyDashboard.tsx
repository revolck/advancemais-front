"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  CompanyRow,
  CompanyTableSkeleton,
  CreateCompanyModal,
} from "./components";
import { useCompanyDashboardData } from "./hooks/useCompanyDashboardData";
import type { CompanyDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { AdminCompanyStatus } from "@/api/empresas";
import type { DateRange } from "@/components/ui/custom/date-picker";

const normalizeCnpj = (value?: string | null): string =>
  value?.replace(/\D/g, "") ?? "";

const STATUS_FILTER_OPTIONS: { value: AdminCompanyStatus; label: string }[] = [
  { value: "ATIVO", label: "Ativa" },
  { value: "INATIVO", label: "Inativa" },
  { value: "BLOQUEADO", label: "Bloqueada" },
];

export function CompanyDashboard({
  className,
  partnerships: partnershipsProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: CompanyDashboardProps) {
  const defaultPageSize = 10; // Máximo de 10 empresas por página
  const shouldFetch = fetchFromApi && !partnershipsProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<
    AdminCompanyStatus[]
  >([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const searchTermRef = useRef(searchTerm);
  const selectedPlansRef = useRef<string[]>(selectedPlans);
  const selectedStatusesRef = useRef<AdminCompanyStatus[]>(selectedStatuses);
  const dateRangeRef = useRef<DateRange>(dateRange);
  const pageSizeRef = useRef(pageSize);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    selectedPlansRef.current = selectedPlans;
  }, [selectedPlans]);

  useEffect(() => {
    selectedStatusesRef.current = selectedStatuses;
  }, [selectedStatuses]);

  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  const {
    partnerships: fetchedPartnerships,
    pagination,
    isLoading,
    error,
    refetch,
  } = useCompanyDashboardData({
    enabled: shouldFetch,
    pageSize,
    autoFetch: false,
    onSuccess: (data, response) => onDataLoaded?.(data, response),
    onError,
  });

  useEffect(() => {
    if (partnershipsProp) {
      onDataLoaded?.(partnershipsProp, null);
    }
  }, [onDataLoaded, partnershipsProp]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPlans, selectedStatuses]);

  useEffect(() => {
    if (!shouldFetch) {
      hasFetchedRef.current = false;
    }
  }, [shouldFetch]);

  useEffect(() => {
    if (shouldFetch && pagination?.page) {
      setCurrentPage(pagination.page);
    }
  }, [pagination?.page, shouldFetch]);

  useEffect(() => {
    if (
      shouldFetch &&
      pagination?.pageSize &&
      pagination.pageSize !== pageSize
    ) {
      setPageSize(pagination.pageSize);
    }
  }, [pagination?.pageSize, shouldFetch, pageSize]);

  const partnerships = partnershipsProp ?? fetchedPartnerships;

  // Sorting
  type SortField = "name" | "createdAt" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const setSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const toggleSort = (field: SortField) => {
    if (field === null) return;
    setSortField((prev) => {
      if (prev !== field) {
        // Default: alphabetical asc or date asc (mais antiga → mais nova)
        setSortDirection("asc");
        return field;
      }
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return field;
    });
  };

  // Persist sort in localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("companyList.sort");
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

  React.useEffect(() => {
    try {
      localStorage.setItem(
        "companyList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const sortList = useCallback(
    <T extends (typeof partnerships)[number]>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "name") {
          const aName = a.empresa.nome?.toLocaleLowerCase?.() ?? "";
          const bName = b.empresa.nome?.toLocaleLowerCase?.() ?? "";
          const cmp = aName.localeCompare(bName, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        // createdAt
        const aTime = a.empresa.criadoEm
          ? new Date(a.empresa.criadoEm).getTime()
          : 0;
        const bTime = b.empresa.criadoEm
          ? new Date(b.empresa.criadoEm).getTime()
          : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  const uniquePlans = useMemo(() => {
    const names = partnerships
      .map((partnership) => partnership.plano.nome)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [partnerships]);

  const filteredPartnerships = useMemo(() => {
    const query = searchTerm?.trim().toLowerCase() || "";
    const numericQuery = query.replace(/\D/g, "");

    return partnerships.filter((partnership) => {
      const company = partnership.empresa;
      const plan = partnership.plano;
      const companyCnpj = company.cnpj ?? "";
      const normalizedCnpj = normalizeCnpj(companyCnpj);

      const matchesSearch =
        query.length === 0 ||
        company.nome.toLowerCase().includes(query) ||
        company.codUsuario.toLowerCase().includes(query) ||
        companyCnpj.toLowerCase().includes(query) ||
        (numericQuery.length > 0 && normalizedCnpj.includes(numericQuery));

      const matchesPlan =
        selectedPlans.length === 0 || selectedPlans.includes(plan.nome);

      // Determinar o status da empresa de forma consistente
      let companyStatus: AdminCompanyStatus;

      // Determinar o status da empresa de forma consistente
      // Prioridade: bloqueada > banida > status > ativo
      if (company.bloqueada || company.bloqueioAtivo) {
        companyStatus = "BLOQUEADO";
      } else if (company.banida || company.banimentoAtivo) {
        companyStatus = "BLOQUEADO";
      } else if (company.status) {
        companyStatus = company.status;
      } else {
        companyStatus = company.ativo ? "ATIVO" : "INATIVO";
      }

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(companyStatus);

      // Filtro por data de criação
      const matchesDateRange = (() => {
        if (!dateRange.from && !dateRange.to) return true;

        const companyCreatedDate = new Date(company.criadoEm || new Date());
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        if (fromDate && toDate) {
          return companyCreatedDate >= fromDate && companyCreatedDate <= toDate;
        } else if (fromDate) {
          return companyCreatedDate >= fromDate;
        } else if (toDate) {
          return companyCreatedDate <= toDate;
        }

        return true;
      })();

      return matchesSearch && matchesPlan && matchesStatus && matchesDateRange;
    });
  }, [partnerships, searchTerm, selectedPlans, selectedStatuses, dateRange]);

  const displayedPartnerships = useMemo(() => {
    const sortedPartnerships = sortList(filteredPartnerships);

    if (shouldFetch) {
      return sortedPartnerships;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedPartnerships.slice(start, end);
  }, [filteredPartnerships, currentPage, pageSize, shouldFetch, sortList]);

  const totalItems = shouldFetch
    ? pagination?.total ?? 0
    : filteredPartnerships.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isLoadingData = shouldFetch && isLoading;

  const remainingItems = shouldFetch
    ? Math.max(totalItems - (currentPage - 1) * pageSizeRef.current, 0)
    : 0;

  const visibleCount = displayedPartnerships.length;

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "plan",
        label: "Planos",
        mode: "multiple",
        options: uniquePlans.map((p) => ({ value: p, label: p })),
        placeholder: "Selecione planos",
      },
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: STATUS_FILTER_OPTIONS,
        placeholder: "Selecione status",
      },
      {
        key: "dateRange",
        label: "Data de criação",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    [uniquePlans]
  );

  const filterValues = useMemo(
    () => ({
      plan: selectedPlans,
      status: selectedStatuses,
      dateRange: dateRange,
    }),
    [selectedPlans, selectedStatuses, dateRange]
  );

  const runFetch = useCallback(
    (pageToLoad = 1, sizeOverride?: number) => {
      if (!shouldFetch) return;
      hasFetchedRef.current = true;
      const effectiveSize = sizeOverride ?? pageSizeRef.current;
      setCurrentPage(pageToLoad);

      // Construir parâmetros de busca
      const searchParams: any = {
        page: pageToLoad,
        pageSize: effectiveSize,
      };

      // Só adicionar search se houver termo de busca
      const trimmedSearch = searchTermRef.current?.trim() || "";

      if (trimmedSearch.length > 0) {
        searchParams.search = trimmedSearch;
        console.log("🔍 runFetch: Com busca -", searchParams);
      } else {
        // Explicitamente definir search como undefined para limpar a busca
        searchParams.search = undefined;
        console.log(
          "🔍 runFetch: Sem busca (listagem completa) -",
          searchParams
        );
      }

      refetch(searchParams).catch(() => {});
    },
    [refetch, shouldFetch]
  );

  useEffect(() => {
    if (!shouldFetch || hasFetchedRef.current) return;
    runFetch(1);
  }, [shouldFetch, runFetch]);

  const handlePageSizeChange = useCallback(
    (value: string) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return;
      }

      if (numericValue === pageSizeRef.current) return;

      setPageSize(numericValue);
      if (shouldFetch) {
        searchTermRef.current = searchTerm;
        selectedPlansRef.current = selectedPlans;
        selectedStatusesRef.current = selectedStatuses;
        runFetch(1, numericValue);
      } else {
        setCurrentPage(1);
      }
    },
    [runFetch, searchTerm, selectedPlans, selectedStatuses, shouldFetch]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      if (shouldFetch) {
        runFetch(page);
      } else {
        setCurrentPage(page);
      }
    },
    [runFetch, shouldFetch, totalPages]
  );

  const handleRetry = useCallback(() => {
    runFetch(currentPage);
  }, [runFetch, currentPage]);

  const handleCreateCompanySuccess = useCallback(() => {
    // Recarregar os dados após criar uma empresa
    if (shouldFetch) {
      runFetch(1);
    }
  }, [shouldFetch, runFetch]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
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
  }, [currentPage, totalPages]);

  const showEmptyState = !isLoadingData && totalItems === 0;

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
          onClick={() => setIsCreateModalOpen(true)}
        >
          Cadastrar empresa
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "plan") {
                const values = (value as string[]) ?? [];
                setSelectedPlans(values);
                selectedPlansRef.current = values;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              } else if (key === "status") {
                const values = Array.isArray(value)
                  ? (value as AdminCompanyStatus[])
                  : [];
                setSelectedStatuses(values);
                selectedStatusesRef.current = values;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              } else if (key === "dateRange") {
                const range = (value as DateRange) ?? { from: null, to: null };
                setDateRange(range);
                dateRangeRef.current = range;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              }
            }}
            onClearAll={() => {
              setSearchTerm("");
              setSelectedPlans([]);
              setSelectedStatuses([]);
              setDateRange({ from: null, to: null });
              setCurrentPage(1);
              if (shouldFetch) {
                searchTermRef.current = "";
                selectedPlansRef.current = [];
                selectedStatusesRef.current = [];
                dateRangeRef.current = { from: null, to: null };
                runFetch(1);
              }
            }}
            search={{
              label: "Pesquisar empresa",
              value: searchTerm,
              onChange: (value) => {
                setSearchTerm(value);
                searchTermRef.current = value;
              },
              placeholder: "Buscar empresa, código ou CNPJ...",
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setCurrentPage(1);
                  if (shouldFetch) {
                    // Usar o valor atual do input, não o estado
                    const currentValue = (e.target as HTMLInputElement).value;
                    searchTermRef.current = currentValue;
                    selectedPlansRef.current = selectedPlans;
                    selectedStatusesRef.current = selectedStatuses;
                    runFetch(1);
                  }
                }
              },
            }}
            rightActions={
              shouldFetch ? (
                <ButtonCustom
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setCurrentPage(1);
                    // Usar o valor atual do estado searchTerm
                    searchTermRef.current = searchTerm;
                    selectedPlansRef.current = selectedPlans;
                    selectedStatusesRef.current = selectedStatuses;
                    runFetch(1);
                  }}
                  disabled={isLoadingData}
                  fullWidth
                  className="md:w-full xl:w-auto"
                >
                  Pesquisar
                </ButtonCustom>
              ) : undefined
            }
          />

          {error && shouldFetch && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-2 px-1">
              <span>{error}</span>
              <Button
                variant="link"
                size="sm"
                onClick={handleRetry}
                className="p-0 h-auto"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead
                    className="font-medium text-gray-700 py-4"
                    aria-sort={
                      sortField === "name"
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
                            onClick={() => toggleSort("name")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "name" && "text-gray-900"
                            )}
                          >
                            Empresa
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "name"
                            ? sortDirection === "asc"
                              ? "A → Z (clique para Z → A)"
                              : "Z → A (clique para A → Z)"
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
                                setSort("name", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "name" &&
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
                                setSort("name", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "name" &&
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
                    Plano
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  {/* Coluna de Vagas removida */}
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead
                    className="font-medium text-gray-700"
                    aria-sort={
                      sortField === "createdAt"
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
                            onClick={() => toggleSort("createdAt")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "createdAt" && "text-gray-900"
                            )}
                          >
                            Data da criação
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "createdAt"
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
                                // Up = atual → antigo (desc)
                                setSort("createdAt", "desc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "createdAt" &&
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
                                // Down = antigo → atual (asc)
                                setSort("createdAt", "asc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "createdAt" &&
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
                  <TableHead className="font-medium text-gray-700">
                    Dias restantes
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData && <CompanyTableSkeleton rows={pageSize} />}
                {!isLoadingData &&
                  displayedPartnerships.map((partnership) => (
                    <CompanyRow
                      key={partnership.id}
                      partnership={partnership}
                    />
                  ))}
              </TableBody>
            </Table>
          </div>

          {(totalItems > 0 || isLoadingData) && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                  {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a{" "}
                  {Math.min(currentPage * pageSize, totalItems)} de {totalItems}{" "}
                  {totalItems === 1 ? "empresa" : "empresas"}
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
                      {visiblePages[visiblePages.length - 1] <
                        totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          currentPage === totalPages ? "primary" : "outline"
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

        {showEmptyState && (
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt="Ilustração de arquivo não encontrado"
            title="Nenhuma empresa encontrada"
            description="Revise os filtros aplicados ou cadastre uma nova empresa para começar a acompanhar os resultados."
          />
        )}
      </div>

      {/* Modal de criação de empresa */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  );
}

export default CompanyDashboard;
