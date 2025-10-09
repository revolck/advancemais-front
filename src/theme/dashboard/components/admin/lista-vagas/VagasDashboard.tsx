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
import Link from "next/link";
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
import { VagaRow, VagaTableSkeleton } from "./components/index";
import { useVagaDashboardData } from "./hooks/useVagaDashboardData";
import type { VagaDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { VagaStatus } from "@/api/vagas";

const STATUS_FILTER_OPTIONS: { value: VagaStatus; label: string }[] = [
  { value: "PUBLICADO", label: "Publicada" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "PAUSADA", label: "Pausada" },
  { value: "ENCERRADA", label: "Encerrada" },
  { value: "EXPIRADO", label: "Expirada" },
];

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT = "Pesquise por título da vaga ou código da vaga.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function VagasDashboard({
  className,
  vagas: vagasProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: VagaDashboardProps) {
  const defaultPageSize = 10; // Máximo de 10 vagas por página
  const shouldFetch = fetchFromApi && !vagasProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<VagaStatus[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const searchTermRef = useRef(appliedSearchTerm);
  const selectedStatusesRef = useRef<VagaStatus[]>(selectedStatuses);
  const selectedCompaniesRef = useRef<string[]>(selectedCompanies);
  const selectedLocationsRef = useRef<string[]>(selectedLocations);
  const pageSizeRef = useRef(pageSize);
  const hasFetchedRef = useRef(false);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;
  const searchHelperText = SEARCH_HELPER_TEXT;

  useEffect(() => {
    searchTermRef.current = appliedSearchTerm;
  }, [appliedSearchTerm]);

  useEffect(() => {
    selectedStatusesRef.current = selectedStatuses;
  }, [selectedStatuses]);

  useEffect(() => {
    selectedCompaniesRef.current = selectedCompanies;
  }, [selectedCompanies]);

  useEffect(() => {
    selectedLocationsRef.current = selectedLocations;
  }, [selectedLocations]);

  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  const {
    vagas: fetchedVagas,
    pagination,
    isLoading,
    error,
    refetch,
    clearError,
  } = useVagaDashboardData({
    enabled: shouldFetch,
    pageSize,
    autoFetch: false,
    onSuccess: (data, response) => onDataLoaded?.(data, response),
    onError,
  });

  useEffect(() => {
    if (vagasProp) {
      onDataLoaded?.(vagasProp, null);
    }
  }, [onDataLoaded, vagasProp]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    appliedSearchTerm,
    selectedStatuses,
    selectedCompanies,
    selectedLocations,
  ]);

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

  const vagas = vagasProp ?? fetchedVagas;

  // Criar opções de empresa baseadas nas vagas existentes
  const companyOptions = useMemo(() => {
    const companies = new Set<string>();
    vagas.forEach((vaga) => {
      companies.add(vaga.empresa.nome);
    });
    return Array.from(companies)
      .sort()
      .map((company) => ({ value: company, label: company }));
  }, [vagas]);

  // Criar opções de localização baseadas nas vagas existentes
  const locationOptions = useMemo(() => {
    const locations = new Set<string>();
    vagas.forEach((vaga) => {
      const location = `${vaga.localizacao.cidade}, ${vaga.localizacao.estado}`;
      locations.add(location);
    });
    return Array.from(locations)
      .sort()
      .map((location) => ({ value: location, label: location }));
  }, [vagas]);

  // Sorting
  type SortField = "titulo" | "createdAt" | null;
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
      const stored = localStorage.getItem("vagaList.sort");
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
        "vagaList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const sortList = useCallback(
    <T extends (typeof vagas)[number]>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "titulo") {
          const aTitulo = a.titulo?.toLocaleLowerCase?.() ?? "";
          const bTitulo = b.titulo?.toLocaleLowerCase?.() ?? "";
          const cmp = aTitulo.localeCompare(bTitulo, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        // createdAt
        const aTime = a.inseridaEm ? new Date(a.inseridaEm).getTime() : 0;
        const bTime = b.inseridaEm ? new Date(b.inseridaEm).getTime() : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  const filteredVagas = useMemo(() => {
    const query = appliedSearchTerm?.trim().toLowerCase() || "";

    return vagas.filter((vaga) => {
      const matchesSearch =
        query.length === 0 ||
        vaga.titulo.toLowerCase().includes(query) ||
        vaga.codigo.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(vaga.status);

      const matchesCompany =
        selectedCompanies.length === 0 ||
        selectedCompanies.includes(vaga.empresa.nome);

      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.includes(
          `${vaga.localizacao.cidade}, ${vaga.localizacao.estado}`
        );

      return (
        matchesSearch && matchesStatus && matchesCompany && matchesLocation
      );
    });
  }, [
    vagas,
    appliedSearchTerm,
    selectedStatuses,
    selectedCompanies,
    selectedLocations,
  ]);

  const displayedVagas = useMemo(() => {
    const sortedVagas = sortList(filteredVagas);

    if (shouldFetch) {
      return sortedVagas;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedVagas.slice(start, end);
  }, [filteredVagas, currentPage, pageSize, shouldFetch, sortList]);

  const totalItems = shouldFetch
    ? pagination?.total ?? filteredVagas.length
    : filteredVagas.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isLoadingData = shouldFetch && (isLoading || !hasFetchedRef.current);

  const remainingItems = shouldFetch
    ? Math.max(totalItems - (currentPage - 1) * pageSizeRef.current, 0)
    : 0;

  const visibleCount = displayedVagas.length;

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
        key: "company",
        label: "Empresa",
        mode: "multiple",
        options: companyOptions,
        placeholder: "Selecione empresa",
      },
      {
        key: "location",
        label: "Localização",
        mode: "multiple",
        options: locationOptions,
        placeholder: "Selecione localização",
      },
    ],
    [companyOptions, locationOptions]
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      company: selectedCompanies,
      location: selectedLocations,
    }),
    [selectedStatuses, selectedCompanies, selectedLocations]
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

      // Adicionar filtros de status
      if (selectedStatusesRef.current.length > 0) {
        searchParams.status = selectedStatusesRef.current;
      }

      refetch(searchParams).catch(() => {});
    },
    [refetch, shouldFetch]
  );

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      clearError();
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) {
        return;
      }

      const trimmedValue = value.trim();
      setPendingSearchTerm(value);
      setAppliedSearchTerm(trimmedValue);
      searchTermRef.current = trimmedValue;
      selectedStatusesRef.current = selectedStatuses;
      selectedCompaniesRef.current = selectedCompanies;
      selectedLocationsRef.current = selectedLocations;
      setCurrentPage(1);

      if (shouldFetch) {
        runFetch(1);
      }
    },
    [
      clearError,
      pendingSearchTerm,
      selectedStatuses,
      selectedCompanies,
      selectedLocations,
      shouldFetch,
      runFetch,
    ]
  );

  useEffect(() => {
    if (!shouldFetch || hasFetchedRef.current) return;
    runFetch(1);
  }, [shouldFetch, runFetch]);

  const handlePageSizeChange = useCallback(
    (value: string) => {
      clearError();
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return;
      }

      if (numericValue === pageSizeRef.current) return;

      setPageSize(numericValue);
      if (shouldFetch) {
        searchTermRef.current = appliedSearchTerm;
        selectedStatusesRef.current = selectedStatuses;
        selectedCompaniesRef.current = selectedCompanies;
        selectedLocationsRef.current = selectedLocations;
        runFetch(1, numericValue);
      } else {
        setCurrentPage(1);
      }
    },
    [
      clearError,
      runFetch,
      appliedSearchTerm,
      selectedStatuses,
      selectedCompanies,
      selectedLocations,
      shouldFetch,
    ]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      clearError();
      if (page < 1 || page > totalPages) return;
      if (shouldFetch) {
        runFetch(page);
      } else {
        setCurrentPage(page);
      }
    },
    [clearError, runFetch, shouldFetch, totalPages]
  );

  const handleRetry = useCallback(() => {
    clearError();
    runFetch(currentPage);
  }, [clearError, runFetch, currentPage]);

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

  const showEmptyState = !isLoadingData && displayedVagas.length === 0;

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
          <Link href="/dashboard/vagas/cadastrar">Cadastrar vaga</Link>
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              clearError();
              if (key === "status") {
                const values = Array.isArray(value)
                  ? (value as VagaStatus[])
                  : [];
                setSelectedStatuses(values);
                selectedStatusesRef.current = values;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              } else if (key === "company") {
                const values = Array.isArray(value) ? (value as string[]) : [];
                setSelectedCompanies(values);
                selectedCompaniesRef.current = values;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              } else if (key === "location") {
                const values = Array.isArray(value) ? (value as string[]) : [];
                setSelectedLocations(values);
                selectedLocationsRef.current = values;
                setCurrentPage(1);
                if (shouldFetch) {
                  runFetch(1);
                }
              }
            }}
            onClearAll={() => {
              clearError();
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedStatuses([]);
              setSelectedCompanies([]);
              setSelectedLocations([]);
              setCurrentPage(1);
              searchTermRef.current = "";
              selectedStatusesRef.current = [];
              selectedCompaniesRef.current = [];
              selectedLocationsRef.current = [];
              if (shouldFetch) {
                runFetch(1);
              }
            }}
            search={{
              label: "Pesquisar vaga",
              value: pendingSearchTerm,
              onChange: (value) => {
                clearError();
                setPendingSearchTerm(value);
              },
              placeholder: "Buscar vaga ou código...",
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
              shouldFetch ? (
                <ButtonCustom
                  variant="ghost"
                  size="lg"
                  onClick={() => handleSearchSubmit()}
                  disabled={isLoadingData || !isSearchInputValid}
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
                      sortField === "titulo"
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
                            onClick={() => toggleSort("titulo")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "titulo" && "text-gray-900"
                            )}
                          >
                            Vaga
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "titulo"
                            ? sortDirection === "asc"
                              ? "A → Z (clique para Z → A)"
                              : "Z → A (clique para A → Z)"
                            : "Ordenar por título"}
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
                                setSort("titulo", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "titulo" &&
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
                                setSort("titulo", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "titulo" &&
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
                    Empresa
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 text-center">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead
                    className="font-medium text-gray-700 w-32 text-center"
                    aria-sort={
                      sortField === "createdAt"
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
                  <TableHead className="font-medium text-gray-700 w-32 text-center">
                    Inscrições até
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 w-24">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Nº de vagas</span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        Número de vagas
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData && <VagaTableSkeleton rows={pageSize} />}
                {!isLoadingData &&
                  displayedVagas.map((vaga) => (
                    <VagaRow key={vaga.id} vaga={vaga} />
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
                  {totalItems === 1 ? "vaga" : "vagas"}
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
            title="Nenhuma vaga encontrada"
            description="Revise os filtros aplicados ou cadastre uma nova vaga para começar a acompanhar os resultados."
          />
        )}
      </div>
    </div>
  );
}

export default VagasDashboard;
