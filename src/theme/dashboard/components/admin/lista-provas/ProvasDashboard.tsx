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
import { listProvas } from "@/api/cursos";
import type { TurmaProva } from "@/api/cursos";
import type { FilterField } from "@/components/ui/custom/filters";
import { ProvaRow } from "./components/ProvaRow";
import { ProvaTableSkeleton } from "./components/ProvaTableSkeleton";

export interface ProvasDashboardProps {
  className?: string;
}

export function ProvasDashboard({ className }: ProvasDashboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provas, setProvas] = useState<TurmaProva[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sorting
  type SortField = "titulo" | "dataInicio" | null;
  type SortDirection = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCourseId);

  const runFetch = useCallback(async () => {
    if (!selectedCourseId || !selectedTurmaId) return;
    setLoading(true);
    setError(null);
    setHasFetched(true);
    try {
      const data = await listProvas(selectedCourseId, selectedTurmaId);
      setProvas(data || []);
      setCurrentPage(1);
      if (!data || data.length === 0) {
        setError("Nenhuma prova encontrada para esta turma.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar provas.");
      setProvas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, selectedTurmaId]);

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
    <T extends TurmaProva>(list: T[]) => {
      if (!sortField) return list;
      const arr = [...list];
      arr.sort((a, b) => {
        if (sortField === "titulo") {
          const aTitle = (a.titulo || a.nome || "").toLowerCase();
          const bTitle = (b.titulo || b.nome || "").toLowerCase();
          const cmp = aTitle.localeCompare(bTitle, "pt-BR", {
            sensitivity: "base",
          });
          return sortDirection === "asc" ? cmp : -cmp;
        }
        const aTime = a.dataInicio ? new Date(a.dataInicio).getTime() : 0;
        const bTime = b.dataInicio ? new Date(b.dataInicio).getTime() : 0;
        const cmp = aTime - bTime;
        return sortDirection === "asc" ? cmp : -cmp;
      });
      return arr;
    },
    [sortDirection, sortField]
  );

  const sortedProvas = useMemo(() => sortList(provas), [provas, sortList]);

  // Paginação local
  const totalItems = sortedProvas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayedProvas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProvas.slice(start, start + pageSize);
  }, [sortedProvas, currentPage, pageSize]);

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
    ],
    [cursos, turmas, selectedCourseId]
  );

  const filterValues = useMemo(
    () => ({
      curso: selectedCourseId,
      turma: selectedTurmaId,
    }),
    [selectedCourseId, selectedTurmaId]
  );

  const showEmptyState =
    !loading &&
    (!selectedCourseId ||
      !selectedTurmaId ||
      (hasFetched && provas.length === 0));

  const showTable = !showEmptyState && (loading || provas.length > 0);

  return (
    <div className={cn("min-h-full", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "curso") {
                setSelectedCourseId((value as string) || null);
                setSelectedTurmaId(null);
                setProvas([]);
                setError(null);
                setHasFetched(false);
              }
              if (key === "turma") {
                setSelectedTurmaId((value as string) || null);
                setProvas([]);
                setHasFetched(false);
              }
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={runFetch}
                disabled={!selectedCourseId || !selectedTurmaId || loading}
                isLoading={loading}
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

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
                        sortField === "titulo"
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
                              onClick={() => toggleSort("titulo")}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors bg-transparent",
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

                        <div className="ml-1 flex flex-col -space-y-1.5 items-center leading-none">
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
                    <TableHead className="font-medium text-gray-700">
                      Tipo
                    </TableHead>
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
                              Início
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
                    <TableHead className="font-medium text-gray-700">
                      Fim
                    </TableHead>
                    <TableHead className="font-medium text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <ProvaTableSkeleton rows={pageSize} />
                  ) : (
                    displayedProvas.map((prova, index) => {
                      const safeId =
                        prova?.id != null
                          ? String(prova.id)
                          : `prova-${index}`;
                      return (
                        <ProvaRow
                          key={safeId}
                          prova={{ ...prova, id: safeId }}
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
                    {totalItems} prova{totalItems === 1 ? "" : "s"}
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
              illustrationAlt="Ilustração de provas"
              title={
                !selectedCourseId || !selectedTurmaId
                  ? "Selecione curso e turma"
                  : "Nenhuma prova encontrada"
              }
              description={
                !selectedCourseId || !selectedTurmaId
                  ? "Selecione o curso e a turma para listar as provas disponíveis."
                  : error ||
                    "Nenhuma prova encontrada para os filtros aplicados. Tente ajustar sua busca."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProvasDashboard;
