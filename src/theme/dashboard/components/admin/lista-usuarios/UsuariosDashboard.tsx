"use client";

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { UsuarioTable } from "./components";
import { useUsuarioDashboardData } from "./hooks";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import Link from "next/link";
import type { UsuarioDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  STATUS_OPTIONS,
  ROLE_OPTIONS,
  MIN_SEARCH_LENGTH,
  SEARCH_HELPER_TEXT,
} from "./constants";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function UsuariosDashboard({
  className,
  filters: initialFilters,
}: UsuarioDashboardProps) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    filters,
    updateFilters,
    loadPage,
  } = useUsuarioDashboardData(initialFilters);

  const usuarios = useMemo(() => data?.usuarios ?? [], [data?.usuarios]);
  const pagination = data?.pagination;

  // Estado para controlar loading imediato quando filtros mudam
  const [isFiltering, setIsFiltering] = useState(false);
  const prevFiltersRef = useRef(filters);

  // Detectar mudanças nos filtros para mostrar skeleton imediatamente
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.search !== filters.search ||
      prevFiltersRef.current.role !== filters.role ||
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.cidade !== filters.cidade ||
      prevFiltersRef.current.estado !== filters.estado ||
      prevFiltersRef.current.page !== filters.page;

    if (filtersChanged) {
      setIsFiltering(true);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Resetar isFiltering quando os dados terminarem de carregar
  useEffect(() => {
    if (!isFetching && !isLoading) {
      setIsFiltering(false);
    }
  }, [isFetching, isLoading]);

  // Estado de ordenação
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Estado de navegação global
  const [isNavigating, setIsNavigating] = useState(false);
  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 5000);
  }, []);

  const [pendingSearchTerm, setPendingSearchTerm] = useState(
    filters.search ?? ""
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCidades, setSelectedCidades] = useState<string[]>([]);
  const [cidadesOptions, setCidadesOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  useEffect(() => {
    setPendingSearchTerm(filters.search ?? "");
  }, [filters.search]);

  // Sincronizar estados locais com filtros quando filtros são limpos
  useEffect(() => {
    if (!filters.role) {
      setSelectedRoles([]);
    }
    if (!filters.status) {
      setSelectedStatuses([]);
    }
    if (!filters.cidade) {
      setSelectedCidades([]);
    }
  }, [filters.role, filters.status, filters.cidade]);

  // Extrair cidades únicas dos usuários
  useEffect(() => {
    const cidades = Array.from(
      new Set(
        usuarios
          .map((usuario) => usuario.cidade)
          .filter((cidade): cidade is string => !!cidade)
      )
    ).sort();

    const options = cidades.map((cidade) => ({
      value: cidade,
      label: cidade,
    }));
    setCidadesOptions(options);
  }, [usuarios]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;
      const trimmedValue = value.trim();
      setIsFiltering(true); // Ativar loading imediatamente
      updateFilters({ search: trimmedValue });
    },
    [pendingSearchTerm, updateFilters]
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "role",
        label: "Função",
        mode: "multiple",
        options: ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
        placeholder: "Selecionar funções",
      },
      {
        key: "cidade",
        label: "Localização",
        mode: "multiple",
        options: cidadesOptions,
        placeholder: "Selecionar localização",
      },
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: STATUS_OPTIONS.map((s) => ({
          value: s.value,
          label: s.label,
        })),
        placeholder: "Selecionar status",
      },
    ],
    [cidadesOptions]
  );

  const filterValues = useMemo(
    () => ({
      role: selectedRoles,
      cidade: selectedCidades,
      status: selectedStatuses,
    }),
    [selectedRoles, selectedCidades, selectedStatuses]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | DateRange | null) => {
      setIsFiltering(true); // Ativar loading imediatamente
      if (key === "role") {
        const roles = (value as string[]) || [];
        setSelectedRoles(roles);
        // Se não há seleção, remove o filtro (undefined para não enviar à API)
        updateFilters({ role: roles.length > 0 ? (roles[0] as any) : undefined });
      } else if (key === "cidade") {
        const cidades = (value as string[]) || [];
        setSelectedCidades(cidades);
        // Se não há seleção, remove o filtro
        updateFilters({ cidade: cidades.length > 0 ? cidades[0] : undefined });
      } else if (key === "status") {
        const statuses = (value as string[]) || [];
        setSelectedStatuses(statuses);
        // Se não há seleção, remove o filtro
        updateFilters({ status: statuses.length > 0 ? statuses[0] : undefined });
      }
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || (pagination && page > pagination.totalPages)) return;
      setIsFiltering(true); // Ativar loading imediatamente
      loadPage(page);
    },
    [loadPage, pagination]
  );

  // Ordenar usuários
  const sortedUsuarios = useMemo(() => {
    const sorted = [...usuarios];
    sorted.sort((a, b) => {
      const nameA = (a.nomeCompleto || a.id).toLowerCase();
      const nameB = (b.nomeCompleto || b.id).toLowerCase();
      if (sortDirection === "asc") {
        return nameA.localeCompare(nameB, "pt-BR");
      } else {
        return nameB.localeCompare(nameA, "pt-BR");
      }
    });
    return sorted;
  }, [usuarios, sortDirection]);

  // Mostrar skeleton quando está carregando inicialmente OU quando está filtrando
  const showLoading = isLoading || (isFiltering && isFetching);
  const showEmptyState = !showLoading && !isFetching && usuarios.length === 0;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.total ?? 0;
  const pageSize = pagination?.pageSize ?? 10;

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      {/* Barra de filtros */}

      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          asChild
        >
          <Link href="/dashboard/usuarios/cadastrar">Adicionar usuário</Link>
        </ButtonCustom>
      </div>
      <div className="border-b border-gray-200">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={handleFilterChange}
            search={{
              label: "Pesquisar usuário",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por nome, e-mail ou código...",
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
              <div className="flex gap-2 flex-col md:flex-row md:w-full xl:w-auto">
                <ButtonCustom
                  variant="primary"
                  size="lg"
                  onClick={() => handleSearchSubmit()}
                  disabled={isLoading || !isSearchInputValid}
                  className="md:w-full xl:w-auto"
                >
                  Pesquisar
                </ButtonCustom>
              </div>
            }
          />
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela com paginação integrada */}
      {!showEmptyState && (
        <UsuarioTable
          usuarios={sortedUsuarios}
          isLoading={showLoading}
          pageSize={pageSize}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
          pagination={
            pagination
              ? {
                  page: currentPage,
                  pageSize,
                  total: totalItems,
                  totalPages,
                }
              : undefined
          }
          onPageChange={handlePageChange}
          visiblePages={visiblePages}
          isNavigating={isNavigating}
          onNavigateStart={handleNavigateStart}
        />
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt="Nenhum usuário encontrado"
            title="Nenhum usuário encontrado"
            description="Não encontramos usuários com os filtros aplicados. Tente ajustar sua busca."
          />
        </div>
      )}
    </div>
  );
}
