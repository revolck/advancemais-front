"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import {
  listInstrutores,
  type Instrutor,
  type ListInstrutoresParams,
} from "@/api/usuarios";
import { InstrutorRow } from "./components/InstrutorRow";
import { InstrutorTableSkeleton } from "./components/InstrutorTableSkeleton";
import type { SelectOption } from "@/components/ui/custom/select";
import type { FilterField } from "@/components/ui/custom/filters";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT =
  "Pesquise por nome, email, CPF ou código do instrutor.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function InstrutoresDashboard({ className }: { className?: string }) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 5000);
  }, []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCidades, setSelectedCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });

  // Estados de ordenação
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const statusOptions: SelectOption[] = useMemo(() => [
    { value: "ATIVO", label: "Ativo" },
    { value: "INATIVO", label: "Inativo" },
    { value: "BLOQUEADO", label: "Bloqueado" },
  ], []);

  // Extrai opções de localização dos instrutores carregados
  const cidadesOptions: SelectOption[] = useMemo(() => {
    const localizacoes = new Set<string>();
    instrutores.forEach((instrutor) => {
      if (instrutor.cidade && instrutor.estado) {
        localizacoes.add(`${instrutor.cidade}, ${instrutor.estado}`);
      } else if (instrutor.cidade) {
        localizacoes.add(instrutor.cidade);
      } else if (instrutor.estado) {
        localizacoes.add(instrutor.estado);
      }
    });

    return Array.from(localizacoes)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((localizacao) => ({ value: localizacao, label: localizacao }));
  }, [instrutores]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const runFetch = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        // Fallback de paginação no frontend:
        // alguns ambientes podem devolver sempre a mesma página no backend.
        // Carregamos um lote maior e paginamos localmente para manter a navegação consistente.
        const params: ListInstrutoresParams = { page: 1, limit: 200 };

        // API aceita apenas um valor por filtro, então enviamos o primeiro selecionado
        if (selectedStatuses.length > 0) {
          params.status = selectedStatuses[0] as any;
        }
        if (appliedSearchTerm && appliedSearchTerm.length >= 3) {
          params.search = appliedSearchTerm;
        }

        const response = await listInstrutores(params);
        let filteredInstrutores = response.data || [];

        // Filtro de localização (lado do cliente, pois a API pode não suportar)
        if (selectedCidades.length > 0) {
          filteredInstrutores = filteredInstrutores.filter((instrutor) => {
            const localizacao = instrutor.cidade && instrutor.estado
              ? `${instrutor.cidade}, ${instrutor.estado}`
              : instrutor.cidade || instrutor.estado || "";
            
            return selectedCidades.some((selected) => localizacao === selected);
          });
        }

        setInstrutores(filteredInstrutores);
        
        const pageSize = 10;
        const totalFiltered = filteredInstrutores.length;
        const pagesFiltered = Math.max(1, Math.ceil(totalFiltered / pageSize));
        setPagination({
          page: 1,
          pageSize,
          total: totalFiltered,
          pages: pagesFiltered,
        });

        setLoading(false);
      } catch (err: any) {
        let errorMessage = "Erro ao carregar instrutores";
        if (err.status === 404) {
          errorMessage =
            "Rota não encontrada. Verifique se o backend está rodando.";
        } else if (err.status === 401) {
          errorMessage = "Não autenticado. Faça login novamente.";
        } else if (err.status === 403) {
          errorMessage = "Sem permissão para acessar esta funcionalidade.";
        } else if (err.status === 500) {
          errorMessage = "Erro interno do servidor (500).";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setInstrutores([]);
        setLoading(false);
      }
    },
    [selectedStatuses, appliedSearchTerm, selectedCidades]
  );

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;
      const trimmedValue = value.trim();
      setPendingSearchTerm(value);
      setAppliedSearchTerm(trimmedValue);
    },
    [pendingSearchTerm]
  );

  // Carrega instrutores no mount e quando filtros mudarem
  useEffect(() => {
    runFetch();
  }, [runFetch]);

  // Limpa seleção de cidades se não estiverem mais disponíveis
  useEffect(() => {
    if (selectedCidades.length > 0 && cidadesOptions.length > 0) {
      const allowed = new Set(cidadesOptions.map((opt) => opt.value));
      const filtered = selectedCidades.filter((cidade) => allowed.has(cidade));
      if (filtered.length !== selectedCidades.length) {
        setSelectedCidades(filtered);
      }
    }
  }, [cidadesOptions, selectedCidades]);

  // Persistir ordenação no localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("instrutoresList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as { dir: SortDirection };
        if (parsed.dir) setSortDirection(parsed.dir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "instrutoresList.sort",
        JSON.stringify({ dir: sortDirection })
      );
    } catch {}
  }, [sortDirection]);

  // Ordenar instrutores
  const sortedInstrutores = useMemo(() => {
    const sorted = [...instrutores];
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
  }, [instrutores, sortDirection]);

  const paginatedInstrutores = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedInstrutores.slice(start, end);
  }, [pagination.page, pagination.pageSize, sortedInstrutores]);

  // Páginas visíveis para navegação
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const totalPages = pagination.pages;
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
  }, [pagination.page, pagination.pages]);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: statusOptions,
        placeholder: "Selecione status",
      },
      {
        key: "localizacao",
        label: "Localização",
        mode: "multiple",
        options: cidadesOptions,
        placeholder: "Selecione localização",
      },
    ],
    [statusOptions, cidadesOptions]
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      localizacao: selectedCidades,
    }),
    [selectedStatuses, selectedCidades]
  );

  const handlePageChange = useCallback((nextPage: number) => {
    setPagination((prev) => {
      const page = Math.max(1, Math.min(nextPage, Math.max(1, prev.pages)));
      if (page === prev.page) return prev;
      return { ...prev, page };
    });
  }, []);

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "status") {
                setSelectedStatuses(
                  Array.isArray(value) ? (value as string[]) : []
                );
              } else if (key === "localizacao") {
                setSelectedCidades(
                  Array.isArray(value) ? (value as string[]) : []
                );
              }
            }}
            search={{
              label: "Pesquisar instrutor",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Nome, email, CPF...",
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
                disabled={loading || !isSearchInputValid}
                fullWidth
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between">
            <span>Erro ao carregar instrutores: {error}</span>
                  <ButtonCustom size="sm" variant="ghost" onClick={() => runFetch()}>
                    Tentar novamente
                  </ButtonCustom>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Instrutor
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Telefone
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16">{/* ação */}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <InstrutorTableSkeleton rows={10} />
              </TableBody>
            </Table>
          </div>
        </div>
      ) : !error && instrutores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="fileNotFound"
            illustrationAlt="Nenhum instrutor encontrado"
            title="Nenhum instrutor encontrado"
            description="Não encontramos instrutores com os filtros aplicados. Tente ajustar sua busca."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    <div className="flex items-center gap-1">
                      <span>Instrutor</span>
                      <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar A → Z"
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
                          <TooltipContent sideOffset={6}>A → Z</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Ordenar Z → A"
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
                          <TooltipContent sideOffset={6}>Z → A</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Telefone
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16">{/* ação */}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInstrutores.map((instrutor) => (
                  <InstrutorRow 
                    key={instrutor.id} 
                    instrutor={instrutor}
                    isDisabled={isNavigating}
                    onNavigateStart={handleNavigateStart}
                  />
                ))}
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
                  {pagination.total === 1 ? "instrutor" : "instrutores"}
                </span>
              </div>

              {pagination.pages > 1 && (
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

                  {visiblePages[visiblePages.length - 1] < pagination.pages && (
                    <>
                      {visiblePages[visiblePages.length - 1] <
                        pagination.pages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          pagination.page === pagination.pages
                            ? "primary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pagination.pages)}
                        className="h-8 w-8 p-0"
                      >
                        {pagination.pages}
                      </ButtonCustom>
                    </>
                  )}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
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

export default InstrutoresDashboard;
