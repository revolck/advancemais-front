"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCursosForSelect } from "../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../lista-alunos/hooks/useTurmaOptions";
import { listInscricoes } from "@/api/cursos";
import type { TurmaEstagio } from "@/api/cursos";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { EstagioRow } from "./components/EstagioRow";
import { EstagioTableSkeleton } from "./components/EstagioTableSkeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

const SEARCH_HELPER_TEXT = "Pesquise por nome, código do aluno ou CPF.";

const createEmptyDateRange = (): DateRange => ({
  from: null,
  to: null,
});

const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ? new Date(range.from) : null,
  to: range.to ? new Date(range.to) : null,
});

export interface EstagiosDashboardProps {
  className?: string;
}

export function EstagiosDashboard({ className }: EstagiosDashboardProps) {
  const role = useUserRole();
  const router = useRouter();
  const canCreate = useMemo(
    () =>
      role === UserRole.ADMIN ||
      role === UserRole.MODERADOR ||
      role === UserRole.PEDAGOGICO,
    [role]
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(() =>
    createEmptyDateRange()
  );
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(() =>
    createEmptyDateRange()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estagios, setEstagios] = useState<TurmaEstagio[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sorting
  type SortField = "aluno" | "atualizadoEm" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCourseId);

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

  const runFetch = useCallback(async () => {
    if (!selectedCourseId || !selectedTurmaId) return;
    
    // Aplicar filtros antes de buscar
    const validationMessage = getSearchValidationMessage(pendingSearchTerm);
    if (!validationMessage) {
      setAppliedSearchTerm(pendingSearchTerm.trim());
    } else {
      setAppliedSearchTerm("");
    }
    setAppliedDateRange(cloneDateRange(pendingDateRange));
    
    setLoading(true);
    setError(null);
    setHasFetched(true);
    try {
      const inscricoes = await listInscricoes(selectedCourseId, selectedTurmaId);
      const normalized: TurmaEstagio[] = [];
      
      (inscricoes || []).forEach((inscricao: any, inscricaoIndex: number) => {
        const alunoInfo: TurmaEstagio["aluno"] & { cpf?: string } | undefined =
          inscricao?.aluno
            ? {
                id: String(inscricao.aluno.id ?? inscricao.alunoId ?? inscricao.id ?? inscricaoIndex),
                nomeCompleto: inscricao.aluno.nome ?? inscricao.aluno.nomeCompleto ?? "",
                email: inscricao.aluno.email ?? "",
                ...(inscricao.aluno.cpf ? { cpf: inscricao.aluno.cpf } : {}),
              }
            : inscricao?.alunoId
            ? { id: String(inscricao.alunoId), nomeCompleto: "", email: "" }
            : undefined;

        const estagiosArray: any[] = [];
        if (Array.isArray(inscricao?.estagios)) {
          estagiosArray.push(...inscricao.estagios);
        }
        if (inscricao?.estagio) {
          estagiosArray.push(inscricao.estagio);
        }

        if (estagiosArray.length === 0 && alunoInfo) {
          // Nenhum estágio para este aluno; não adiciona linha
          return;
        }

        estagiosArray.forEach((estagio: any, estagioIndex: number) => {
          const safeId =
            estagio?.id != null
              ? String(estagio.id)
              : `estagio-${inscricaoIndex}-${estagioIndex}`;
          normalized.push({
            id: safeId,
            turmaId: String(inscricao?.turmaId ?? selectedTurmaId ?? ""),
            alunoId: String(inscricao?.alunoId ?? inscricao?.aluno?.id ?? ""),
            status: estagio?.status,
            empresa:
              estagio?.empresa != null
                ? String(estagio.empresa)
                : estagio?.empresaNome != null
                ? String(estagio.empresaNome)
                : estagio?.empresaId != null
                ? String(estagio.empresaId)
                : undefined,
            cargo: estagio?.cargo || estagio?.funcao,
            criadoEm: estagio?.criadoEm || estagio?.dataInicio,
            atualizadoEm: estagio?.atualizadoEm || estagio?.dataFim,
            inicioPrevisto: estagio?.dataInicioPrevista,
            fimPrevisto: estagio?.dataFimPrevista,
            aluno: alunoInfo,
          });
        });
      });

      setEstagios(normalized);
      setCurrentPage(1);
      if (normalized.length === 0) {
        setError("Nenhum estágio encontrado para esta turma.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estágios.");
      setEstagios([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, selectedTurmaId, pendingDateRange, pendingSearchTerm]);

  // Sorting functions
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
    <T extends TurmaEstagio>(list: T[]) => {
      if (!Array.isArray(list)) return [];
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "aluno") {
          const aName = (a.aluno?.nomeCompleto || a.aluno?.email || "").toLowerCase();
          const bName = (b.aluno?.nomeCompleto || b.aluno?.email || "").toLowerCase();
          const cmp = aName.localeCompare(bName, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        const aTime = a.atualizadoEm ? new Date(a.atualizadoEm).getTime() : 0;
        const bTime = b.atualizadoEm ? new Date(b.atualizadoEm).getTime() : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Filtrar por busca (nome, código, CPF)
  const filteredBySearchEstagios = useMemo(() => {
    if (!Array.isArray(estagios)) {
      return [];
    }

    if (!normalizedSearch) {
      return estagios;
    }

    const searchLower = normalizedSearch.toLowerCase();

    return estagios.filter((estagio) => {
      // Buscar por nome do aluno
      const alunoNome = (estagio.aluno?.nomeCompleto || estagio.aluno?.email || "").toLowerCase();
      if (alunoNome.includes(searchLower)) return true;

      // Buscar por email do aluno
      const alunoEmail = (estagio.aluno?.email || "").toLowerCase();
      if (alunoEmail.includes(searchLower)) return true;

      // Buscar por código do aluno (alunoId)
      const alunoId = estagio.alunoId?.toLowerCase() || "";
      if (alunoId.includes(searchLower)) return true;

      // Buscar por CPF do aluno (se disponível)
      const alunoCpf = (estagio.aluno as any)?.cpf?.replace(/\D/g, "") || "";
      const searchCpf = searchLower.replace(/\D/g, "");
      if (alunoCpf && searchCpf && alunoCpf.includes(searchCpf)) return true;

      return false;
    });
  }, [estagios, normalizedSearch]);

  // Filtrar por data de criação
  const filteredByDateEstagios = useMemo(() => {
    if (!Array.isArray(filteredBySearchEstagios)) {
      return [];
    }

    if (!appliedDateRange.from && !appliedDateRange.to) {
      return filteredBySearchEstagios;
    }

    return filteredBySearchEstagios.filter((estagio) => {
      if (!estagio.criadoEm) return false;

      const criadoEm = new Date(estagio.criadoEm);
      criadoEm.setHours(0, 0, 0, 0);

      if (appliedDateRange.from) {
        const fromDate = new Date(appliedDateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        if (criadoEm < fromDate) return false;
      }

      if (appliedDateRange.to) {
        const toDate = new Date(appliedDateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (criadoEm > toDate) return false;
      }

      return true;
    });
  }, [filteredBySearchEstagios, appliedDateRange]);

  const sortedEstagios = useMemo(
    () => sortList(filteredByDateEstagios),
    [filteredByDateEstagios, sortList]
  );

  // Paginação local
  const totalItems = sortedEstagios.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedEstagios = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEstagios.slice(start, start + pageSize);
  }, [sortedEstagios, currentPage, pageSize]);

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
      setCurrentPage(nextPage);
    },
    [totalPages]
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "curso",
        label: "Curso",
        options: cursos,
        placeholder: "Selecionar curso",
      },
      {
        key: "turma",
        label: "Turma",
        options: turmas,
        placeholder: selectedCourseId
          ? "Selecionar turma"
          : "Selecione um curso primeiro",
        disabled: !selectedCourseId || turmas.length === 0,
      },
      {
        key: "dateRange",
        label: "Data de criação",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    [cursos, turmas, selectedCourseId]
  );

  const filterValues = useMemo(
    () => ({
      curso: selectedCourseId,
      turma: selectedTurmaId,
      dateRange: pendingDateRange,
    }),
    [selectedCourseId, selectedTurmaId, pendingDateRange]
  );

  const showEmptyState =
    !loading &&
    (!selectedCourseId ||
      !selectedTurmaId ||
      sortedEstagios.length === 0);

  const showTable = !showEmptyState && (loading || (hasFetched && sortedEstagios.length > 0));

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      {canCreate && (
        <div className="mb-4 flex flex-col items-stretch gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-end">
          <ButtonCustom
            variant="primary"
            size="md"
            icon="Plus"
            fullWidth
            className="sm:w-auto"
            onClick={() => router.push("/dashboard/cursos/estagios/cadastrar")}
          >
            Cadastrar estágio
          </ButtonCustom>
        </div>
      )}

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "curso") {
                setSelectedCourseId((value as string) || null);
                setSelectedTurmaId(null);
                setEstagios([]);
                setError(null);
                setHasFetched(false);
              }
              if (key === "turma") {
                setSelectedTurmaId((value as string) || null);
                setEstagios([]);
                setHasFetched(false);
              }
              if (key === "dateRange") {
                setPendingDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            search={{
              label: "Pesquisar aluno",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Nome, código do aluno ou CPF...",
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
                onClick={runFetch}
                disabled={!selectedCourseId || !selectedTurmaId || loading}
                isLoading={loading}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {(showTable || showEmptyState) && (
        <div className="py-6">
          {showTable && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/50">
                    <TableHead
                      className="font-medium text-gray-700 py-4"
                      aria-sort={
                        sortField === "aluno"
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
                              onClick={() => toggleSort("aluno")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "aluno" && "text-gray-900"
                              )}
                            >
                              Aluno
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "aluno"
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
                                  setSort("aluno", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "aluno" &&
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
                                  setSort("aluno", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "aluno" &&
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
                      Empresa
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Cargo
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Status
                    </TableHead>
                    <TableHead
                      className="font-medium text-gray-700"
                      aria-sort={
                        sortField === "atualizadoEm"
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
                              onClick={() => toggleSort("atualizadoEm")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                sortField === "atualizadoEm" && "text-gray-900"
                              )}
                            >
                              Atualizado em
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {sortField === "atualizadoEm"
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
                                  setSort("atualizadoEm", "desc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    sortField === "atualizadoEm" &&
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
                                  setSort("atualizadoEm", "asc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    sortField === "atualizadoEm" &&
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
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <EstagioTableSkeleton rows={pageSize} />
                  ) : (
                    displayedEstagios.map((estagio, index) => {
                      const safeId =
                        estagio?.id != null
                          ? String(estagio.id)
                          : `estagio-${index}`;
                      return (
                        <EstagioRow
                          key={safeId}
                          estagio={{ ...estagio, id: safeId }}
                        />
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {(totalItems > 0 || loading) && (
              <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)}{" "}
                    a {Math.min(currentPage * pageSize, totalItems)} de{" "}
                    {totalItems} estágio{totalItems === 1 ? "" : "s"}
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
          )}

          {showEmptyState && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <EmptyState
                fullHeight
                maxContentWidth="sm"
                illustration="books"
                illustrationAlt="Ilustração de estágios"
                title={
                  !selectedCourseId || !selectedTurmaId
                    ? "Selecione curso e turma"
                    : "Nenhum estágio encontrado"
                }
                description={
                  !selectedCourseId || !selectedTurmaId
                    ? "Selecione o curso e a turma para listar os estágios disponíveis."
                    : error ||
                      "Nenhum estágio encontrado para os filtros aplicados. Tente ajustar sua busca."
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EstagiosDashboard;
