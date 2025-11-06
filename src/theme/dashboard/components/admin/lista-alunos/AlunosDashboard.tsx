"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { listCursos, listTurmas } from "@/api/cursos";
import { AlunoRow } from "./components/AlunoRow";
import { AlunoTableSkeleton } from "./components/AlunoTableSkeleton";
import type { SelectOption } from "@/components/ui/custom/select";
import type { FilterField } from "@/components/ui/custom/filters";
import { useAlunosDashboardQuery } from "./hooks/useAlunosDashboardQuery";
import { queryKeys } from "@/lib/react-query/queryKeys";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT = "Pesquise por nome, email, CPF ou código do aluno.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

export function AlunosDashboard({ className }: { className?: string }) {
  const defaultPageSize = 10;
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null); // Seleção individual
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null); // Seleção individual (como curso)
  const [selectedCidades, setSelectedCidades] = useState<string[]>([]);
  const pageSize = defaultPageSize;
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de ordenação
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // ID do curso filtrado para exibir na tabela (UUID string)
  const cursoFiltradoId = selectedCourseId;

  const statusOptions: SelectOption[] = useMemo(() => [
    { value: "INSCRITO", label: "Inscrito" },
    { value: "EM_ANDAMENTO", label: "Em Andamento" },
    { value: "CONCLUIDO", label: "Concluído" },
    { value: "REPROVADO", label: "Reprovado" },
    { value: "EM_ESTAGIO", label: "Em Estágio" },
    { value: "CANCELADO", label: "Cancelado" },
    { value: "TRANCADO", label: "Trancado" },
  ], []);

  const cursosQuery = useQuery({
    queryKey: queryKeys.cursos.list({ page: 1, pageSize: 100 }),
    queryFn: () => listCursos({ page: 1, pageSize: 100 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const cursosOptions: SelectOption[] = useMemo(() => {
    const cursos = cursosQuery.data?.data ?? [];
    return cursos
      .map((curso) => ({ value: String(curso.id), label: curso.nome }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [cursosQuery.data]);

  const loadingCursos = cursosQuery.status === "pending";

  // Busca turmas apenas do curso selecionado (individual)
  const turmasQuery = useQuery({
    queryKey: queryKeys.turmas.list({ cursoId: selectedCourseId }),
    queryFn: async () => {
      if (!selectedCourseId) return [];
      return await listTurmas(selectedCourseId);
    },
    enabled: !!selectedCourseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const normalizedFilters = useMemo(() => {
    return {
      page: currentPage,
      pageSize,
      // Enviar todos os status selecionados (array ou string único)
      status: selectedStatuses.length > 0
        ? selectedStatuses.length === 1
          ? selectedStatuses[0]
          : selectedStatuses
        : null,
      // Curso individual (string único)
      cursoId: selectedCourseId,
      // Turma individual (string único)
      turmaId: selectedTurmaId,
      // Enviar todas as cidades selecionadas (array ou string único)
      cidade: selectedCidades.length > 0
        ? selectedCidades.length === 1
          ? selectedCidades[0].trim()
          : selectedCidades.map((c) => c.trim())
        : null,
      search:
        appliedSearchTerm.length >= MIN_SEARCH_LENGTH
          ? appliedSearchTerm
          : "",
    };
  }, [
    currentPage,
    pageSize,
    selectedStatuses,
    selectedCourseId,
    selectedTurmaId,
    selectedCidades,
    appliedSearchTerm,
  ]);

  const alunosQuery = useAlunosDashboardQuery(normalizedFilters);
  const alunos = useMemo(() => alunosQuery.data?.alunos ?? [], [alunosQuery.data?.alunos]);

  const turmasFromAlunos = useMemo(() => {
    const map = new Map<string, any>();
    alunos.forEach((aluno) => {
      const ultimo = aluno.ultimoCurso;
      if (!ultimo?.turma) return;
      if (selectedCourseId && ultimo.curso.id !== selectedCourseId) {
        return;
      }
      map.set(ultimo.turma.id, ultimo.turma);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
  }, [alunos, selectedCourseId]);

  const turmasSource = useMemo(() => {
    if (!selectedCourseId) {
      return turmasFromAlunos;
    }

    const fromQuery = turmasQuery.data ?? [];
    if (fromQuery.length > 0) {
      return fromQuery;
    }

    return turmasFromAlunos;
  }, [selectedCourseId, turmasFromAlunos, turmasQuery.data]);

  const turmasOptions: SelectOption[] = useMemo(
    () =>
      turmasSource.map((turma) => ({
        value: turma.id,
        label: turma.nome,
      })),
    [turmasSource]
  );

  const cidadesOptions: SelectOption[] = useMemo(() => {
    const cidades = new Set<string>();
    alunos.forEach((aluno) => {
      if (aluno.cidade) {
        cidades.add(aluno.cidade);
      }
    });

    return Array.from(cidades)
      .sort()
      .map((cidade) => ({ value: cidade, label: cidade }));
  }, [alunos]);

  useEffect(() => {
    if (selectedTurmaId) {
      const allowed = new Set(turmasOptions.map((opt) => opt.value));
      if (!allowed.has(selectedTurmaId)) {
        setSelectedTurmaId(null);
      }
    }
  }, [turmasOptions, selectedTurmaId]);

  useEffect(() => {
    if (selectedCidades.length > 0) {
      const allowed = new Set(cidadesOptions.map((opt) => opt.value));
      if (!allowed.has(selectedCidades[0])) {
        setSelectedCidades([]);
      }
    }
  }, [cidadesOptions, selectedCidades]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, selectedCourseId, selectedTurmaId, selectedCidades]);

  const alunosPagination = alunosQuery.data?.pagination ?? {
    page: normalizedFilters.page,
    pageSize: normalizedFilters.pageSize,
    total: alunos.length,
    totalPages: Math.max(
      1,
      Math.ceil(alunos.length / normalizedFilters.pageSize)
    ),
  };
  const pagination = alunosPagination;

  useEffect(() => {
    if (currentPage > alunosPagination.totalPages) {
      setCurrentPage(Math.max(1, alunosPagination.totalPages));
    }
  }, [alunosPagination.totalPages, currentPage]);
  const isLoading = alunosQuery.isLoading;
  const isFetching = alunosQuery.isFetching;
  // Mostra skeleton quando está buscando novos dados (isFetching)
  // Isso garante que o skeleton apareça mesmo quando há dados anteriores (placeholderData)
  const showSkeleton = isFetching;
  
  const errorMessage = alunosQuery.error
    ? alunosQuery.error.message || "Erro ao carregar alunos"
    : null;
  const showEmptyState = !isLoading && !isFetching && alunos.length === 0;
  const emptyStateTitle = selectedCourseId
    ? "Nenhum aluno encontrado"
    : "Nenhum aluno listado";
  const emptyStateDescription = selectedCourseId
    ? "Não encontramos alunos com os filtros aplicados. Tente ajustar sua busca."
    : "Cadastre alunos com inscrições ou ajuste os filtros para visualizar resultados.";

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, Math.max(1, pagination.totalPages)));
    setCurrentPage(nextPage);
  };

  const handleSearchSubmit = (rawValue?: string) => {
    const value = rawValue ?? pendingSearchTerm;
    const validationMessage = getSearchValidationMessage(value);
    if (validationMessage) return;
    const trimmedValue = value.trim();
    setPendingSearchTerm(value);
    setAppliedSearchTerm(trimmedValue);
    setCurrentPage(1);
  };

  // Persistir ordenação no localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("alunosList.sort");
      if (stored) {
        const parsed = JSON.parse(stored) as { dir: SortDirection };
        if (parsed.dir) setSortDirection(parsed.dir);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "alunosList.sort",
        JSON.stringify({ dir: sortDirection })
      );
    } catch {}
  }, [sortDirection]);

  // Ordenar alunos
  const sortedAlunos = useMemo(() => {
    const sorted = [...alunos];
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
  }, [alunos, sortDirection]);

  // Páginas visíveis para navegação
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const totalPages = pagination.totalPages;
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
  }, [pagination.page, pagination.totalPages]);

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
        key: "curso",
        label: "Curso",
        options: cursosOptions,
        placeholder: loadingCursos ? "Carregando..." : "Selecione curso",
      },
      {
        key: "turma",
        label: "Turma",
        options: turmasOptions,
        placeholder:
          selectedCourseId
            ? "Selecione turma"
            : "Selecione um curso primeiro",
        disabled: !selectedCourseId,
      },
      {
        key: "cidade",
        label: "Cidade",
        mode: "multiple",
        options: cidadesOptions,
        placeholder: "Selecione cidade",
      },
    ],
    [
      statusOptions,
      cursosOptions,
      turmasOptions,
      cidadesOptions,
      selectedCourseId,
      loadingCursos,
    ]
  );

  const filterValues = useMemo(
    () => ({
      status: selectedStatuses,
      curso: selectedCourseId,
      turma: selectedTurmaId,
      cidade: selectedCidades,
    }),
    [selectedStatuses, selectedCourseId, selectedTurmaId, selectedCidades]
  );

  return (
    <div className={cn("min-h-full space-y-6", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "status") {
                setSelectedStatuses(
                  Array.isArray(value) ? (value as string[]) : []
                );
                setCurrentPage(1);
              } else if (key === "curso") {
                setSelectedCourseId((value as string) || null);
                setSelectedTurmaId(null); // Limpa turma quando curso muda
                setCurrentPage(1);
              } else if (key === "turma") {
                setSelectedTurmaId((value as string) || null);
                setCurrentPage(1);
              } else if (key === "cidade") {
                setSelectedCidades(
                  Array.isArray(value) ? (value as string[]) : []
                );
                setCurrentPage(1);
              }
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedStatuses([]);
              setSelectedCourseId(null);
              setSelectedTurmaId(null);
              setSelectedCidades([]);
              setCurrentPage(1);
            }}
            search={{
              label: "Pesquisar aluno",
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
                disabled={!isSearchInputValid}
                fullWidth
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
          <div className="flex items-center justify-between">
            <span>Erro ao carregar alunos: {errorMessage}</span>
            <ButtonCustom
              size="sm"
              variant="ghost"
              onClick={() => alunosQuery.refetch()}
            >
              Tentar novamente
            </ButtonCustom>
          </div>
        </div>
      )}

      {showSkeleton && alunos.length === 0 ? (
        // Skeleton de loading inicial (quando não há dados ainda)
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    Aluno
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Email
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Curso
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16">{/* ação */}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AlunoTableSkeleton rows={10} />
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
            illustrationAlt={emptyStateTitle}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4">
                    <div className="flex items-center gap-1">
                      <span>Aluno</span>
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
                    Localização
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Curso
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="w-16">{/* ação */}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showSkeleton ? (
                  <AlunoTableSkeleton rows={pageSize} />
                ) : (
                  sortedAlunos.map((aluno) => (
                    <AlunoRow
                      key={aluno.id}
                      aluno={aluno}
                      cursoFiltradoId={cursoFiltradoId}
                    />
                  ))
                )}
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
                  {pagination.total === 1 ? "aluno" : "alunos"}
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

                  {visiblePages[visiblePages.length - 1] < pagination.totalPages && (
                    <>
                      {visiblePages[visiblePages.length - 1] <
                        pagination.totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={
                          pagination.page === pagination.totalPages
                            ? "primary"
                            : "outline"
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

export default AlunosDashboard;
