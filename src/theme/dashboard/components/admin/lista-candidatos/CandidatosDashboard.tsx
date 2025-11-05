"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidatoTable } from "./components";
import { useCandidatoDashboardData } from "./hooks";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom, FilterBar } from "@/components/ui/custom";
import type { CandidatoDashboardProps, CandidatoOverview } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { formatLocalizacao } from "./utils/formatters";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });
const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ?? null,
  to: range.to ?? null,
});

export function CandidatosDashboard({
  className,
  filters: initialFilters,
}: CandidatoDashboardProps) {
  const router = useRouter();

  const { data, isLoading, error, filters, updateFilters, loadPage } =
    useCandidatoDashboardData(initialFilters);

  const candidatos = useMemo(() => data?.candidatos ?? [], [data?.candidatos]);
  const pagination = data?.pagination;

  const [pendingSearchTerm, setPendingSearchTerm] = useState(
    filters.search ?? ""
  );
  const initialRange: DateRange = {
    from: filters.criadoDe ? new Date(filters.criadoDe) : null,
    to: filters.criadoAte ? new Date(filters.criadoAte) : null,
  };
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(
    initialRange.from || initialRange.to ? initialRange : createEmptyDateRange()
  );
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(
    initialRange.from || initialRange.to ? initialRange : createEmptyDateRange()
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  type SortField = "name" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    setPendingSearchTerm(filters.search ?? "");
    if (filters.criadoDe || filters.criadoAte) {
      const range: DateRange = {
        from: filters.criadoDe ? new Date(filters.criadoDe) : null,
        to: filters.criadoAte ? new Date(filters.criadoAte) : null,
      };
      setPendingDateRange(range);
      setAppliedDateRange(range);
    } else {
      setPendingDateRange(createEmptyDateRange());
      setAppliedDateRange(createEmptyDateRange());
    }
  }, [filters.search, filters.criadoDe, filters.criadoAte]);

  const locationOptions = useMemo(() => {
    // Only recalculate if we have candidatos and it's not the same array reference
    if (!candidatos || candidatos.length === 0) {
      return [];
    }

    const unique = new Map<string, string>();

    candidatos.forEach((candidato) => {
      const location = formatLocalizacao(candidato);
      if (!location || location === "Não informado") return;
      unique.set(location, location);
    });

    return Array.from(unique.values())
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((location) => ({ value: location, label: location }));
  }, [candidatos]); // Depend on the entire array

  useEffect(() => {
    setSelectedLocations((prev) =>
      prev.filter((location) =>
        locationOptions.some((option) => option.value === location)
      )
    );
  }, [locationOptions]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("candidateList.sort");
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
        "candidateList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const searchValidationMessage = useMemo(() => {
    const trimmed = pendingSearchTerm.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length < 3) {
      return "Informe pelo menos 3 caracteres para pesquisar.";
    }
    return null;
  }, [pendingSearchTerm]);
  const isSearchInputValid = !searchValidationMessage;
  const searchHelperText =
    "Pesquise por nome, email, CPF ou código interno (mínimo de 3 caracteres).";

  const handleViewDetails = (candidato: CandidatoOverview) => {
    router.push(`/dashboard/candidatos/${candidato.id}`);
  };

  const handlePageChange = (page: number) => {
    loadPage(page);
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "dateRange",
        label: "Data de criação",
        type: "date-range",
        placeholder: "Selecionar período",
      },
      {
        key: "location",
        label: "Localização",
        mode: "multiple",
        options: locationOptions,
        placeholder: "Selecionar localização",
      },
    ],
    [locationOptions] // Depend on the entire array
  );

  const filterValues = useMemo(
    () => ({
      dateRange: pendingDateRange,
      location: selectedLocations,
    }),
    [pendingDateRange, selectedLocations]
  );

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const trimmed = value.trim();
      if (trimmed.length > 0 && trimmed.length < 3) {
        return;
      }

      setPendingSearchTerm(value);
      const appliedRange = cloneDateRange(pendingDateRange);
      setAppliedDateRange(appliedRange);
      updateFilters({
        search: trimmed.length > 0 ? trimmed : undefined,
        criadoDe: appliedRange.from
          ? new Date(appliedRange.from).toISOString()
          : undefined,
        criadoAte: appliedRange.to
          ? new Date(appliedRange.to).toISOString()
          : undefined,
        page: 1,
      });
    },
    [pendingSearchTerm, pendingDateRange, updateFilters]
  );

  const handleClearAll = useCallback(() => {
    setPendingSearchTerm("");
    setPendingDateRange(createEmptyDateRange());
    setAppliedDateRange(createEmptyDateRange());
    setSelectedLocations([]);
    updateFilters({
      search: undefined,
      page: 1,
    });
  }, [updateFilters]);

  const currentPage = pagination?.page ?? filters.page ?? 1;
  const pageSize = pagination?.pageSize ?? filters.pageSize ?? 10;
  const rawTotalItems = pagination?.total ?? candidatos.length;
  const totalPages = Math.max(
    1,
    pagination?.totalPages ?? (Math.ceil(rawTotalItems / pageSize) || 1)
  );

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

  const sortedCandidatos = useMemo(() => {
    const list = [...candidatos];
    if (sortField === "name") {
      list.sort((a, b) => {
        const aName = a.nomeCompleto?.toLocaleLowerCase?.() ?? "";
        const bName = b.nomeCompleto?.toLocaleLowerCase?.() ?? "";
        const cmp = aName.localeCompare(bName, "pt-BR", {
          sensitivity: "base",
        });
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [candidatos, sortField, sortDirection]);

  const filteredCandidatos = useMemo(() => {
    const fromDate = appliedDateRange.from
      ? new Date(appliedDateRange.from)
      : null;
    const toDate = appliedDateRange.to ? new Date(appliedDateRange.to) : null;

    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
    }
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    return sortedCandidatos.filter((candidato) => {
      if (
        selectedLocations.length > 0 &&
        !selectedLocations.includes(formatLocalizacao(candidato))
      ) {
        return false;
      }

      if (fromDate || toDate) {
        const createdAt = candidato.criadoEm
          ? new Date(candidato.criadoEm)
          : null;
        if (!createdAt) return false;

        if (fromDate && createdAt < fromDate) return false;
        if (toDate && createdAt > toDate) return false;
      }

      return true;
    });
  }, [sortedCandidatos, appliedDateRange, selectedLocations]);

  const displayedCount = filteredCandidatos.length;
  const isDateFiltered = Boolean(appliedDateRange.from || appliedDateRange.to);
  const totalItems = isDateFiltered ? displayedCount : rawTotalItems;
  const startItem =
    totalItems === 0
      ? 0
      : isDateFiltered
      ? 1
      : Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem =
    totalItems === 0
      ? 0
      : isDateFiltered
      ? displayedCount
      : Math.min(currentPage * pageSize, totalItems);
  const showPagination = !isDateFiltered && totalPages > 1;

  const toggleSortByName = useCallback(() => {
    setSortField((prev) => {
      if (prev !== "name") {
        setSortDirection("asc");
        return "name";
      }
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
      return prev;
    });
  }, []);

  const setSortByName = useCallback((direction: SortDirection) => {
    setSortField("name");
    setSortDirection(direction);
  }, []);

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar candidatos: {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="border-b border-gray-200">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "dateRange") {
                const range = value
                  ? cloneDateRange(value as DateRange)
                  : createEmptyDateRange();
                setPendingDateRange(range);
                setAppliedDateRange(range);
                updateFilters({
                  criadoDe: range.from
                    ? new Date(range.from).toISOString()
                    : undefined,
                  criadoAte: range.to
                    ? new Date(range.to).toISOString()
                    : undefined,
                  page: 1,
                });
              } else if (key === "location") {
                setSelectedLocations(Array.isArray(value) ? value : []);
              }
            }}
            onClearAll={handleClearAll}
            search={{
              label: "Pesquisar candidato",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por nome, email, CPF ou código...",
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
                variant="ghost"
                size="lg"
                onClick={() => handleSearchSubmit()}
                disabled={isLoading || !isSearchInputValid}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {!isLoading && filteredCandidatos.length === 0 ? (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <CandidatoTable
            candidatos={filteredCandidatos}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSortName={toggleSortByName}
            onSetSortName={setSortByName}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <CandidatoTable
            candidatos={filteredCandidatos}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSortName={toggleSortByName}
            onSetSortName={setSortByName}
          />
        </div>

        {(isLoading || totalItems > 0 || isDateFiltered) && (
          <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              {totalItems === 0
                ? "Nenhum candidato listado"
                : `Mostrando ${startItem} a ${endItem} de ${totalItems} candidato${
                    totalItems === 1 ? "" : "s"
                  }`}
            </div>

            {showPagination && (
              <div className="flex items-center gap-2">
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
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
                      disabled={isLoading}
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
                    disabled={isLoading}
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
                      variant={
                        currentPage === totalPages ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="h-8 w-8 p-0"
                      disabled={isLoading}
                    >
                      {totalPages}
                    </ButtonCustom>
                  </>
                )}

                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
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
