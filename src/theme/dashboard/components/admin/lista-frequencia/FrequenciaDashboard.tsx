"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
  SelectCustom,
} from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import type { SelectOption } from "@/components/ui/custom/select/types";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useTurmasForSelect } from "./hooks/useTurmasForSelect";
import { useAulasForSelect } from "./hooks/useAulasForSelect";
import { useFrequenciaDashboardQuery } from "./hooks/useFrequenciaDashboardQuery";
import {
  useFrequenciaResumoQuery,
  type FrequenciaResumoPeriodo,
} from "./hooks/useFrequenciaResumoQuery";
import { useUpdateFrequenciaMutation } from "./hooks/useUpdateFrequenciaMutation";
import { FrequenciaRow } from "./components/FrequenciaRow";
import { FrequenciaTableSkeleton } from "./components/FrequenciaTableSkeleton";
import { FrequenciaResumoTableSkeleton } from "./components/FrequenciaResumoTableSkeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlunoCell } from "./components/AlunoCell";

const SEARCH_HELPER_TEXT = "Pesquise pelo nome, CPF ou código do aluno.";

type FrequenciaViewMode = "AULA" | "RESUMO";

const PERIODO_OPTIONS: SelectOption[] = [
  { value: "TOTAL", label: "Todo o período" },
  { value: "SEMANA", label: "Semana" },
  { value: "MES", label: "Mês" },
  { value: "DIA", label: "Dia" },
];

type SortDirection = "asc" | "desc";
type AulaSortBy = "ALUNO";
type ResumoSortBy = "ALUNO" | "TAXA";

const RESUMO_MES_OPTIONS: SelectOption[] = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

export function FrequenciaDashboard({ className }: { className?: string }) {
  const now = useMemo(() => new Date(), []);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<FrequenciaViewMode>("AULA");
  const [periodo, setPeriodo] = useState<FrequenciaResumoPeriodo>("TOTAL");
  const [resumoDia, setResumoDia] = useState<Date | null>(new Date());
  const [resumoMes, setResumoMes] = useState<number>(new Date().getMonth());
  const [resumoAno, setResumoAno] = useState<number>(new Date().getFullYear());
  const [resumoSemana, setResumoSemana] = useState<number>(
    Math.max(1, Math.ceil(new Date().getDate() / 7))
  );
  const [aulaSortBy, setAulaSortBy] = useState<AulaSortBy>("ALUNO");
  const [aulaSortDirection, setAulaSortDirection] =
    useState<SortDirection>("asc");
  const [resumoSortBy, setResumoSortBy] = useState<ResumoSortBy>("ALUNO");
  const [resumoSortDirection, setResumoSortDirection] =
    useState<SortDirection>("asc");

  const toggleAulaSort = useCallback((field: AulaSortBy) => {
    setAulaSortBy((prev) => {
      if (prev !== field) {
        setAulaSortDirection("asc");
        return field;
      }
      setAulaSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
    setCurrentPage(1);
  }, []);

  const setAulaSort = useCallback(
    (field: AulaSortBy, direction: SortDirection) => {
      setAulaSortBy(field);
      setAulaSortDirection(direction);
      setCurrentPage(1);
    },
    []
  );

  const toggleResumoSort = useCallback((field: ResumoSortBy) => {
    setResumoSortBy((prev) => {
      if (prev !== field) {
        setResumoSortDirection("asc");
        return field;
      }
      setResumoSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
    setCurrentPage(1);
  }, []);

  const setResumoSort = useCallback(
    (field: ResumoSortBy, direction: SortDirection) => {
      setResumoSortBy(field);
      setResumoSortDirection(direction);
      setCurrentPage(1);
    },
    []
  );
  const role = useUserRole();

  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { turmas, isLoading: loadingTurmas } =
    useTurmasForSelect(selectedCourseId);
  const aulasQuery = useAulasForSelect({ turmaId: selectedTurmaId });

  const selectedAula = useMemo(
    () =>
      selectedAulaId ? aulasQuery.itemById.get(selectedAulaId) ?? null : null,
    [aulasQuery.itemById, selectedAulaId]
  );

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

  const frequenciaQuery = useFrequenciaDashboardQuery({
    cursoId: selectedCourseId,
    turmaId: selectedTurmaId,
    aula: viewMode === "AULA" ? selectedAula : null,
    search: normalizedSearch,
    sortBy: aulaSortBy,
    sortDirection: aulaSortDirection,
    page: currentPage,
    pageSize,
  });

  const resumoQuery = useFrequenciaResumoQuery({
    cursoId: selectedCourseId,
    turmaId: selectedTurmaId,
    periodo,
    anchorDate:
      periodo === "TOTAL"
        ? null
        : periodo === "DIA"
        ? resumoDia
        : periodo === "MES"
        ? new Date(resumoAno, resumoMes, 1)
        : new Date(
            resumoAno,
            resumoMes,
            (Math.max(1, resumoSemana) - 1) * 7 + 1
          ),
    aulas: aulasQuery.items,
    search: normalizedSearch,
    sortBy: resumoSortBy,
    sortDirection: resumoSortDirection,
    page: currentPage,
    pageSize,
  });

  const updateFrequencia = useUpdateFrequenciaMutation();

  const isAulaView = viewMode === "AULA";
  const aulaItems = useMemo(
    () => frequenciaQuery.data?.items ?? [],
    [frequenciaQuery.data]
  );
  const resumoItems = useMemo(
    () => resumoQuery.data?.items ?? [],
    [resumoQuery.data]
  );
  const canEditByTime = frequenciaQuery.data?.canEdit ?? false;
  const allowedRoles = useMemo(
    () => [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
    []
  );
  const overrideRoles = useMemo(
    () => [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
    []
  );
  const hasPermission = role ? allowedRoles.includes(role) : false;
  const canEdit = hasPermission && canEditByTime;
  const canOverride = role ? overrideRoles.includes(role) : false;
  const blockedMessage = !hasPermission
    ? "Seu perfil não tem permissão para lançar frequência."
    : "A frequência só pode ser lançada após a aula acontecer.";
  const pagination = frequenciaQuery.data?.pagination;
  const paginationToUse = isAulaView
    ? pagination
    : resumoQuery.data?.pagination;
  const totalItems = paginationToUse?.total ?? 0;
  const totalPages = paginationToUse?.totalPages ?? 1;

  const isFiltersReady = isAulaView
    ? Boolean(selectedCourseId && selectedTurmaId && selectedAulaId)
    : Boolean(selectedCourseId && selectedTurmaId);
  const shouldShowSkeleton =
    isFiltersReady &&
    (isAulaView
      ? frequenciaQuery.isFetching || frequenciaQuery.isLoading
      : resumoQuery.isFetching ||
        resumoQuery.isLoading ||
        aulasQuery.isLoading);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursos,
        placeholder: loadingCursos ? "Carregando..." : "Selecionar",
        disabled: loadingCursos,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "turmaId",
        label: "Turma",
        mode: "single" as const,
        options: turmas,
        placeholder: !selectedCourseId
          ? "Selecione um curso"
          : loadingTurmas
          ? "Carregando..."
          : "Selecionar",
        disabled: !selectedCourseId || loadingTurmas,
        emptyPlaceholder: selectedCourseId
          ? "Sem turmas disponíveis"
          : "Selecione um curso primeiro",
      },
      ...(!isAulaView
        ? ([
            {
              key: "periodo",
              label: "Período",
              mode: "single" as const,
              options: PERIODO_OPTIONS,
              placeholder: "Selecionar",
              disabled: false,
            } satisfies FilterField,
            ...(periodo === "DIA"
              ? ([
                  {
                    key: "dia",
                    label: "Dia",
                    type: "date" as const,
                    required: true,
                    placeholder: "Selecionar",
                    disabled: false,
                    maxDate: new Date(),
                    clearable: false,
                  } satisfies FilterField,
                ] as const)
              : []),
            ...(periodo === "MES" || periodo === "SEMANA"
              ? ([
                  {
                    key: "mes",
                    label: "Mês",
                    mode: "single" as const,
                    options: RESUMO_MES_OPTIONS,
                    placeholder: "Selecionar",
                    required: true,
                    disabled: false,
                  } satisfies FilterField,
                  {
                    key: "ano",
                    label: "Ano",
                    mode: "single" as const,
                    options: Array.from({ length: 4 }).map((_, idx) => {
                      const y = now.getFullYear() - 2 + idx;
                      return { value: String(y), label: String(y) };
                    }),
                    placeholder: "Selecionar",
                    required: true,
                    disabled: false,
                  } satisfies FilterField,
                ] as const)
              : []),
            ...(periodo === "SEMANA"
              ? ([
                  {
                    key: "semana",
                    label: "Semana do mês",
                    mode: "single" as const,
                    options: (() => {
                      const lastDay = new Date(
                        resumoAno,
                        resumoMes + 1,
                        0
                      ).getDate();
                      const totalWeeks = Math.max(1, Math.ceil(lastDay / 7));
                      return Array.from({ length: totalWeeks }).map((_, i) => {
                        const start = i * 7 + 1;
                        const end = Math.min((i + 1) * 7, lastDay);
                        return {
                          value: String(i + 1),
                          label: `Semana ${i + 1} (${String(start).padStart(
                            2,
                            "0"
                          )}–${String(end).padStart(2, "0")})`,
                        };
                      });
                    })(),
                    placeholder: "Selecionar",
                    required: true,
                    disabled: false,
                  } satisfies FilterField,
                ] as const)
              : []),
          ] as const)
        : []),
      ...(isAulaView
        ? ([
            {
              key: "aulaId",
              label: "Aula",
              mode: "single" as const,
              options: aulasQuery.options,
              placeholder: !selectedTurmaId
                ? "Selecione uma turma"
                : aulasQuery.isLoading
                ? "Carregando..."
                : "Selecionar",
              disabled: !selectedTurmaId || aulasQuery.isLoading,
              emptyPlaceholder: selectedTurmaId
                ? "Sem aulas disponíveis"
                : "Selecione uma turma primeiro",
            } satisfies FilterField,
          ] as const)
        : []),
    ],
    [
      aulasQuery.isLoading,
      aulasQuery.options,
      cursos,
      isAulaView,
      loadingCursos,
      loadingTurmas,
      now,
      periodo,
      resumoAno,
      resumoMes,
      selectedCourseId,
      selectedTurmaId,
      turmas,
    ]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaId: selectedTurmaId,
      ...(isAulaView
        ? { aulaId: selectedAulaId }
        : {
            periodo,
            ...(periodo === "DIA" ? { dia: resumoDia } : {}),
            ...(periodo === "MES" || periodo === "SEMANA"
              ? { mes: String(resumoMes), ano: String(resumoAno) }
              : {}),
            ...(periodo === "SEMANA" ? { semana: String(resumoSemana) } : {}),
          }),
    }),
    [
      isAulaView,
      periodo,
      resumoAno,
      resumoDia,
      resumoMes,
      resumoSemana,
      selectedAulaId,
      selectedCourseId,
      selectedTurmaId,
    ]
  );

  const showEmptyState =
    !shouldShowSkeleton &&
    (!isFiltersReady ||
      (isAulaView ? aulaItems.length === 0 : resumoItems.length === 0));

  const resumoGridClassName = useMemo(() => {
    if (isAulaView) return undefined;

    const base = "lg:grid-cols-12 lg:gap-3 xl:gap-4";
    // Tailwind: para combinar seletor + breakpoint, use `lg:[&...]:...` (e não `[&...]:lg:...`).
    const row1 =
      "lg:[&>*:nth-child(1)]:col-span-4 lg:[&>*:nth-child(2)]:col-span-3 lg:[&>*:nth-child(3)]:col-span-3 lg:[&>*:nth-child(4)]:col-span-2";

    if (periodo === "TOTAL") {
      // 1 search, 2 curso, 3 turma, 4 período, 5 actions
      return [
        base,
        row1,
        "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-11 lg:[&>*:nth-child(5)]:col-span-2",
      ].join(" ");
    }

    if (periodo === "DIA") {
      // 1 search, 2 curso, 3 turma, 4 período, 5 dia, 6 actions
      return [
        base,
        row1,
        "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-1 lg:[&>*:nth-child(5)]:col-span-5 lg:[&>*:nth-child(5)]:max-w-[400px] lg:[&>*:nth-child(6)]:justify-self-start",
        "lg:[&>*:nth-child(6)]:row-start-2 lg:[&>*:nth-child(6)]:col-start-11 lg:[&>*:nth-child(6)]:col-span-2",
      ].join(" ");
    }

    if (periodo === "MES") {
      // 1 search, 2 curso, 3 turma, 4 período, 5 mês, 6 ano, 7 actions
      return [
        base,
        row1,
        "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-1 lg:[&>*:nth-child(5)]:col-span-3",
        "lg:[&>*:nth-child(6)]:row-start-2 lg:[&>*:nth-child(6)]:col-start-4 lg:[&>*:nth-child(6)]:col-span-2",
        "lg:[&>*:nth-child(7)]:row-start-2 lg:[&>*:nth-child(7)]:col-start-11 lg:[&>*:nth-child(7)]:col-span-2",
      ].join(" ");
    }

    // SEMANA
    // 1 search, 2 curso, 3 turma, 4 período, 5 mês, 6 ano, 7 semana, 8 actions
    return [
      base,
      row1,
      "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-1 lg:[&>*:nth-child(5)]:col-span-3",
      "lg:[&>*:nth-child(6)]:row-start-2 lg:[&>*:nth-child(6)]:col-start-4 lg:[&>*:nth-child(6)]:col-span-2",
      "lg:[&>*:nth-child(7)]:row-start-2 lg:[&>*:nth-child(7)]:col-start-6 lg:[&>*:nth-child(7)]:col-span-4",
      "lg:[&>*:nth-child(8)]:row-start-2 lg:[&>*:nth-child(8)]:col-start-11 lg:[&>*:nth-child(8)]:col-span-2",
    ].join(" ");
  }, [isAulaView, periodo]);

  const emptyStateTitle = useMemo(() => {
    if (!isFiltersReady) {
      return isAulaView
        ? "Selecione curso, turma e aula"
        : "Selecione curso e turma";
    }
    if (isAulaView && frequenciaQuery.error)
      return "Não foi possível carregar a frequência";
    if (!isAulaView && resumoQuery.error)
      return "Não foi possível carregar o resumo";
    if (!isAulaView && (resumoQuery.data?.totalAulasNoPeriodo ?? 0) === 0) {
      return "Sem aulas no período selecionado";
    }
    return "Nenhum aluno encontrado";
  }, [
    frequenciaQuery.error,
    isAulaView,
    isFiltersReady,
    resumoQuery.data?.totalAulasNoPeriodo,
    resumoQuery.error,
  ]);

  const emptyStateDescription = useMemo(() => {
    if (!isFiltersReady) {
      return isAulaView
        ? "Escolha um curso, uma turma e uma aula para lançar a frequência."
        : "Escolha um curso e uma turma para visualizar o resumo.";
    }
    if (isAulaView && frequenciaQuery.error)
      return "Tente novamente em instantes.";
    if (!isAulaView && resumoQuery.error)
      return "Tente novamente em instantes.";
    if (!isAulaView && (resumoQuery.data?.totalAulasNoPeriodo ?? 0) === 0) {
      return "Ajuste o filtro de período ou selecione outra data.";
    }
    return "Nenhum aluno encontrado para os filtros aplicados.";
  }, [
    frequenciaQuery.error,
    isAulaView,
    isFiltersReady,
    resumoQuery.data?.totalAulasNoPeriodo,
    resumoQuery.error,
  ]);

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="space-y-4">
        <div className="py-2">
          <div className="space-y-3">
            {/* View Mode Selector - Clean & Minimal */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-auto md:max-w-xs bg-white rounded-md">
                <SelectCustom
                  options={[
                    {
                      value: "AULA",
                      label: "Por Aula",
                    },
                    {
                      value: "RESUMO",
                      label: "Resumo",
                    },
                  ]}
                  value={viewMode}
                  onChange={(value) => {
                    if (!value) return;
                    setViewMode(value as FrequenciaViewMode);
                    setCurrentPage(1);
                  }}
                  placeholder="Visualização"
                  fullWidth={false}
                  size="sm"
                />
              </div>
            </div>

            <FilterBar
              fields={filterFields}
              values={filterValues}
              gridClassName={resumoGridClassName}
              onChange={(key, value) => {
                if (key === "cursoId") {
                  setSelectedCourseId((value as string) || null);
                  setSelectedTurmaId(null);
                  setSelectedAulaId(null);
                  setCurrentPage(1);
                }
                if (key === "turmaId") {
                  setSelectedTurmaId((value as string) || null);
                  setSelectedAulaId(null);
                  setCurrentPage(1);
                }
                if (key === "aulaId") {
                  setSelectedAulaId((value as string) || null);
                  setCurrentPage(1);
                }
                if (key === "periodo") {
                  const next = (value as FrequenciaResumoPeriodo) || "TOTAL";
                  setPeriodo(next);
                  if (next === "DIA") setResumoDia(new Date());
                  if (next === "MES") {
                    setResumoMes(now.getMonth());
                    setResumoAno(now.getFullYear());
                  }
                  if (next === "SEMANA") {
                    setResumoMes(now.getMonth());
                    setResumoAno(now.getFullYear());
                    setResumoSemana(Math.max(1, Math.ceil(now.getDate() / 7)));
                  }
                  setCurrentPage(1);
                }
                if (key === "dia") {
                  setResumoDia((value as Date) || null);
                  setCurrentPage(1);
                }
                if (key === "mes") {
                  if (typeof value === "string" && value.trim().length > 0) {
                    const next = Number(value);
                    if (Number.isFinite(next)) setResumoMes(next);
                  }
                  setCurrentPage(1);
                }
                if (key === "ano") {
                  if (typeof value === "string" && value.trim().length > 0) {
                    const next = Number(value);
                    if (Number.isFinite(next)) setResumoAno(next);
                  }
                  setCurrentPage(1);
                }
                if (key === "semana") {
                  if (typeof value === "string" && value.trim().length > 0) {
                    const next = Number(value);
                    if (Number.isFinite(next)) setResumoSemana(next);
                  }
                  setCurrentPage(1);
                }
              }}
              onClearAll={() => {
                setPendingSearchTerm("");
                setAppliedSearchTerm("");
                setSelectedCourseId(null);
                setSelectedTurmaId(null);
                setSelectedAulaId(null);
                setPeriodo("TOTAL");
                setResumoDia(new Date());
                setResumoMes(now.getMonth());
                setResumoAno(now.getFullYear());
                setResumoSemana(Math.max(1, Math.ceil(now.getDate() / 7)));
                setCurrentPage(1);
              }}
              search={{
                label: "Pesquisar aluno",
                value: pendingSearchTerm,
                onChange: (value) => setPendingSearchTerm(value),
                placeholder: "Buscar por nome ou ID...",
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
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
                  <ButtonCustom
                    variant="primary"
                    size="lg"
                    onClick={() => handleSearchSubmit()}
                    disabled={!isSearchInputValid || !isFiltersReady}
                    className="md:w-full xl:w-auto"
                  >
                    Pesquisar
                  </ButtonCustom>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {!showEmptyState && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          {isAulaView && !canEdit && selectedAulaId && (
            <div className="border-b border-amber-200 bg-linear-to-r from-amber-50 to-amber-50/50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {blockedMessage}
            </div>
          )}
          {!isAulaView && isFiltersReady ? (
            <div className="flex justify-end border-b border-gray-100 bg-white px-4 py-2 text-xs text-gray-600">
              Aulas no período:{" "}
              <span className="ml-1 font-medium text-gray-900 tabular-nums">
                {resumoQuery.data?.totalAulasNoPeriodo ?? 0}
              </span>
            </div>
          ) : null}
          <div className="overflow-x-auto">
            {isAulaView ? (
              <Table className="min-w-[960px]">
                <TableHeader>
                  <TableRow className="border-gray-100 bg-white hover:bg-white">
                    <TableHead
                      className="font-medium text-gray-700 py-4 px-3"
                      aria-sort={
                        aulaSortBy === "ALUNO"
                          ? aulaSortDirection === "asc"
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
                              onClick={() => toggleAulaSort("ALUNO")}
                              className={cn(
                                "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                                aulaSortBy === "ALUNO" && "text-gray-900"
                              )}
                            >
                              Aluno
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {aulaSortBy === "ALUNO"
                              ? aulaSortDirection === "asc"
                                ? "A → Z"
                                : "Z → A"
                              : "Ordenar por aluno"}
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
                                  setAulaSort("ALUNO", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    aulaSortBy === "ALUNO" &&
                                      aulaSortDirection === "asc" &&
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
                                  setAulaSort("ALUNO", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    aulaSortBy === "ALUNO" &&
                                      aulaSortDirection === "desc" &&
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
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Evidência
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3 w-[420px]">
                      Motivo
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3 text-right">
                      Frequência
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shouldShowSkeleton ? (
                    <FrequenciaTableSkeleton rows={8} />
                  ) : (
                    aulaItems.map((item) => (
                      <FrequenciaRow
                        key={item.key}
                        item={item}
                        canEdit={canEdit}
                        canOverride={canOverride}
                        aula={selectedAula!}
                        aulaNome={selectedAula?.titulo ?? null}
                        blockedMessage={blockedMessage}
                        isSaving={
                          updateFrequencia.isPending &&
                          updateFrequencia.variables?.inscricaoId ===
                            item.inscricaoId &&
                          updateFrequencia.variables?.aulaId === item.aulaId
                        }
                        onSave={({ status, motivo }) =>
                          updateFrequencia
                            .mutateAsync({
                              cursoId: item.cursoId,
                              turmaId: item.turmaId,
                              aulaId: item.aulaId,
                              inscricaoId: item.inscricaoId,
                              frequenciaId: item.id,
                              status,
                              justificativa: motivo,
                            })
                            .then(() => undefined)
                        }
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="border-gray-100 bg-white hover:bg-white">
                    <TableHead
                      className="font-medium text-gray-700 py-4 px-3"
                      aria-sort={
                        resumoSortBy === "ALUNO"
                          ? resumoSortDirection === "asc"
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
                              onClick={() => toggleResumoSort("ALUNO")}
                              className={cn(
                                "inline-flex items-center gap-1 px-1 py-1 cursor-pointer transition-colors bg-transparent",
                                resumoSortBy === "ALUNO" && "text-gray-900"
                              )}
                            >
                              Aluno
                            </button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={6}>
                            {resumoSortBy === "ALUNO"
                              ? resumoSortDirection === "asc"
                                ? "A → Z"
                                : "Z → A"
                              : "Ordenar por aluno"}
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
                                  setResumoSort("ALUNO", "asc");
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-400",
                                    resumoSortBy === "ALUNO" &&
                                      resumoSortDirection === "asc" &&
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
                                  setResumoSort("ALUNO", "desc");
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-400 -mt-0.5",
                                    resumoSortBy === "ALUNO" &&
                                      resumoSortDirection === "desc" &&
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
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Aulas
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Presenças
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Ausências
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      <div className="flex items-center justify-end gap-2">
                        <span>Taxa (%)</span>
                        <div className="flex flex-col -space-y-1.5 items-center leading-none">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-gray-100/60 transition-colors"
                                aria-label="Ordenar menor → maior"
                                onClick={() => {
                                  setResumoSortBy("TAXA");
                                  setResumoSortDirection("asc");
                                  setCurrentPage(1);
                                }}
                              >
                                <ChevronUp
                                  className={cn(
                                    "h-3 w-3 text-gray-300",
                                    resumoSortBy === "TAXA" &&
                                      resumoSortDirection === "asc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              Menor → maior
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="rounded p-0.5 cursor-pointer bg-transparent hover:bg-gray-100/60 transition-colors"
                                aria-label="Ordenar maior → menor"
                                onClick={() => {
                                  setResumoSortBy("TAXA");
                                  setResumoSortDirection("desc");
                                  setCurrentPage(1);
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 text-gray-300 -mt-0.5",
                                    resumoSortBy === "TAXA" &&
                                      resumoSortDirection === "desc" &&
                                      "text-[var(--primary-color)]"
                                  )}
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                              Maior → menor
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shouldShowSkeleton ? (
                    <FrequenciaResumoTableSkeleton rows={8} />
                  ) : (
                    resumoItems.map((row) => (
                      <TableRow
                        key={row.key}
                        className="border-gray-100 hover:bg-blue-50/40 transition-colors"
                      >
                        <TableCell className="py-4 px-4">
                          <AlunoCell
                            alunoId={row.alunoId}
                            alunoNome={row.alunoNome}
                            alunoCodigo={row.alunoCodigo}
                            alunoCpf={row.alunoCpf}
                            avatarUrl={(row as any)?.avatarUrl ?? null}
                          />
                        </TableCell>
                        <TableCell className="py-4 px-3">
                          <span className="text-sm text-gray-800">
                            {row.totalAulas}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-3">
                          <span className="text-sm text-emerald-700 font-medium">
                            {row.presencas}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-3">
                          <div className="text-sm text-red-700 font-medium">
                            {row.ausencias}
                            {row.justificadas > 0 && (
                              <span className="ml-2 text-xs font-normal text-amber-700">
                                ({row.justificadas} just.)
                              </span>
                            )}
                          </div>
                          {row.pendentes > 0 && (
                            <div className="text-xs text-gray-500">
                              Pendentes: {row.pendentes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-3">
                          <div className="flex items-center justify-end gap-3">
                            <Progress
                              value={row.taxaPresencaPct}
                              className="h-2 w-36"
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium tabular-nums",
                                row.taxaPresencaPct >= 75
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : row.taxaPresencaPct >= 50
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              )}
                            >
                              {row.taxaPresencaPct}%
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {totalItems > 0 && totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </ButtonCustom>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </ButtonCustom>
              </div>
            )}
          </div>
        </div>
      )}

      {showEmptyState && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <EmptyState
            fullHeight
            maxContentWidth="sm"
            illustration="books"
            illustrationAlt="Ilustração de frequência"
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        </div>
      )}
    </div>
  );
}

export default FrequenciaDashboard;
