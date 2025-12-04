"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonCustom, FilterBar, EmptyState } from "@/components/ui/custom";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useInstrutoresForSelect } from "./hooks/useInstrutoresForSelect";
import { useTurmasDashboardQuery } from "./hooks/useTurmasDashboardQuery";
import { TurmaRow } from "./components/TurmaRow";
import { TurmaTableSkeleton } from "./components/TurmaTableSkeleton";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";

const TURMA_STATUS_OPTIONS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "PUBLICADO", label: "Publicado" },
  { value: "INSCRICOES_ABERTAS", label: "Inscrições abertas" },
  { value: "INSCRICOES_ENCERRADAS", label: "Inscrições encerradas" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "SUSPENSO", label: "Suspenso" },
  { value: "CANCELADO", label: "Cancelado" },
];

const TURNO_OPTIONS = [
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
  { value: "INTEGRAL", label: "Integral" },
];

const METODO_OPTIONS = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "LIVE", label: "Ao vivo" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
];

const SEARCH_HELPER_TEXT = "Pesquise por nome ou código da turma.";

export function TurmasDashboard({ className }: { className?: string }) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTurnos, setSelectedTurnos] = useState<string[]>([]);
  const [selectedMetodos, setSelectedMetodos] = useState<string[]>([]);
  const [selectedInstrutorId, setSelectedInstrutorId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigateStart = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 5000);
  }, []);
  
  // Pagination
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sorting
  type SortField = "nome" | "dataInicio" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { instrutores, isLoading: loadingInstrutores } = useInstrutoresForSelect();
  const turmasQuery = useTurmasDashboardQuery({ cursoId: selectedCourseId });
  const turmas = useMemo(() => turmasQuery.data ?? [], [turmasQuery.data]);
  const isLoading = turmasQuery.status === "pending";
  const isFetching = turmasQuery.isFetching;
  const errorMessage =
    turmasQuery.status === "error"
      ? turmasQuery.error?.message ?? "Não foi possível carregar as turmas."
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
      setCurrentPage(1); // Reset para página 1 ao buscar
    },
    [pendingSearchTerm]
  );

  // Sorting functions
  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset para página 1 ao ordenar
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
    setCurrentPage(1); // Reset para página 1 ao ordenar
  }, []);

  // Persist sort
  useEffect(() => {
    try {
      const stored = localStorage.getItem("turmaList.sort");
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
        "turmaList.sort",
        JSON.stringify({ field: sortField, dir: sortDirection })
      );
    } catch {}
  }, [sortField, sortDirection]);

  const sortList = useCallback(
    <T extends { nome?: string; dataInicio?: string | null }>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "nome") {
          const aNome = a.nome?.toLocaleLowerCase?.() ?? "";
          const bNome = b.nome?.toLocaleLowerCase?.() ?? "";
          const cmp = aNome.localeCompare(bNome, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        if (sortField === "dataInicio") {
          const aTime = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
          const bTime = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;
          const cmp = aTime - bTime;
          return sortDirection === "asc" ? cmp : -cmp;
        }
        return 0;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  const filteredTurmas = useMemo(() => {
    let filtered = turmas;

    // Aplica busca por nome ou código
    if (normalizedSearch) {
      const searchLower = normalizedSearch.toLowerCase();
      filtered = filtered.filter((t) => {
        const nomeMatch = t.nome?.toLowerCase().includes(searchLower) ?? false;
        const codigoMatch = t.codigo?.toLowerCase().includes(searchLower) ?? false;
        return nomeMatch || codigoMatch;
      });
    }

    // Aplica filtros
    filtered = filtered.filter((t) => {
      const okStatus = selectedStatuses.length === 0 || (t.status && selectedStatuses.includes(t.status));
      const okTurno = selectedTurnos.length === 0 || (t.turno && selectedTurnos.includes(t.turno));
      const okMetodo = selectedMetodos.length === 0 || (t.metodo && selectedMetodos.includes(t.metodo));
      const okInstrutor =
        !selectedInstrutorId || t.instrutor?.id === selectedInstrutorId;
      return okStatus && okTurno && okMetodo && okInstrutor;
    });

    // Aplica ordenação
    return sortList(filtered);
  }, [turmas, normalizedSearch, selectedStatuses, selectedTurnos, selectedMetodos, selectedInstrutorId, sortList]);

  // Paginação
  const totalItems = filteredTurmas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTurmas = filteredTurmas.slice(startIndex, endIndex);

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

  const handlePageChange = useCallback((page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
  }, [totalPages]);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearchTerm, selectedCourseId, selectedStatuses, selectedTurnos, selectedMetodos, selectedInstrutorId]);

  // Ajusta página atual se necessário (ex: se estiver na página 5 e só houver 2 páginas)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const shouldShowSkeleton =
    isLoading || (isFetching && turmas.length === 0);
  const canDisplayTable =
    !hasError &&
    (shouldShowSkeleton || filteredTurmas.length > 0);
  const showEmptyState =
    !hasError && !shouldShowSkeleton && filteredTurmas.length === 0;

  // Ordem dos campos: curso, status na primeira linha; turno, método, instrutor na segunda
  const filterFields: FilterField[] = useMemo(
    () => [
      { key: "curso", label: "Curso", options: cursos, placeholder: loadingCursos ? "Carregando..." : "Selecionar" },
      { key: "status", label: "Status", mode: "multiple", options: TURMA_STATUS_OPTIONS, placeholder: "Selecionar" },
      { key: "turno", label: "Turno", mode: "multiple", options: TURNO_OPTIONS, placeholder: "Selecionar" },
      { key: "metodo", label: "Método", mode: "multiple", options: METODO_OPTIONS, placeholder: "Selecionar" },
      { key: "instrutor", label: "Instrutor", options: instrutores, placeholder: loadingInstrutores ? "Carregando..." : "Selecionar" },
    ],
    [cursos, loadingCursos, instrutores, loadingInstrutores]
  );

  const filterValues = useMemo(
    () => ({ 
      curso: selectedCourseId, 
      status: selectedStatuses, 
      turno: selectedTurnos, 
      metodo: selectedMetodos,
      instrutor: selectedInstrutorId,
    }),
    [selectedCourseId, selectedStatuses, selectedTurnos, selectedMetodos, selectedInstrutorId]
  );

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      {/* Top actions */}
      <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
        <ButtonCustom variant="primary" size="md" icon="Plus" fullWidth className="sm:w-auto" asChild>
          <Link href="/dashboard/cursos/turmas/cadastrar">Cadastrar turma</Link>
        </ButtonCustom>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="lg:grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1.5fr)_auto] [&>div>*:nth-child(1)]:lg:col-span-1 [&>div>*:nth-child(2)]:lg:col-span-1 [&>div>*:nth-child(3)]:lg:col-span-1 [&>div>*:nth-child(4)]:lg:row-start-2 [&>div>*:nth-child(4)]:lg:col-start-1 [&>div>*:nth-child(5)]:lg:row-start-2 [&>div>*:nth-child(5)]:lg:col-start-2 [&>div>*:nth-child(6)]:lg:row-start-2 [&>div>*:nth-child(6)]:lg:col-start-3 [&>div>*:nth-child(7)]:lg:row-start-2 [&>div>*:nth-child(7)]:lg:col-start-4"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "curso") {
                setSelectedCourseId((value as string) || null);
                setCurrentPage(1);
              }
              if (key === "status") {
                setSelectedStatuses(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
              if (key === "turno") {
                setSelectedTurnos(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
              if (key === "metodo") {
                setSelectedMetodos(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
              if (key === "instrutor") {
                setSelectedInstrutorId((value as string) || null);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedCourseId(null);
              setSelectedStatuses([]);
              setSelectedTurnos([]);
              setSelectedMetodos([]);
              setSelectedInstrutorId(null);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar turma",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar por nome ou código...",
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
              onClick={() => turmasQuery.refetch()}
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
                    className="font-medium text-gray-700 py-4"
                    aria-sort={
                      sortField === "nome"
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
                            onClick={() => toggleSort("nome")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "nome" && "text-gray-900"
                            )}
                          >
                            Turma
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "nome"
                            ? sortDirection === "asc"
                              ? "A → Z"
                              : "Z → A"
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
                                setSort("nome", "asc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "nome" &&
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
                                setSort("nome", "desc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "nome" &&
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
                  {!selectedCourseId && (
                    <TableHead className="font-medium text-gray-700">Curso</TableHead>
                  )}
                  <TableHead className="font-medium text-gray-700">Turno/Método</TableHead>
                  <TableHead className="font-medium text-gray-700">Status</TableHead>
                  <TableHead
                    className="font-medium text-gray-700"
                    aria-sort={
                      sortField === "dataInicio"
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
                            onClick={() => toggleSort("dataInicio")}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                              sortField === "dataInicio" && "text-gray-900"
                            )}
                          >
                            Período
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {sortField === "dataInicio"
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
                                setSort("dataInicio", "desc");
                              }}
                            >
                              <ChevronUp
                                className={cn(
                                  "h-3 w-3 text-gray-400",
                                  sortField === "dataInicio" &&
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
                                setSort("dataInicio", "asc");
                              }}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 text-gray-400 -mt-0.5",
                                  sortField === "dataInicio" &&
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
                  <TableHead className="font-medium text-gray-700 text-center">Vagas</TableHead>
                  <TableHead className="font-medium text-gray-700">Instrutor</TableHead>
                  <TableHead className="font-medium text-gray-700"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shouldShowSkeleton ? (
                  <TurmaTableSkeleton rows={8} />
                ) : (
                  paginatedTurmas.map((t) => (
                    <TurmaRow 
                      key={t.id} 
                      turma={t} 
                      showCurso={!selectedCourseId}
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
                    Mostrando{" "}
                    {Math.min(startIndex + 1, totalItems)}{" "}
                    a {Math.min(endIndex, totalItems)}{" "}
                    de {totalItems} turma{totalItems === 1 ? "" : "s"}
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
                          variant={
                            currentPage === 1 ? "primary" : "outline"
                          }
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
                        variant={
                          currentPage === page ? "primary" : "outline"
                        }
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
                            currentPage === totalPages
                              ? "primary"
                              : "outline"
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
            illustrationAlt="Ilustração de turmas"
            title="Nenhuma turma encontrada"
            description={
              selectedCourseId
                ? "Nenhuma turma encontrada para os filtros aplicados. Tente ajustar sua busca."
                : "Nenhuma turma cadastrada no sistema."
            }
          />
        </div>
      )}
    </div>
  );
}

export default TurmasDashboard;
