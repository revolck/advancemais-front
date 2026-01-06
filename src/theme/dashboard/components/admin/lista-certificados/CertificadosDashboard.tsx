"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { listCertificados } from "@/api/cursos";
import type { TurmaCertificado } from "@/api/cursos";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { CertificadoRow } from "./components/CertificadoRow";
import { CertificadoTableSkeleton } from "./components/CertificadoTableSkeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { CreateCertificadoModal } from "./components/CreateCertificadoModal";

const SEARCH_HELPER_TEXT = "Pesquise por nome, código do aluno ou CPF.";

const createEmptyDateRange = (): DateRange => ({
  from: null,
  to: null,
});

const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ? new Date(range.from) : null,
  to: range.to ? new Date(range.to) : null,
});

export interface CertificadosDashboardProps {
  className?: string;
  initialCreateModalOpen?: boolean;
}

export function CertificadosDashboard({
  className,
  initialCreateModalOpen = false,
}: CertificadosDashboardProps) {
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
  const [certificados, setCertificados] = useState<TurmaCertificado[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sorting
  type SortField = "aluno" | "emitidoEm" | null;
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
      const data = await listCertificados(selectedCourseId, selectedTurmaId);
      // Garantir que sempre seja um array
      const certificadosArray = Array.isArray(data) ? data : [];
      setCertificados(certificadosArray);
      setCurrentPage(1);
      if (!certificadosArray || certificadosArray.length === 0) {
        setError("Nenhum certificado encontrado para esta turma.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar certificados."
      );
      setCertificados([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, selectedTurmaId, pendingDateRange, pendingSearchTerm]);

  useEffect(() => {
    if (!initialCreateModalOpen) return;
    if (!canCreate) return;
    setIsCreateModalOpen(true);
  }, [canCreate, initialCreateModalOpen]);

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
    <T extends TurmaCertificado>(list: T[]) => {
      if (!Array.isArray(list)) return [];
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        // aluno não disponível em TurmaCertificado, apenas alunoId
        // if (sortField === "aluno") {
        //   const aName = (a.aluno?.nome || a.aluno?.email || "").toLowerCase();
        //   const bName = (b.aluno?.nome || b.aluno?.email || "").toLowerCase();
        //   const cmp = aName.localeCompare(bName, "pt-BR", {
        //     sensitivity: "base",
        //   });
        //   return sortDirection === "asc" ? cmp : -cmp;
        // }
        const aTime = a.emitidoEm ? new Date(a.emitidoEm).getTime() : 0;
        const bTime = b.emitidoEm ? new Date(b.emitidoEm).getTime() : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  // Filtrar por busca (nome, código, CPF)
  const filteredBySearchCertificados = useMemo(() => {
    if (!Array.isArray(certificados)) {
      return [];
    }

    if (!normalizedSearch) {
      return certificados;
    }

    const searchLower = normalizedSearch.toLowerCase();

    return certificados.filter((certificado) => {
      // Buscar por nome do aluno
      const alunoNome = (certificado as any).aluno?.nome?.toLowerCase() || "";
      if (alunoNome.includes(searchLower)) return true;

      // Buscar por email do aluno
      const alunoEmail = (certificado as any).aluno?.email?.toLowerCase() || "";
      if (alunoEmail.includes(searchLower)) return true;

      // Buscar por código do aluno (alunoId)
      const alunoId = certificado.alunoId?.toLowerCase() || "";
      if (alunoId.includes(searchLower)) return true;

      // Buscar por CPF do aluno
      const alunoCpf =
        (certificado as any).aluno?.cpf?.replace(/\D/g, "") || "";
      const searchCpf = searchLower.replace(/\D/g, "");
      if (alunoCpf && searchCpf && alunoCpf.includes(searchCpf)) return true;

      // Buscar por código do certificado
      const codigo = (
        (certificado as any).codigo ||
        (certificado as any).numero ||
        ""
      ).toLowerCase();
      if (codigo.includes(searchLower)) return true;

      return false;
    });
  }, [certificados, normalizedSearch]);

  // Filtrar por data de emissão
  const filteredByDateCertificados = useMemo(() => {
    if (!Array.isArray(filteredBySearchCertificados)) {
      return [];
    }

    if (!appliedDateRange.from && !appliedDateRange.to) {
      return filteredBySearchCertificados;
    }

    return filteredBySearchCertificados.filter((certificado) => {
      if (!certificado.emitidoEm) return false;

      const emitidoEm = new Date(certificado.emitidoEm);
      emitidoEm.setHours(0, 0, 0, 0);

      if (appliedDateRange.from) {
        const fromDate = new Date(appliedDateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        if (emitidoEm < fromDate) return false;
      }

      if (appliedDateRange.to) {
        const toDate = new Date(appliedDateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (emitidoEm > toDate) return false;
      }

      return true;
    });
  }, [filteredBySearchCertificados, appliedDateRange]);

  const sortedCertificados = useMemo(
    () => sortList(filteredByDateCertificados),
    [filteredByDateCertificados, sortList]
  );

  // Paginação local
  const totalItems = sortedCertificados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedCertificados = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCertificados.slice(start, start + pageSize);
  }, [sortedCertificados, currentPage, pageSize]);

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
        label: "Data de emissão",
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
    (!selectedCourseId || !selectedTurmaId || sortedCertificados.length === 0);

  const showTable =
    !showEmptyState &&
    (loading || (hasFetched && sortedCertificados.length > 0));

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
            onClick={() => setIsCreateModalOpen(true)}
          >
            Cadastrar certificado
          </ButtonCustom>
        </div>
      )}

      <CreateCertificadoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCursoId={selectedCourseId}
        defaultTurmaId={selectedTurmaId}
        onSuccess={() => {
          if (!selectedCourseId || !selectedTurmaId) return;
          runFetch();
        }}
      />

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
                setCertificados([]);
                setError(null);
                setHasFetched(false);
              }
              if (key === "turma") {
                setSelectedTurmaId((value as string) || null);
                setCertificados([]);
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
                              <TooltipContent sideOffset={6}>
                                Z → A
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-gray-700">
                        Código
                      </TableHead>
                      <TableHead
                        className="font-medium text-gray-700"
                        aria-sort={
                          sortField === "emitidoEm"
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
                                onClick={() => toggleSort("emitidoEm")}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
                                  sortField === "emitidoEm" && "text-gray-900"
                                )}
                              >
                                Emitido em
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              {sortField === "emitidoEm"
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
                                    setSort("emitidoEm", "desc");
                                  }}
                                >
                                  <ChevronUp
                                    className={cn(
                                      "h-3 w-3 text-gray-400",
                                      sortField === "emitidoEm" &&
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
                                    setSort("emitidoEm", "asc");
                                  }}
                                >
                                  <ChevronDown
                                    className={cn(
                                      "h-3 w-3 text-gray-400 -mt-0.5",
                                      sortField === "emitidoEm" &&
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
                      <TableHead className="font-medium text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <CertificadoTableSkeleton rows={pageSize} />
                    ) : (
                      displayedCertificados.map((certificado, index) => {
                        const safeId =
                          certificado?.id != null
                            ? String(certificado.id)
                            : `certificado-${index}`;
                        return (
                          <CertificadoRow
                            key={safeId}
                            certificado={{ ...certificado, id: safeId }}
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
                      Mostrando{" "}
                      {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a{" "}
                      {Math.min(currentPage * pageSize, totalItems)} de{" "}
                      {totalItems} certificado{totalItems === 1 ? "" : "s"}
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
                illustrationAlt="Ilustração de certificados"
                title={
                  !selectedCourseId || !selectedTurmaId
                    ? "Selecione curso e turma"
                    : "Nenhum certificado encontrado"
                }
                description={
                  !selectedCourseId || !selectedTurmaId
                    ? "Selecione o curso e a turma para listar os certificados disponíveis."
                    : error ||
                      "Nenhum certificado encontrado para os filtros aplicados. Tente ajustar sua busca."
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CertificadosDashboard;
