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
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useInstrutoresForSelect } from "./hooks/useInstrutoresForSelect";
import {
  useAvaliacoesDashboardQuery,
  type AvaliacaoListItem,
} from "./hooks/useAvaliacoesDashboardQuery";
import { AtividadeProvaRow } from "./components/AtividadeProvaRow";
import { AtividadeProvaTableSkeleton } from "./components/AtividadeProvaTableSkeleton";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import type { AvaliacaoStatus, AvaliacaoTipo, AvaliacaoTipoAtividade } from "@/api/cursos";
import type { DateRange } from "@/components/ui/custom/date-picker";

const PROVA_STATUS_OPTIONS: { value: AvaliacaoStatus; label: string }[] = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "PUBLICADA", label: "Publicada" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
];

const PROVA_TIPO_OPTIONS: { value: AvaliacaoTipo; label: string }[] = [
  { value: "PROVA", label: "Prova" },
  { value: "ATIVIDADE", label: "Atividade" },
];

const TIPO_ATIVIDADE_OPTIONS: { value: AvaliacaoTipoAtividade; label: string }[] = [
  { value: "QUESTOES", label: "Questões" },
  { value: "PERGUNTA_RESPOSTA", label: "Pergunta e Resposta" },
];

const MODALIDADE_OPTIONS: { value: string; label: string }[] = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "AO_VIVO", label: "Ao Vivo" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
];

const OBRIGATORIA_OPTIONS: { value: string; label: string }[] = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

const SEARCH_HELPER_TEXT = "Pesquise pelo título da atividade/prova.";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

const formatDateForAPI = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function AtividadesProvasDashboard({
  className,
}: {
  className?: string;
}) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedInstrutorId, setSelectedInstrutorId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<AvaliacaoStatus[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<AvaliacaoTipo | null>(null);
  const [selectedTipoAtividade, setSelectedTipoAtividade] =
    useState<AvaliacaoTipoAtividade | null>(null);
  const [selectedModalidades, setSelectedModalidades] = useState<string[]>([]);
  const [selectedObrigatoria, setSelectedObrigatoria] = useState<string | null>(null);
  const [pendingPeriodo, setPendingPeriodo] = useState<DateRange>(createEmptyDateRange());
  const [appliedPeriodo, setAppliedPeriodo] = useState<DateRange>(createEmptyDateRange());
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

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { instrutores, isLoading: loadingInstrutores } = useInstrutoresForSelect();
  const { turmas, isLoading: loadingTurmas } = useTurmasForSelect(selectedCursoId);

  // Usar o hook correto que utiliza a API global de avaliações
  const avaliacoesQuery = useAvaliacoesDashboardQuery({
    cursoId: selectedCursoId ?? null,
    turmaId: selectedTurmaId,
    instrutorId: selectedInstrutorId,
    tipo: selectedTipo,
    tipoAtividade: selectedTipoAtividade,
    modalidade: selectedModalidades,
    status: selectedStatuses,
    obrigatoria:
      selectedObrigatoria === null ? null : selectedObrigatoria === "true",
    periodo:
      appliedPeriodo.from && appliedPeriodo.to
        ? `${formatDateForAPI(appliedPeriodo.from)},${formatDateForAPI(appliedPeriodo.to)}`
        : null,
    search: getNormalizedSearchOrUndefined(
      appliedSearchTerm,
      DEFAULT_SEARCH_MIN_LENGTH
    ),
    page: currentPage,
    pageSize,
    orderBy: sortField || "criadoEm",
    order: sortDirection,
  });

  const avaliacoes = useMemo(
    () => avaliacoesQuery.data?.items ?? [],
    [avaliacoesQuery.data]
  );
  const pagination = avaliacoesQuery.data?.pagination;
  const isLoading = avaliacoesQuery.status === "pending";
  const isFetching = avaliacoesQuery.isFetching;
  const errorMessage =
    avaliacoesQuery.status === "error"
      ? avaliacoesQuery.error?.message ??
        "Não foi possível carregar as atividades/provas."
      : null;
  const hasError = Boolean(errorMessage);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;
  const searchHelperText = SEARCH_HELPER_TEXT;

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

  const handleApplyFilters = useCallback(() => {
    setAppliedPeriodo(pendingPeriodo);
    handleSearchSubmit();
  }, [handleSearchSubmit, pendingPeriodo]);

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

  // A API já faz paginação, filtros, busca e ordenação no backend
  // Não precisa ordenar client-side, a API já retorna ordenado conforme orderBy e order
  const filteredAvaliacoes = avaliacoes;

  // Usa paginação da API ao invés de client-side
  const totalItems = pagination?.total ?? filteredAvaliacoes.length;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedAvaliacoes = filteredAvaliacoes; // A API já retorna apenas os itens da página atual

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
      console.log("[PAGINATION] Mudando página:", {
        de: currentPage,
        para: nextPage,
        totalPages,
      });
      setCurrentPage(nextPage);
    },
    [currentPage, totalPages]
  );

  // Ajusta página atual se necessário (apenas se totalPages mudou e currentPage está fora do range)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]); // Removido currentPage das dependências para evitar loop

  const shouldShowSkeleton =
    isLoading || (isFetching && avaliacoes.length === 0);
  const canDisplayTable =
    !hasError && (shouldShowSkeleton || filteredAvaliacoes.length > 0);
  const showEmptyState =
    !hasError && !shouldShowSkeleton && filteredAvaliacoes.length === 0;

  // Ordem dos campos: turma, tipo, status
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        options: cursos,
        placeholder: loadingCursos ? "Carregando..." : "Selecionar",
      },
      {
        key: "turmaId",
        label: "Turma",
        options: selectedCursoId ? turmas : [],
        placeholder: !selectedCursoId
          ? "Selecione um curso"
          : loadingTurmas
          ? "Carregando..."
          : "Selecionar",
        emptyPlaceholder: selectedCursoId
          ? "Nenhuma turma disponível"
          : "Selecione um curso primeiro",
        disabled: !selectedCursoId || loadingTurmas,
      },
      {
        key: "instrutorId",
        label: "Instrutor",
        options: instrutores,
        placeholder: loadingInstrutores ? "Carregando..." : "Selecionar",
      },
      {
        key: "tipo",
        label: "Tipo",
        options: PROVA_TIPO_OPTIONS,
        placeholder: "Todos",
      },
      {
        key: "tipoAtividade",
        label: "Tipo de atividade",
        options: TIPO_ATIVIDADE_OPTIONS,
        placeholder: "Todos",
        disabled: selectedTipo !== "ATIVIDADE",
      },
      {
        key: "modalidade",
        label: "Modalidade",
        mode: "multiple" as const,
        options: MODALIDADE_OPTIONS,
        placeholder: "Selecionar",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range",
        placeholder: "Selecionar período",
      },
      {
        key: "status",
        label: "Status",
        mode: "multiple" as const,
        options: PROVA_STATUS_OPTIONS,
        placeholder: "Selecionar",
      },
      {
        key: "obrigatoria",
        label: "Obrigatória",
        options: OBRIGATORIA_OPTIONS,
        placeholder: "Selecionar",
      },
    ],
    [
      cursos,
      instrutores,
      loadingCursos,
      loadingInstrutores,
      loadingTurmas,
      selectedCursoId,
      selectedTipo,
      turmas,
    ]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCursoId,
      turmaId: selectedTurmaId,
      tipo: selectedTipo,
      tipoAtividade: selectedTipoAtividade,
      modalidade: selectedModalidades,
      periodo: pendingPeriodo,
      instrutorId: selectedInstrutorId,
      status: selectedStatuses,
      obrigatoria: selectedObrigatoria,
    }),
    [
      pendingPeriodo,
      selectedCursoId,
      selectedInstrutorId,
      selectedModalidades,
      selectedObrigatoria,
      selectedStatuses,
      selectedTipo,
      selectedTipoAtividade,
      selectedTurmaId,
    ]
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
          <Link href="/dashboard/cursos/atividades-provas/cadastrar">
            Nova Atividade/Prova
          </Link>
        </ButtonCustom>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            gridClassName="lg:grid-cols-12 lg:[&>*:nth-child(1)]:col-span-4 lg:[&>*:nth-child(2)]:col-span-4 lg:[&>*:nth-child(3)]:col-span-4 lg:[&>*:nth-child(4)]:col-span-3 lg:[&>*:nth-child(5)]:col-span-3 lg:[&>*:nth-child(6)]:col-span-2 lg:[&>*:nth-child(7)]:col-span-2 lg:[&>*:nth-child(8)]:col-span-2 lg:[&>*:nth-child(9)]:col-span-2 lg:[&>*:nth-child(10)]:col-span-2"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                const nextCursoId = (value as string) || null;
                setSelectedCursoId(nextCursoId);
                setSelectedTurmaId(null);
                setCurrentPage(1);
              }
              if (key === "turmaId") {
                setSelectedTurmaId((value as string) || null);
                setCurrentPage(1);
              }
              if (key === "instrutorId") {
                setSelectedInstrutorId((value as string) || null);
                setCurrentPage(1);
              }
              if (key === "tipo") {
                setSelectedTipo((value as AvaliacaoTipo) || null);
                setSelectedTipoAtividade(null);
                setCurrentPage(1);
              }
              if (key === "tipoAtividade") {
                setSelectedTipoAtividade((value as AvaliacaoTipoAtividade) || null);
                setCurrentPage(1);
              }
              if (key === "modalidade") {
                setSelectedModalidades(Array.isArray(value) ? (value as string[]) : []);
                setCurrentPage(1);
              }
              if (key === "periodo") {
                setPendingPeriodo((value as DateRange) || createEmptyDateRange());
              }
              if (key === "status") {
                setSelectedStatuses(Array.isArray(value) ? (value as AvaliacaoStatus[]) : []);
                setCurrentPage(1);
              }
              if (key === "obrigatoria") {
                setSelectedObrigatoria((value as string) || null);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedCursoId(null);
              setSelectedTurmaId(null);
              setSelectedTipo(null);
              setSelectedTipoAtividade(null);
              setSelectedModalidades([]);
              setSelectedInstrutorId(null);
              setSelectedStatuses([]);
              setSelectedObrigatoria(null);
              setPendingPeriodo(createEmptyDateRange());
              setAppliedPeriodo(createEmptyDateRange());
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
                onClick={() => handleApplyFilters()}
                disabled={isLoading || !isSearchInputValid}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
            rightActionsClassName="lg:col-span-1 lg:items-end lg:justify-end"
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
              onClick={() => avaliacoesQuery.refetch()}
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
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Cursos/Turmas
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Data
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-center whitespace-nowrap">
                    Peso / Vale Ponto
                  </TableHead>
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
                  paginatedAvaliacoes.map((avaliacao) => (
                    <AtividadeProvaRow
                      key={avaliacao.id}
                      avaliacao={avaliacao}
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
                        ? Math.min(
                            pagination.page * pagination.pageSize,
                            totalItems
                          )
                        : Math.min(pageSize, totalItems);
                      return `Mostrando ${startIndex} a ${endIndex} de ${totalItems} atividade${
                        totalItems === 1 ? "" : "s"
                      }/prova${totalItems === 1 ? "" : "s"}`;
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
