"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { VagaRow, VagaTableSkeleton } from "./components";
import { useVagasDashboardQuery } from "./hooks/useVagasDashboardQuery";
import type { VagaDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { VagaStatus } from "@/api/vagas";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";

const STATUS_FILTER_OPTIONS: { value: VagaStatus; label: string }[] = [
  { value: "PUBLICADO", label: "Publicada" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "PAUSADA", label: "Pausada" },
  { value: "ENCERRADA", label: "Encerrada" },
  { value: "EXPIRADO", label: "Expirada" },
];

const SEARCH_HELPER_TEXT = "Pesquise por título da vaga ou código da vaga.";

export function VagasDashboard({
  className,
  vagas: vagasProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: VagaDashboardProps) {
  const defaultPageSize = pageSizeProp ?? itemsPerPageProp ?? 10;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = defaultPageSize;

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<VagaStatus[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const shouldFetch = fetchFromApi && !vagasProp;

  const normalizedFilters = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      statuses: selectedStatuses,
      company: selectedCompanies[0] ?? null,
      location: selectedLocations[0] ?? null,
      search: getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH
      ),
    }),
    [
      currentPage,
      pageSize,
      selectedStatuses,
      selectedCompanies,
      selectedLocations,
      appliedSearchTerm,
    ]
  );

  const vagasQuery = useVagasDashboardQuery(normalizedFilters, shouldFetch);

  const fetchedVagas = vagasQuery.data?.vagas ?? [];
  const vagas = vagasProp ?? fetchedVagas;

  const pagination = shouldFetch
    ? vagasQuery.data?.pagination ?? {
        page: normalizedFilters.page,
        pageSize: normalizedFilters.pageSize,
        total: fetchedVagas.length,
        totalPages: Math.max(
          1,
          Math.ceil(fetchedVagas.length / normalizedFilters.pageSize)
        ),
      }
    : {
        page: currentPage,
        pageSize,
        total: vagas.length,
        totalPages: Math.max(1, Math.ceil(vagas.length / pageSize)),
      };

  useEffect(() => {
    if (!shouldFetch && vagasProp) {
      onDataLoaded?.(vagasProp, null);
    }
  }, [shouldFetch, vagasProp, onDataLoaded]);

  useEffect(() => {
    if (shouldFetch && vagasQuery.data) {
      onDataLoaded?.(vagasQuery.data.vagas, vagasQuery.data.pagination);
    }
  }, [shouldFetch, vagasQuery.data, onDataLoaded]);

  useEffect(() => {
    if (shouldFetch && vagasQuery.error && onError) {
      onError(vagasQuery.error.message || "Erro ao carregar vagas");
    }
  }, [shouldFetch, vagasQuery.error, onError]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedCompanies, selectedLocations]);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(Math.max(1, pagination.totalPages));
    }
  }, [pagination.totalPages, currentPage]);

  const companyOptions = useMemo(() => {
    const companies = new Set<string>();
    vagas.forEach((vaga) => {
      companies.add(vaga.empresa.nome);
    });
    return Array.from(companies)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((company) => ({ value: company, label: company }));
  }, [vagas]);

  const locationOptions = useMemo(() => {
    const locations = new Set<string>();
    vagas.forEach((vaga) => {
      const cidade = vaga.localizacao?.cidade ?? "—";
      const estado = vaga.localizacao?.estado ?? "—";
      locations.add(`${cidade}, ${estado}`);
    });
    return Array.from(locations)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((location) => ({ value: location, label: location }));
  }, [vagas]);

  useEffect(() => {
    if (selectedCompanies.length > 0) {
      const allowed = new Set(companyOptions.map((opt) => opt.value));
      if (!allowed.has(selectedCompanies[0])) {
        setSelectedCompanies([]);
      }
    }
  }, [companyOptions, selectedCompanies]);

  useEffect(() => {
    if (selectedLocations.length > 0) {
      const allowed = new Set(locationOptions.map((opt) => opt.value));
      if (!allowed.has(selectedLocations[0])) {
        setSelectedLocations([]);
      }
    }
  }, [locationOptions, selectedLocations]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const handleSearchSubmit = (rawValue?: string) => {
    const value = rawValue ?? pendingSearchTerm;
    const validationMessage = getSearchValidationMessage(value);
    if (validationMessage) return;

    const trimmedValue = value.trim();
    setPendingSearchTerm(value);
    setAppliedSearchTerm(trimmedValue);
    setCurrentPage(1);
  };

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
        setSortDirection("asc");
        return field;
      }
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return field;
    });
  };

  const sortedVagas = useMemo(() => {
    const list = [...vagas];
    list.sort((a, b) => {
      if (sortField === "titulo") {
        const titleA = a.titulo.toLowerCase();
        const titleB = b.titulo.toLowerCase();
        const cmp = titleA.localeCompare(titleB, "pt-BR");
        return sortDirection === "asc" ? cmp : -cmp;
      }

      if (sortField === "createdAt") {
        const dateA = new Date(a.inseridaEm).getTime();
        const dateB = new Date(b.inseridaEm).getTime();
        const cmp = dateA - dateB;
        return sortDirection === "asc" ? cmp : -cmp;
      }

      return 0;
    });
    return list;
  }, [vagas, sortField, sortDirection]);

  const isLoading = shouldFetch && vagasQuery.status === "pending";
  const isFetching = shouldFetch && vagasQuery.isFetching;
  const errorMessage = shouldFetch && vagasQuery.error
    ? vagasQuery.error.message || "Erro ao carregar vagas"
    : null;
  const showEmptyState = !isLoading && !isFetching && vagas.length === 0;

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const totalPages = pagination.totalPages;
    const page = pagination.page;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, page - 2);
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
        key: "status",
        label: "Status",
        mode: "multiple",
        options: STATUS_FILTER_OPTIONS,
        placeholder: "Selecione status",
      },
      {
        key: "empresa",
        label: "Empresa",
        mode: "multiple",
        options: companyOptions,
        placeholder: "Selecione empresa",
      },
      {
        key: "localizacao",
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
      empresa: selectedCompanies,
      localizacao: selectedLocations,
    }),
    [selectedStatuses, selectedCompanies, selectedLocations]
  );

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, Math.max(1, pagination.totalPages)));
    setCurrentPage(nextPage);
  };

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ButtonCustom
            asChild
            variant="primary"
            size="md"
            icon="Plus"
            className="w-full sm:w-auto"
          >
            <Link href="/dashboard/empresas/vagas/cadastrar">
              Cadastrar vaga
            </Link>
          </ButtonCustom>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <FilterBar
          fields={filterFields}
          values={filterValues}
          onChange={(key, value) => {
            if (key === "status") {
              setSelectedStatuses(
                Array.isArray(value) ? (value as VagaStatus[]) : []
              );
            }
            if (key === "empresa") {
              const companies = Array.isArray(value) ? (value as string[]) : [];
              setSelectedCompanies(companies);
            }
            if (key === "localizacao") {
              const locations = Array.isArray(value) ? (value as string[]) : [];
              setSelectedLocations(locations);
            }
          }}
          search={{
            label: "Pesquisar vaga",
            value: pendingSearchTerm,
            onChange: setPendingSearchTerm,
            placeholder: "Título ou código da vaga",
            helperText: SEARCH_HELPER_TEXT,
            helperPlacement: "tooltip",
            error: searchValidationMessage,
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearchSubmit(event.currentTarget.value);
              }
            },
          }}
          rightActions=
            {(
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => handleSearchSubmit()}
                disabled={!isSearchInputValid}
              >
                Pesquisar
              </ButtonCustom>
            ) as React.ReactNode}
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => vagasQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Vaga
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Empresa
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Publicada em
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <VagaTableSkeleton rows={8} />
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
            illustrationAlt="Nenhuma vaga encontrada"
            title={selectedStatuses.length > 0 || selectedCompanies.length > 0 || selectedLocations.length > 0 ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada"}
            description={selectedStatuses.length > 0 || selectedCompanies.length > 0 || selectedLocations.length > 0 ? "Ajuste os filtros ou pesquise novamente." : "Cadastre uma nova vaga para começar a acompanhá-la por aqui."}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    <div className="flex items-center gap-1">
                      <span>Vaga</span>
                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar A → Z"
                              onClick={() => setSort("titulo", "asc")}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "titulo" && sortDirection === "asc"
                                    ? "text-[var(--primary-color)]"
                                    : undefined
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
                              onClick={() => setSort("titulo", "desc")}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "titulo" && sortDirection === "desc"
                                    ? "text-[var(--primary-color)]"
                                    : undefined
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
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    <div className="flex items-center gap-1">
                      <span>Publicada em</span>
                      <button
                        type="button"
                        className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                        onClick={() => toggleSort("createdAt")}
                        aria-label="Ordenar por data"
                      >
                        {sortField === "createdAt" && sortDirection === "desc" ? (
                          <ChevronDown className="h-3 w-3 text-[var(--primary-color)]" />
                        ) : (
                          <ChevronUp className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching && fetchedVagas.length === 0 ? (
                  <VagaTableSkeleton rows={8} />
                ) : (
                  sortedVagas.map((vaga) => <VagaRow key={vaga.id} vaga={vaga} />)
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.total > 0 && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} a {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
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
                      {visiblePages[0] > 2 && <span className="text-gray-400">...</span>}
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
                      {visiblePages[visiblePages.length - 1] < pagination.totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          pagination.page === pagination.totalPages ? "primary" : "outline"
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

export default VagasDashboard;
