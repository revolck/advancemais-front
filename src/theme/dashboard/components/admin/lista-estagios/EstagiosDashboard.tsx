"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import { useCursosForSelect } from "../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../lista-alunos/hooks/useTurmaOptions";
import { useEmpresasForSelect } from "./hooks/useEmpresasForSelect";
import { listEstagiosGlobal, type Estagio } from "@/api/cursos";
import { EstagioRow } from "./components/EstagioRow";
import { EstagioTableSkeleton } from "./components/EstagioTableSkeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "PLANEJADO", label: "Planejado" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "ENCERRADO", label: "Encerrado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const OBRIGATORIO_OPTIONS = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
];

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

const formatDateForAPI = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface EstagiosDashboardProps {
  className?: string;
}

function parseListResponse(response: any) {
  const data = response?.data;
  if (Array.isArray(data)) {
    return {
      items: data as Estagio[],
      pagination: response?.pagination,
    };
  }
  return {
    items: (data?.items ?? []) as Estagio[],
    pagination: data?.pagination ?? response?.pagination,
  };
}

export function EstagiosDashboard({ className }: EstagiosDashboardProps) {
  const router = useRouter();
  const role = useUserRole();
  const canManage =
    role === UserRole.ADMIN ||
    role === UserRole.MODERADOR ||
    role === UserRole.PEDAGOGICO ||
    role === UserRole.INSTRUTOR;

  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedObrigatorio, setSelectedObrigatorio] = useState<string | null>(
    null
  );
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(
    null
  );
  const [pendingSearch, setPendingSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pendingPeriodo, setPendingPeriodo] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [appliedPeriodo, setAppliedPeriodo] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { cursos } = useCursosForSelect();
  const { turmas } = useTurmaOptions(selectedCursoId);
  const { empresas, isLoading: isLoadingEmpresas } = useEmpresasForSelect(true);

  const query = useQuery({
    queryKey: [
      "estagios",
      "dashboard-v2",
      selectedCursoId,
      selectedTurmaId,
      selectedStatus,
      selectedObrigatorio,
      selectedEmpresaId,
      appliedSearch,
      appliedPeriodo,
      page,
      pageSize,
    ],
    queryFn: async () => {
      const response = await listEstagiosGlobal({
        cursoId: selectedCursoId ?? undefined,
        turmaIds: selectedTurmaId ?? undefined,
        empresaId: selectedEmpresaId ?? undefined,
        status: (selectedStatus as any) ?? undefined,
        obrigatorio:
          selectedObrigatorio === null
            ? undefined
            : selectedObrigatorio === "SIM",
        periodo:
          appliedPeriodo.from && appliedPeriodo.to
            ? `${formatDateForAPI(appliedPeriodo.from)},${formatDateForAPI(appliedPeriodo.to)}`
            : undefined,
        search: appliedSearch || undefined,
        orderBy: "atualizadoEm",
        order: "desc",
        page,
        pageSize,
      });
      return parseListResponse(response);
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const items = query.data?.items ?? [];
  const pagination = query.data?.pagination ?? {
    page,
    pageSize,
    total: items.length,
    totalPages: 1,
  };
  const totalItems = pagination.total ?? items.length;
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const currentPage = Math.min(page, totalPages);
  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, Math.min(nextPage, totalPages));
      if (safePage !== page) setPage(safePage);
    },
    [page, totalPages]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        options: cursos,
        placeholder: "Selecionar curso",
      },
      {
        key: "turmaId",
        label: "Turma",
        options: turmas,
        placeholder: selectedCursoId
          ? "Selecionar turma"
          : "Selecione um curso primeiro",
        disabled: !selectedCursoId,
      },
      {
        key: "status",
        label: "Status",
        options: STATUS_OPTIONS,
        placeholder: "Filtrar por status",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range",
        placeholder: "Selecionar período",
      },
      {
        key: "obrigatorio",
        label: "É obrigatório?",
        options: OBRIGATORIO_OPTIONS,
        placeholder: "Selecionar",
      },
      {
        key: "empresaId",
        label: "Empresa",
        options: empresas,
        placeholder: isLoadingEmpresas ? "Carregando..." : "Selecionar empresa",
        searchable: true,
        searchThreshold: -1,
      },
    ],
    [cursos, empresas, isLoadingEmpresas, selectedCursoId, turmas]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCursoId,
      turmaId: selectedTurmaId,
      status: selectedStatus,
      periodo: pendingPeriodo,
      obrigatorio: selectedObrigatorio,
      empresaId: selectedEmpresaId,
    }),
    [
      pendingPeriodo,
      selectedCursoId,
      selectedEmpresaId,
      selectedObrigatorio,
      selectedStatus,
      selectedTurmaId,
    ]
  );

  const showEmptyState = !query.isLoading && !query.isFetching && items.length === 0;

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      {canManage ? (
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
      ) : null}

      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            gridClassName="lg:grid-cols-12 lg:[&>*:nth-child(1)]:col-span-4 lg:[&>*:nth-child(2)]:col-span-4 lg:[&>*:nth-child(3)]:col-span-4 lg:[&>*:nth-child(4)]:col-span-2 lg:[&>*:nth-child(4)]:row-start-2 lg:[&>*:nth-child(4)]:col-start-1 lg:[&>*:nth-child(5)]:col-span-3 lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-3 lg:[&>*:nth-child(6)]:col-span-2 lg:[&>*:nth-child(6)]:row-start-2 lg:[&>*:nth-child(6)]:col-start-6 lg:[&>*:nth-child(7)]:col-span-4 lg:[&>*:nth-child(7)]:row-start-2 lg:[&>*:nth-child(7)]:col-start-8"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCursoId((value as string) || null);
                setSelectedTurmaId(null);
                setPage(1);
              }
              if (key === "turmaId") {
                setSelectedTurmaId((value as string) || null);
                setPage(1);
              }
              if (key === "status") {
                setSelectedStatus((value as string) || null);
                setPage(1);
              }
              if (key === "periodo") {
                setPendingPeriodo(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
              if (key === "obrigatorio") {
                setSelectedObrigatorio((value as string) || null);
                setPage(1);
              }
              if (key === "empresaId") {
                setSelectedEmpresaId((value as string) || null);
                setPage(1);
              }
            }}
            onClearAll={() => {
              setSelectedCursoId(null);
              setSelectedTurmaId(null);
              setSelectedStatus(null);
              setSelectedObrigatorio(null);
              setSelectedEmpresaId(null);
              setPendingPeriodo(createEmptyDateRange());
              setAppliedPeriodo(createEmptyDateRange());
              setPendingSearch("");
              setAppliedSearch("");
              setPage(1);
            }}
            search={{
              label: "Pesquisar conteúdo",
              value: pendingSearch,
              onChange: setPendingSearch,
              placeholder: "Buscar por título, curso, turma ou código...",
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setAppliedSearch(pendingSearch.trim());
                  setAppliedPeriodo(pendingPeriodo);
                  setPage(1);
                }
              },
            }}
            rightActions={
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => {
                  setAppliedSearch(pendingSearch.trim());
                  setAppliedPeriodo(pendingPeriodo);
                  setPage(1);
                }}
                className="w-full"
                isLoading={query.isFetching}
              >
                Pesquisar
              </ButtonCustom>
            }
            rightActionsClassName="lg:col-span-1 lg:row-start-2 lg:col-start-12 lg:items-end lg:justify-end"
          />
        </div>
      </div>

      {query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(query.error as Error).message || "Não foi possível carregar os estágios."}
        </div>
      ) : null}

      {!showEmptyState ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Estágio
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Alunos vinculados
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Atualizado em
                  </TableHead>
                  <TableHead className="w-12 py-4 px-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <EstagioTableSkeleton rows={pageSize} />
                ) : (
                  items.map((estagio) => (
                    <EstagioRow key={estagio.id} estagio={estagio} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalItems > 0 ? (
            <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {(() => {
                    const resolvedPage = pagination.page ?? currentPage;
                    const resolvedPageSize = pagination.pageSize ?? pageSize;
                    const startIndex = (resolvedPage - 1) * resolvedPageSize + 1;
                    const endIndex = Math.min(
                      resolvedPage * resolvedPageSize,
                      totalItems
                    );
                    return `Mostrando ${startIndex} a ${endIndex} de ${totalItems} estágio${
                      totalItems === 1 ? "" : "s"
                    }`;
                  })()}
                </span>
              </div>

              {totalPages > 1 ? (
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

                  {visiblePages.map((pageNumber) => (
                    <ButtonCustom
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNumber}
                    </ButtonCustom>
                  ))}

                  {visiblePages[visiblePages.length - 1] < totalPages && (
                    <>
                      {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                        <span className="text-gray-400">...</span>
                      )}
                      <ButtonCustom
                        variant={currentPage === totalPages ? "primary" : "outline"}
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
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de estágios"
            title="Nenhum estágio encontrado"
            description="Nenhum estágio encontrado para os filtros aplicados."
          />
        </div>
      )}
    </div>
  );
}

export default EstagiosDashboard;
