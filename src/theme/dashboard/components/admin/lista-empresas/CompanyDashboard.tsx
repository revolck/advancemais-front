"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CompanyRow, CompanyTableSkeleton, EmptyState } from "./components";
import { COMPANY_DASHBOARD_CONFIG } from "./constants";
import { useCompanyDashboardData } from "./hooks/useCompanyDashboardData";
import type { CompanyDashboardProps } from "./types";
import { FilterBar } from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";

const normalizeCnpj = (value?: string | null): string =>
  value?.replace(/\D/g, "") ?? "";

export function CompanyDashboard({
  className,
  partnerships: partnershipsProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: CompanyDashboardProps) {
  const defaultPageSize =
    pageSizeProp ??
    itemsPerPageProp ??
    COMPANY_DASHBOARD_CONFIG.defaultPageSize;
  const shouldFetch = fetchFromApi && !partnershipsProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const searchTermRef = useRef(searchTerm);
  const selectedPlansRef = useRef<string[]>(selectedPlans);
  const pageSizeRef = useRef(pageSize);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    selectedPlansRef.current = selectedPlans;
  }, [selectedPlans]);

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
    if (!shouldFetch) {
      setCurrentPage(1);
    }
  }, [searchTerm, selectedPlans, shouldFetch]);

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

  const uniquePlans = useMemo(() => {
    const names = partnerships
      .map((partnership) => partnership.plano.nome)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [partnerships]);

  const filteredPartnerships = useMemo(() => {
    if (shouldFetch) {
      return partnerships;
    }

    const query = searchTerm.trim().toLowerCase();
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

      return matchesSearch && matchesPlan;
    });
  }, [partnerships, searchTerm, selectedPlans, shouldFetch]);

  const displayedPartnerships = useMemo(() => {
    if (shouldFetch) {
      return filteredPartnerships;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPartnerships.slice(start, end);
  }, [filteredPartnerships, currentPage, pageSize, shouldFetch]);

  const totalItems = shouldFetch
    ? pagination?.total ?? 0
    : filteredPartnerships.length;

  const totalPages = shouldFetch
    ? Math.max(1, pagination?.totalPages ?? 1)
    : Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (!shouldFetch && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, shouldFetch]);

  const isLoadingData = shouldFetch && isLoading;

  const remainingItems = shouldFetch
    ? Math.max(totalItems - (currentPage - 1) * pageSizeRef.current, 0)
    : 0;

  const visibleCount = shouldFetch
    ? totalItems === 0
      ? 0
      : isLoadingData
      ? Math.min(pageSizeRef.current, remainingItems || pageSizeRef.current)
      : partnerships.length
    : displayedPartnerships.length;

  const infoLabel = useMemo(() => {
    if (isLoadingData && totalItems === 0) {
      return "Carregando empresas...";
    }
    if (totalItems > 0) {
      return `Mostrando ${visibleCount} de ${totalItems} empresas`;
    }
    return "Nenhuma empresa encontrada";
  }, [isLoadingData, totalItems, visibleCount]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "plan",
        label: "Planos",
        mode: "multiple",
        options: uniquePlans.map((p) => ({ value: p, label: p })),
        placeholder: "Selecione planos",
      },
    ],
    [uniquePlans]
  );

  const filterValues = useMemo(
    () => ({
      plan: selectedPlans,
    }),
    [selectedPlans]
  );

  const runFetch = useCallback(
    (pageToLoad = 1, sizeOverride?: number) => {
      if (!shouldFetch) return;
      hasFetchedRef.current = true;
      const effectiveSize = sizeOverride ?? pageSizeRef.current;
      setCurrentPage(pageToLoad);
      refetch({
        page: pageToLoad,
        pageSize: effectiveSize,
        search:
          searchTermRef.current.trim().length > 0
            ? searchTermRef.current.trim()
            : undefined,
        planNames:
          selectedPlansRef.current.length > 0
            ? selectedPlansRef.current
            : undefined,
      }).catch(() => {});
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
        runFetch(1, numericValue);
      } else {
        setCurrentPage(1);
      }
    },
    [runFetch, searchTerm, selectedPlans, shouldFetch]
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

  const showEmptyState =
    !isLoadingData && totalItems === 0 && displayedPartnerships.length === 0;

  const pageSizeOptions = COMPANY_DASHBOARD_CONFIG.pageSizeOptions;

  return (
    <div className={cn("min-h-full", className)}>
      {/* Top action bar */}
      <div className="flex items-center justify-end mb-2">
        <ButtonCustom variant="primary" size="md" icon="Plus">
          Criar empresa
        </ButtonCustom>
      </div>

      <div className="border-b border-gray-200 sticky top-0 z-10 backdrop-blur-xl">
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
              }
            }}
            onClearAll={() => {
              setSearchTerm("");
              setSelectedPlans([]);
              setCurrentPage(1);
              if (shouldFetch) {
                searchTermRef.current = "";
                selectedPlansRef.current = [];
                runFetch(1);
              }
            }}
            search={{
              label: "Pesquisar empresa",
              value: searchTerm,
              onChange: setSearchTerm,
              placeholder: "Buscar empresa, código ou CNPJ...",
            }}
            rightActions={
              shouldFetch ? (
                <ButtonCustom
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setCurrentPage(1);
                    searchTermRef.current = searchTerm;
                    selectedPlansRef.current = selectedPlans;
                    runFetch(1);
                  }}
                  disabled={isLoadingData}
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
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gray-50/50">
                <TableHead className="font-medium text-gray-700 py-4">
                  Empresa
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Plano
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Localização
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Status Empresa
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Status Plano
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Vagas
                </TableHead>
                <TableHead className="font-medium text-gray-700">
                  Data Criação
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData && <CompanyTableSkeleton rows={pageSize} />}
              {!isLoadingData &&
                displayedPartnerships.map((partnership) => (
                  <CompanyRow key={partnership.id} partnership={partnership} />
                ))}
            </TableBody>
          </Table>

          {(totalItems > 0 || isLoadingData) && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <span>Mostrar</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={handlePageSizeChange}
                    disabled={isLoadingData}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>por página</span>
                </div>
                <div>{infoLabel}</div>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        aria-disabled={currentPage === 1}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                    {visiblePages[0] > 1 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {visiblePages[0] > 2 && <PaginationEllipsis />}
                      </>
                    )}
                    {visiblePages.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <>
                        {visiblePages[visiblePages.length - 1] <
                          totalPages - 1 && <PaginationEllipsis />}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        aria-disabled={currentPage === totalPages}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>

        {showEmptyState && (
          <EmptyState
            title="Nenhuma empresa encontrada"
            description="Tente ajustar os filtros ou termo de busca"
          />
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
