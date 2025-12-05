"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  SolicitacaoRow,
  SolicitacaoTableSkeleton,
  RejeitarVagaModal,
  VisualizarVagaModal,
  ConfirmarAprovacaoModal,
} from "./components";
import type { SolicitacaoDashboardProps } from "./types";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import {
  listSolicitacoes,
  aprovarSolicitacao,
  rejeitarSolicitacao,
} from "@/api/vagas/solicitacoes";
import type {
  SolicitacaoVaga,
  SolicitacaoStatus,
} from "@/api/vagas/solicitacoes/types";

const SEARCH_HELPER_TEXT = "Pesquise por título da vaga ou nome da empresa.";

const createEmptyDateRange = (): DateRange => ({
  from: null,
  to: null,
});

const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ?? null,
  to: range.to ?? null,
});

const STATUS_FILTER_OPTIONS: { value: SolicitacaoStatus; label: string }[] = [
  { value: "PENDENTE", label: "Em Análise" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "REJEITADA", label: "Rejeitada" },
  { value: "CANCELADA", label: "Cancelada" },
];

type SortField = "vaga" | "empresa" | "dataSolicitacao" | null;
type SortDirection = "asc" | "desc";

export function SolicitacoesDashboard({
  className,
  solicitacoes: solicitacoesProp,
  fetchFromApi = true,
  itemsPerPage: itemsPerPageProp,
  pageSize: pageSizeProp,
  onDataLoaded,
  onError,
}: SolicitacaoDashboardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const defaultPageSize = pageSizeProp ?? itemsPerPageProp ?? 10;
  const shouldFetch = fetchFromApi && !solicitacoesProp;

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<SolicitacaoStatus[]>(
    ["PENDENTE"]
  );
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(() =>
    createEmptyDateRange()
  );
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(() =>
    createEmptyDateRange()
  );

  // Sorting (client-side)
  const [sortField, setSortField] = useState<SortField>("dataSolicitacao");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Estado para modal de rejeição
  const [solicitacaoParaRejeitar, setSolicitacaoParaRejeitar] =
    useState<SolicitacaoVaga | null>(null);

  // Estado para modal de visualização
  const [solicitacaoParaVisualizar, setSolicitacaoParaVisualizar] =
    useState<SolicitacaoVaga | null>(null);

  // Estado para modal de aprovação
  const [solicitacaoParaAprovar, setSolicitacaoParaAprovar] =
    useState<SolicitacaoVaga | null>(null);

  // Estado para controlar se há alguma ação em andamento (desabilita todos os botões)
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Estado para rastrear qual ação está sendo processada (para mostrar o loading)
  const [actionInProgress, setActionInProgress] = useState<{
    type: "visualizar" | "empresa" | "aprovar" | "rejeitar" | null;
    solicitacaoId: string | null;
  }>({ type: null, solicitacaoId: null });

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const normalizedSearch = useMemo(
    () =>
      getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH
      ),
    [appliedSearchTerm]
  );

  // Query para buscar solicitações
  const {
    data: queryData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "solicitacoes",
      currentPage,
      pageSize,
      selectedStatuses,
      normalizedSearch,
      appliedDateRange.from,
      appliedDateRange.to,
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        pageSize,
      };

      // Só passa status se houver filtro selecionado
      if (selectedStatuses.length > 0) {
        params.status = selectedStatuses;
      }

      // Só passa search se houver texto válido
      if (normalizedSearch) {
        params.search = normalizedSearch;
      }

      // Só passa datas se houver filtro
      if (appliedDateRange.from) {
        params.criadoDe = appliedDateRange.from.toISOString();
      }
      if (appliedDateRange.to) {
        params.criadoAte = appliedDateRange.to.toISOString();
      }

      console.log("📋 Parâmetros da busca:", params);
      const result = await listSolicitacoes(params);
      console.log("✅ Resultado da busca:", {
        total: result.pagination?.total,
        items: result.data?.length,
        page: result.pagination?.page,
      });
      return result;
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60, // 1 minuto
  });

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: (id: string) => aprovarSolicitacao(id),
    onSuccess: () => {
      toast.success("Solicitação aprovada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["setor-de-vagas-metricas"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao aprovar solicitação");
    },
  });

  // Mutation para rejeitar
  const rejeitarMutation = useMutation({
    mutationFn: ({
      id,
      motivoRejeicao,
    }: {
      id: string;
      motivoRejeicao: string;
    }) => rejeitarSolicitacao(id, { motivoRejeicao }),
    onSuccess: () => {
      toast.success("Solicitação rejeitada!");
      setSolicitacaoParaRejeitar(null);
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["setor-de-vagas-metricas"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao rejeitar solicitação");
    },
  });

  // Dados da API ou props
  const solicitacoes = useMemo(() => {
    if (solicitacoesProp) return solicitacoesProp;
    return queryData?.data || [];
  }, [solicitacoesProp, queryData]);

  const pagination = useMemo(() => {
    if (queryData?.pagination) return queryData.pagination;
    return {
      page: currentPage,
      pageSize,
      total: solicitacoes.length,
      totalPages: Math.max(1, Math.ceil(solicitacoes.length / pageSize)),
    };
  }, [queryData, currentPage, pageSize, solicitacoes.length]);

  // Notificar quando dados carregarem
  useEffect(() => {
    if (queryData && onDataLoaded) {
      onDataLoaded(queryData.data);
    }
  }, [queryData, onDataLoaded]);

  // Notificar erros
  useEffect(() => {
    if (queryError && onError) {
      onError(queryError as Error);
    }
  }, [queryError, onError]);

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
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return field;
    });
  };

  const sortList = useCallback(
    <T extends SolicitacaoVaga>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        let cmp = 0;
        if (sortField === "vaga") {
          const aName = a.vaga.titulo?.toLowerCase() ?? "";
          const bName = b.vaga.titulo?.toLowerCase() ?? "";
          cmp = aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
        } else if (sortField === "empresa") {
          const aName = a.empresa.nome?.toLowerCase() ?? "";
          const bName = b.empresa.nome?.toLowerCase() ?? "";
          cmp = aName.localeCompare(bName, "pt-BR", { sensitivity: "base" });
        } else if (sortField === "dataSolicitacao") {
          const aTime = a.dataSolicitacao
            ? new Date(a.dataSolicitacao).getTime()
            : 0;
          const bTime = b.dataSolicitacao
            ? new Date(b.dataSolicitacao).getTime()
            : 0;
          cmp = aTime - bTime;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Solicitações ordenadas (ordenação client-side)
  const displayedSolicitacoes = useMemo(() => {
    return sortList(solicitacoes);
  }, [solicitacoes, sortList]);

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;
  const currentPageValue = pagination.page;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) return;

      const trimmedValue = value.trim();
      setPendingSearchTerm(trimmedValue);
      setAppliedSearchTerm(trimmedValue);
      setAppliedDateRange(cloneDateRange(pendingDateRange));
      setCurrentPage(1);
    },
    [pendingSearchTerm, pendingDateRange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
    },
    [totalPages]
  );

  // Abre modal de aprovação
  const handleAprovar = useCallback(
    (id: string) => {
      const solicitacao = solicitacoes.find((s) => s.id === id);
      if (!solicitacao) return;
      setIsProcessingAction(true);
      setActionInProgress({ type: "aprovar", solicitacaoId: id });
      setSolicitacaoParaAprovar(solicitacao);
    },
    [solicitacoes]
  );

  const handleCloseAprovarModal = useCallback(() => {
    if (!aprovarMutation.isPending) {
      setSolicitacaoParaAprovar(null);
      setIsProcessingAction(false);
      setActionInProgress({ type: null, solicitacaoId: null });
    }
  }, [aprovarMutation.isPending]);

  const handleConfirmarAprovacao = useCallback(() => {
    if (!solicitacaoParaAprovar) return;
    aprovarMutation.mutate(solicitacaoParaAprovar.id, {
      onSuccess: () => {
        setSolicitacaoParaVisualizar(null);
      },
      onSettled: () => {
        setSolicitacaoParaAprovar(null);
        setIsProcessingAction(false);
        setActionInProgress({ type: null, solicitacaoId: null });
      },
    });
  }, [aprovarMutation, solicitacaoParaAprovar]);

  // Abre a modal de rejeição
  const handleRejeitar = useCallback(
    (id: string) => {
      setIsProcessingAction(true);
      setActionInProgress({ type: "rejeitar", solicitacaoId: id });
      const solicitacao = solicitacoes.find((s) => s.id === id);
      if (solicitacao) {
        setSolicitacaoParaRejeitar(solicitacao);
      }
      // Reset após a modal abrir
      setTimeout(() => {
        setIsProcessingAction(false);
        setActionInProgress({ type: null, solicitacaoId: null });
      }, 300);
    },
    [solicitacoes]
  );

  // Fecha a modal de rejeição
  const handleCloseRejeitarModal = useCallback(() => {
    if (!rejeitarMutation.isPending) {
      setSolicitacaoParaRejeitar(null);
    }
  }, [rejeitarMutation.isPending]);

  // Confirma a rejeição com o motivo
  const handleConfirmRejeitar = useCallback(
    (motivoRejeicao: string) => {
      if (solicitacaoParaRejeitar) {
        rejeitarMutation.mutate({
          id: solicitacaoParaRejeitar.id,
          motivoRejeicao,
        });
      }
    },
    [solicitacaoParaRejeitar, rejeitarMutation]
  );

  // Abre a modal de visualização
  const handleVisualizar = useCallback((solicitacao: SolicitacaoVaga) => {
    setIsProcessingAction(true);
    setActionInProgress({ type: "visualizar", solicitacaoId: solicitacao.id });
    setSolicitacaoParaVisualizar(solicitacao);
    // Reset após a modal abrir
    setTimeout(() => {
      setIsProcessingAction(false);
      setActionInProgress({ type: null, solicitacaoId: null });
    }, 300);
  }, []);

  // Fecha a modal de visualização
  const handleCloseVisualizarModal = useCallback(() => {
    setSolicitacaoParaVisualizar(null);
  }, []);

  // Navegar para empresa
  const handleVerEmpresa = useCallback(
    (empresaId: string, solicitacaoId: string) => {
      setIsProcessingAction(true);
      setActionInProgress({ type: "empresa", solicitacaoId });
      router.push(`/dashboard/empresas/${empresaId}`);
      // Não resetamos manualmente: ao navegar, o componente é desmontado.
    },
    [router]
  );

  // Aprovar da modal de visualização
  const handleAprovarFromModal = useCallback(
    (id: string) => {
      const solicitacao = solicitacoes.find((s) => s.id === id);
      if (!solicitacao) return;
      setSolicitacaoParaVisualizar(null);
      setIsProcessingAction(true);
      setActionInProgress({ type: "aprovar", solicitacaoId: id });
      setSolicitacaoParaAprovar(solicitacao);
    },
    [solicitacoes]
  );

  // Rejeitar da modal de visualização (abre a modal de rejeição)
  const handleRejeitarFromModal = useCallback(
    (id: string) => {
      const solicitacao = solicitacoes.find((s) => s.id === id);
      if (solicitacao) {
        setSolicitacaoParaVisualizar(null); // Fecha a modal de visualização
        setSolicitacaoParaRejeitar(solicitacao); // Abre a modal de rejeição
      }
    },
    [solicitacoes]
  );

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
        key: "dateRange",
        label: "Data da solicitação",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    []
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      dateRange: pendingDateRange,
    }),
    [selectedStatuses, pendingDateRange]
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(1, currentPageValue - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [currentPageValue, totalPages]);

  const showEmptyState = !isLoading && !isFetching && totalItems === 0;
  const shouldShowSkeleton =
    isLoading || (isFetching && solicitacoes.length === 0);

  return (
    <div className={cn("min-h-full", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            className="lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_auto]"
            onChange={(key, value) => {
              if (key === "status") {
                const values = Array.isArray(value)
                  ? (value as SolicitacaoStatus[])
                  : [];
                setSelectedStatuses(values);
                setCurrentPage(1);
              } else if (key === "dateRange") {
                const range = value
                  ? cloneDateRange(value as DateRange)
                  : createEmptyDateRange();
                setPendingDateRange(range);
                setAppliedDateRange(range);
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedStatuses([]);
              const resetRange = createEmptyDateRange();
              setPendingDateRange(resetRange);
              setAppliedDateRange(resetRange);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar solicitação",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Buscar vaga ou empresa...",
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
                disabled={isLoading || isFetching || !isSearchInputValid}
                fullWidth
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      <div className="py-6">
        {!showEmptyState && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/50">
                    <TableHead
                      className="font-medium text-gray-700 py-4"
                      aria-sort={
                        sortField === "vaga"
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
                              onClick={() => toggleSort("vaga")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "vaga" && "text-gray-900"
                              )}
                            >
                              Vaga
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "vaga"
                              ? sortDirection === "asc"
                                ? "A → Z (clique para Z → A)"
                                : "Z → A (clique para A → Z)"
                              : "Ordenar por vaga"}
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
                                  setSort("vaga", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "vaga" &&
                                      sortDirection === "asc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              A → Z
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                                aria-label="Ordenar Z → A"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSort("vaga", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "vaga" &&
                                      sortDirection === "desc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              Z → A
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TableHead>

                    <TableHead
                      className="font-medium text-gray-700"
                      aria-sort={
                        sortField === "empresa"
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
                              onClick={() => toggleSort("empresa")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "empresa" && "text-gray-900"
                              )}
                            >
                              Empresa
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "empresa"
                              ? sortDirection === "asc"
                                ? "A → Z (clique para Z → A)"
                                : "Z → A (clique para A → Z)"
                              : "Ordenar por empresa"}
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
                                  setSort("empresa", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "empresa" &&
                                      sortDirection === "asc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              A → Z
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-transparent"
                                aria-label="Ordenar Z → A"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSort("empresa", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "empresa" &&
                                      sortDirection === "desc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              Z → A
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TableHead>

                    <TableHead className="font-medium text-gray-700">
                      Status
                    </TableHead>

                    <TableHead
                      className="font-medium text-gray-700 text-center"
                      aria-sort={
                        sortField === "dataSolicitacao"
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
                              onClick={() => toggleSort("dataSolicitacao")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "dataSolicitacao" &&
                                  "text-gray-900"
                              )}
                            >
                              Data da solicitação
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "dataSolicitacao"
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
                                  setSort("dataSolicitacao", "desc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "dataSolicitacao" &&
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
                                  setSort("dataSolicitacao", "asc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "dataSolicitacao" &&
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

                    <TableHead className="font-medium text-gray-700 text-right pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shouldShowSkeleton ? (
                    <SolicitacaoTableSkeleton rows={pageSize} />
                  ) : (
                    displayedSolicitacoes.map((solicitacao) => (
                      <SolicitacaoRow
                        key={solicitacao.id}
                        solicitacao={solicitacao}
                        onAprovar={handleAprovar}
                        onRejeitar={handleRejeitar}
                        onVisualizar={handleVisualizar}
                        onVerEmpresa={handleVerEmpresa}
                        isDisabled={isProcessingAction}
                        loadingAction={
                          actionInProgress.solicitacaoId === solicitacao.id
                            ? actionInProgress.type
                            : null
                        }
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {(totalItems > 0 || shouldShowSkeleton) && (
              <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando{" "}
                    {Math.min(
                      (currentPageValue - 1) * pageSize + 1,
                      totalItems
                    )}{" "}
                    a {Math.min(currentPageValue * pageSize, totalItems)} de{" "}
                    {totalItems}{" "}
                    {totalItems === 1 ? "solicitação" : "solicitações"}
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <ButtonCustom
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPageValue - 1)}
                      disabled={currentPageValue === 1}
                      className="h-8 px-3"
                    >
                      Anterior
                    </ButtonCustom>

                    {visiblePages[0] > 1 && (
                      <>
                        <ButtonCustom
                          variant={
                            currentPageValue === 1 ? "primary" : "outline"
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
                          currentPageValue === page ? "primary" : "outline"
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
                            currentPageValue === totalPages
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
                      onClick={() => handlePageChange(currentPageValue + 1)}
                      disabled={currentPageValue === totalPages}
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

        {showEmptyState && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <EmptyState
              fullHeight
              maxContentWidth="sm"
              illustration="fileNotFound"
              illustrationAlt="Ilustração de arquivo não encontrado"
              title="Nenhuma solicitação encontrada"
              description="Revise os filtros aplicados ou aguarde novas solicitações de publicação de vagas."
            />
          </div>
        )}
      </div>

      {/* Modal de Rejeição */}
      <RejeitarVagaModal
        isOpen={!!solicitacaoParaRejeitar}
        onClose={handleCloseRejeitarModal}
        onConfirm={handleConfirmRejeitar}
        vagaTitulo={solicitacaoParaRejeitar?.vaga.titulo || ""}
        empresaNome={solicitacaoParaRejeitar?.empresa.nome}
        isLoading={rejeitarMutation.isPending}
      />

      {/* Modal de Aprovação */}
      <ConfirmarAprovacaoModal
        isOpen={!!solicitacaoParaAprovar}
        onClose={handleCloseAprovarModal}
        onConfirm={handleConfirmarAprovacao}
        vagaTitulo={solicitacaoParaAprovar?.vaga.titulo || ""}
        empresaNome={solicitacaoParaAprovar?.empresa.nome}
        isLoading={aprovarMutation.isPending}
      />

      {/* Modal de Visualização */}
      <VisualizarVagaModal
        isOpen={!!solicitacaoParaVisualizar}
        onClose={handleCloseVisualizarModal}
        solicitacao={solicitacaoParaVisualizar}
        onAprovar={handleAprovarFromModal}
        onRejeitar={handleRejeitarFromModal}
        isAprovando={aprovarMutation.isPending}
      />
    </div>
  );
}

export default SolicitacoesDashboard;
