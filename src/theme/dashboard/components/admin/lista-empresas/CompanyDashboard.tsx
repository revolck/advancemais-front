"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import { CompanyRow, CompanyTableSkeleton, EmptyState } from "./components";
import { COMPANY_DASHBOARD_CONFIG, TRIAL_PARTNERSHIP_TYPES } from "./constants";
import { useCompanyDashboardData } from "./hooks/useCompanyDashboardData";
import type { CompanyDashboardProps } from "./types";
import { FilterBar } from "@/components/ui/custom";
import type { FilterField } from "@/components/ui/custom/filters";
// import type { AdminCompanyPlanType } from "@/api/empresas";

export function CompanyDashboard({
  className,
  partnerships: partnershipsProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize,
  onDataLoaded,
  onError,
}: CompanyDashboardProps) {
  const itemsPerPage =
    itemsPerPageProp ?? COMPANY_DASHBOARD_CONFIG.itemsPerPage;
  const shouldFetch = fetchFromApi && !partnershipsProp;

  const {
    partnerships: fetchedPartnerships,
    isLoading,
    error,
    refetch,
  } = useCompanyDashboardData({
    enabled: false,
    pageSize: pageSize ?? COMPANY_DASHBOARD_CONFIG.api.pageSize,
    onSuccess: (data, response) => onDataLoaded?.(data, response),
    onError,
  });

  const filtersRef = useRef({ searchTerm: "", selectedPlans: [] as string[] });

  useEffect(() => {
    if (partnershipsProp) {
      onDataLoaded?.(partnershipsProp, null);
    }
  }, [onDataLoaded, partnershipsProp]);

  const partnerships = partnershipsProp ?? fetchedPartnerships;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    filtersRef.current = { searchTerm, selectedPlans };
  }, [searchTerm, selectedPlans]);

  const uniquePlans = useMemo(() => {
    const names = partnerships
      .map((partnership) => partnership.plano.nome)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [partnerships]);

  const filteredPartnerships = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return partnerships.filter((partnership) => {
      const company = partnership.empresa;
      const plan = partnership.plano;

      const matchesSearch =
        query.length === 0 ||
        company.nome.toLowerCase().includes(query) ||
        company.codUsuario.toLowerCase().includes(query) ||
        (company.cnpj?.toLowerCase().includes(query) ?? false);

      const matchesPlan =
        selectedPlans.length === 0 || selectedPlans.includes(plan.nome);

      return matchesSearch && matchesPlan;
    });
  }, [partnerships, selectedPlans, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPartnerships.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPartnerships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPartnerships.slice(start, end);
  }, [filteredPartnerships, currentPage, itemsPerPage]);

  // métricas removidas a pedido

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

  const isLoadingData = shouldFetch && isLoading;
  const showEmptyState = !isLoadingData && filteredPartnerships.length === 0;

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
    (pageToLoad = 1) => {
      if (!shouldFetch) return;
      const { searchTerm: latestSearch, selectedPlans: latestPlans } = filtersRef.current;
      refetch({
        page: pageToLoad,
        search: latestSearch ? latestSearch.trim() || undefined : undefined,
        planNames: latestPlans.length ? latestPlans : undefined,
      }).catch(() => {});
    },
    [refetch, shouldFetch],
  );

  useEffect(() => {
    if (!shouldFetch) return;
    runFetch(1);
  }, [shouldFetch, runFetch]);

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
              if (key === "plan") setSelectedPlans((value as string[]) ?? []);
              setCurrentPage(1);
            }}
            onClearAll={() => {
              setSearchTerm("");
              setSelectedPlans([]);
              setCurrentPage(1);
              filtersRef.current = { searchTerm: "", selectedPlans: [] };
              runFetch(1);
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
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(1);
                    filtersRef.current = {
                      searchTerm,
                      selectedPlans,
                    };
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
                onClick={() => runFetch(currentPage)}
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
              {isLoadingData && <CompanyTableSkeleton rows={5} />}
              {!isLoadingData &&
                paginatedPartnerships.map((partnership) => (
                  <CompanyRow key={partnership.id} partnership={partnership} />
                ))}
            </TableBody>
          </Table>

          {totalPages > 1 && filteredPartnerships.length > 0 && (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredPartnerships.length
                )}{" "}
                de {filteredPartnerships.length} empresas
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((prev) => Math.max(1, prev - 1));
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
                            setCurrentPage(1);
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
                          setCurrentPage(page);
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
                            setCurrentPage(totalPages);
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
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        );
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
