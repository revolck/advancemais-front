"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTurmasForSelect } from "./hooks/useTurmasForSelect";
import { useProvasDashboardQuery } from "./hooks/useProvasDashboardQuery";
import { AtividadeProvaRow } from "./components/AtividadeProvaRow";
import { AtividadeProvaTableSkeleton } from "./components/AtividadeProvaTableSkeleton";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";

const PROVA_STATUS_OPTIONS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "PUBLICADA", label: "Publicada" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
];

const SEARCH_HELPER_TEXT = "Pesquise pelo título da atividade/prova.";

export function AtividadesProvasDashboard({ className }: { className?: string }) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 5000);
  }, []);

  // Pagination
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting - Padrão: ordenar por data de criação (mais novo primeiro)
  type SortField = "titulo" | "criadoEm" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("criadoEm"); // Padrão: ordenar por criação
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // Padrão: mais novo primeiro

  const { turmas, rawData, isLoading: loadingTurmas } = useTurmasForSelect();
  
  // Extrair cursoId da turma selecionada se houver
  const selectedTurma = useMemo(() => {
    if (!selectedTurmaId || !turmas) return null;
    return turmas.find((t) => t.value === selectedTurmaId);
  }, [selectedTurmaId, turmas]);

  // Buscar cursoId do rawData
  const selectedTurmaRaw = useMemo(() => {
    if (!selectedTurmaId || !rawData) return null;
    return rawData.find((t) => t.id === selectedTurmaId);
  }, [selectedTurmaId, rawData]);

  const provasQuery = useProvasDashboardQuery({
    turmaId: selectedTurmaId,
    cursoId: selectedTurmaRaw?.cursoId || null,
    search: appliedSearchTerm || undefined,
    page: currentPage,
    pageSize,
    orderBy: sortField || "titulo", // Padrão: ordenar por título
    order: sortDirection, // Padrão: DESC (mais novo primeiro)
  });
  const provas = useMemo(() => provasQuery.data?.data ?? [], [provasQuery.data]);
  const pagination = provasQuery.data?.pagination;
  const isLoading = provasQuery.status === "pending";
  const isFetching = provasQuery.isFetching;
  const errorMessage =
    provasQuery.status === "error"
      ? provasQuery.error?.message ?? "Não foi possível carregar as atividades/provas."
      : null;
  const hasError = Boolean(errorMessage);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;
  const searchHelperText = SEARCH_HELPER_TEXT;

  const normalizedSearch = useMemo(
    () =>
      getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH
      ),
    [appliedSearchTerm]
  );

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;
      const trimmedValue = value.trim();
      setPendingSearchTerm(value);
      setAppliedSearchTerm(trimmedValue);
      setCurrentPage(1);
    },
    [pendingSearchTerm]
  );

  // Sorting functions
  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    if (field === null) return;
    setSortField((prev) => {
      if (prev !== field) {
        setSortDirection("asc");
        return field;
      }
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
    setCurrentPage(1);
  }, []);

  // Persist sort - Carregar do localStorage, mas usar padrão se não existir
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atividadeProvaList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as {
          field: SortField;
          dir: SortDirection;
        };
        // Só aplicar se houver valores válidos no localStorage
        if (parsed.field !== null && parsed.field !== undefined) {
          setSortField(parsed.field);
        }
        if (parsed.dir) {
          setSortDirection(parsed.dir);
      }
      }
      // Se não houver no localStorage, os valores padrão já estão definidos acima
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "atividadeProvaList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const sortList = useCallback(
    <T extends { titulo?: string; criadoEm?: string | null }>(list: T[]) => {
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
        if (sortField === "criadoEm") {
          const aTime = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
          const bTime = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
          const cmp = aTime - bTime;
          return sortDirection === "asc" ? cmp : -cmp;
        }
        return 0;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // A API já faz paginação, filtros, busca e ordenação no backend
  // Não precisa ordenar client-side, a API já retorna ordenado conforme orderBy e order
  const filteredProvas = provas; // A API já retorna ordenado

  // Usa paginação da API ao invés de client-side
  const totalItems = pagination?.total ?? filteredProvas.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedProvas = filteredProvas; // A API já retorna apenas os itens da página atual

  // Páginas visíveis para paginação
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

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      console.log("[PAGINATION] Mudando página:", { de: currentPage, para: nextPage, totalPages });
      setCurrentPage(nextPage);
    },
    [currentPage, totalPages]
  );

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, selectedTurmaId, selectedStatuses]);

  // Ajusta página atual se necessário (apenas se totalPages mudou e currentPage está fora do range)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages]); // Removido currentPage das dependências para evitar loop

  const shouldShowSkeleton = isLoading || (isFetching && provas.length === 0);
  const canDisplayTable = !hasError && (shouldShowSkeleton || filteredProvas.length > 0);
  const showEmptyState = !hasError && !shouldShowSkeleton && filteredProvas.length === 0;

  // Ordem dos campos: turma na primeira linha; modalidade, status, obrigatoria na segunda
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "turmaId",
        label: "Turma",
        options: turmas,
        placeholder: loadingTurmas ? "Carregando..." : "Selecionar",
      },
      {
        key: "status",
        label: "Status",
        mode: "multiple" as const,
        options: PROVA_STATUS_OPTIONS,
        placeholder: "Selecionar",
      },
    ],
    [turmas, loadingTurmas]
  );

  const filterValues = useMemo(
    () => ({
      turmaId: selectedTurmaId,
      status: selectedStatuses,
    }),
    [selectedTurmaId, selectedStatuses]
  );

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      {/* Top actions */}
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom
          variant="primary"
          size="md"
          icon="Plus"
          fullWidth
          className="sm:w-auto"
          asChild
        >
          <Link href="/dashboard/cursos/atividades-provas/cadastrar">Nova Atividade/Prova</Link>
        </ButtonCustom>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="lg:grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1.5fr)_auto] [&>div>*:nth-child(2)]:lg:col-start-2 [&>div>*:nth-child(2)]:lg:col-end-4 [&>div>*:nth-child(3)]:lg:row-start-2 [&>div>*:nth-child(3)]:lg:col-start-1 [&>div>*:nth-child(4)]:lg:row-start-2 [&>div>*:nth-child(4)]:lg:col-start-2 [&>div>*:nth-child(5)]:lg:row-start-2 [&>div>*:nth-child(5)]:lg:col-start-3 [&>div>*:nth-child(6)]:lg:row-start-2 [&>div>*:nth-child(6)]:lg:col-start-4"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "turmaId") {
                setSelectedTurmaId((value as string) || null);
                setCurrentPage(1);
              }
              if (key === "status") {
                setSelectedStatuses(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedTurmaId(null);
              setSelectedStatuses([]);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar atividade/prova",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por título...",
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
                variant="primary"
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

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => provasQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {canDisplayTable && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead
                    className="font-medium text-gray-700 py-4 px-3"
                    aria-sort={
                      sortField === "titulo"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("titulo")}
                            className={cn(
                              "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "titulo" && "text-gray-900"
                            )}
                          >
                            Prova
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "titulo"
                            ? sortDirection === "asc"
                              ? "A → Z"
                              : "Z → A"
                            : "Ordenar por título"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex flex-col -space-y-1.5 items-center leading-none">
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
                  {!selectedTurmaId && (
                    <TableHead className="font-medium text-gray-700 py-4 px-3">Turma</TableHead>
                  )}
                  <TableHead className="font-medium text-gray-700 py-4 px-3">Curso</TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">Status</TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">Data</TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-center whitespace-nowrap">Peso</TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-center whitespace-nowrap">Vale Ponto</TableHead>
                  <TableHead
                    className="font-medium text-gray-700 py-4 px-2 whitespace-nowrap"
                    aria-sort={
                      sortField === "criadoEm"
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleSort("criadoEm")}
                            className={cn(
                              "inline-flex items-center gap-1 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "criadoEm" && "text-gray-900"
                            )}
                          >
                            Criado em
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "criadoEm"
                            ? sortDirection === "asc"
                              ? "Mais antiga → mais nova"
                              : "Mais nova → mais antiga"
                            : "Ordenar por data"}
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex flex-col -space-y-1.5 items-center leading-none">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                              aria-label="Mais nova → mais antiga"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSort("criadoEm", "desc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "criadoEm" &&
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
                                setSort("criadoEm", "asc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "criadoEm" &&
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
                  <TableHead className="font-medium text-gray-700 py-4 pl-1 pr-3 text-right w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shouldShowSkeleton ? (
                  <AtividadeProvaTableSkeleton rows={8} />
                ) : (
                  paginatedProvas.map((prova) => (
                    <AtividadeProvaRow
                      key={prova.id}
                      aula={prova}
                      showTurma={!selectedTurmaId}
                      isDisabled={isNavigating}
                      onNavigateStart={handleNavigateStart}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginação */}
            {totalItems > 0 && (
              <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {(() => {
                      const startIndex = pagination 
                        ? (pagination.page - 1) * pagination.pageSize + 1
                        : 1;
                      const endIndex = pagination
                        ? Math.min(pagination.page * pagination.pageSize, totalItems)
                        : Math.min(pageSize, totalItems);
                      return `Mostrando ${startIndex} a ${endIndex} de ${totalItems} atividade${totalItems === 1 ? "" : "s"}/prova${totalItems === 1 ? "" : "s"}`;
                    })()}
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
        </div>
      )}

      {showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de aulas"
            title="Nenhuma atividade/prova encontrada"
            description={
              selectedTurmaId
                ? "Nenhuma atividade/prova encontrada para os filtros aplicados. Tente ajustar sua busca."
                : "Nenhuma atividade/prova cadastrada no sistema."
            }
          />
        </div>
      )}
    </div>
  );
}

export default AtividadesProvasDashboard;
