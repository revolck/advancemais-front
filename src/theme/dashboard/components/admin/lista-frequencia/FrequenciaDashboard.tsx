"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  ButtonCustom,
  EmptyState,
  FilterBar,
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
import { listTurmas, type FrequenciaOrigemTipo } from "@/api/cursos";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useTurmasForSelect } from "./hooks/useTurmasForSelect";
import { useAulasForSelect } from "./hooks/useAulasForSelect";
import { useAvaliacoesForSelect } from "./hooks/useAvaliacoesForSelect";
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

type ApiLikeError = Error & {
  status?: number;
  code?: string;
  details?: {
    code?: string;
    message?: string;
  };
};

function resolveQueryErrorCopy(error: unknown): {
  title: string;
  description: string;
} {
  const apiError = error as ApiLikeError | undefined;
  const status = apiError?.status;
  const code = String(
    apiError?.details?.code ?? apiError?.code ?? ""
  ).toUpperCase();
  const backendMessage =
    apiError?.details?.message ||
    apiError?.message ||
    "Não foi possível carregar os dados agora.";

  if (status === 401 || code === "UNAUTHORIZED") {
    return {
      title: "Sessão expirada",
      description: "Faça login novamente para acessar a frequência.",
    };
  }

  if (status === 403 || code === "FORBIDDEN") {
    return {
      title: "Acesso fora do escopo",
      description: backendMessage,
    };
  }

  if (
    (status === 500 && code === "INSTRUTOR_SCOPE_ERROR") ||
    code === "INSTRUTOR_SCOPE_ERROR"
  ) {
    return {
      title: "Erro ao aplicar escopo do instrutor",
      description: backendMessage,
    };
  }

  return {
    title: "Não foi possível carregar os dados",
    description: backendMessage,
  };
}

export function FrequenciaDashboard({ className }: { className?: string }) {
  const now = useMemo(() => new Date(), []);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedOrigemTipo, setSelectedOrigemTipo] = useState<
    FrequenciaOrigemTipo | null
  >(null);
  const [selectedOrigemId, setSelectedOrigemId] = useState<string | null>(null);
  const viewMode = "AULA";
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
  const provasQuery = useAvaliacoesForSelect({
    cursoId: selectedCourseId,
    turmaId: selectedTurmaId,
    tipo: "PROVA",
  });
  const atividadesQuery = useAvaliacoesForSelect({
    cursoId: selectedCourseId,
    turmaId: selectedTurmaId,
    tipo: "ATIVIDADE",
  });

  const selectedAula = useMemo(
    () =>
      selectedOrigemTipo === "AULA" && selectedOrigemId
        ? aulasQuery.itemById.get(selectedOrigemId) ?? null
        : null,
    [aulasQuery.itemById, selectedOrigemId, selectedOrigemTipo]
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
    origemTipo: selectedOrigemTipo,
    origemId: selectedOrigemId,
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
  const origemTipoOptions = useMemo<SelectOption[]>(
    () => [
      { value: "AULA", label: "Aula" },
      { value: "PROVA", label: "Prova" },
      { value: "ATIVIDADE", label: "Atividade" },
    ],
    []
  );
  const origemOptions = useMemo<SelectOption[]>(() => {
    if (selectedOrigemTipo === "PROVA") return provasQuery.options;
    if (selectedOrigemTipo === "ATIVIDADE") return atividadesQuery.options;
    if (!selectedOrigemTipo) return [];
    return aulasQuery.options;
  }, [
    atividadesQuery.options,
    aulasQuery.options,
    provasQuery.options,
    selectedOrigemTipo,
  ]);
  const aulaItems = useMemo(
    () => frequenciaQuery.data?.items ?? [],
    [frequenciaQuery.data]
  );
  const cursoIdsFromRows = useMemo(
    () =>
      Array.from(
        new Set(
          aulaItems
            .map((item) => item.cursoId)
            .filter((cursoId): cursoId is string => Boolean(cursoId))
        )
      ),
    [aulaItems]
  );
  const turmasByCursoQueries = useQueries({
    queries: cursoIdsFromRows.map((cursoId) => ({
      queryKey: ["turmas", "for-select", "frequencia-rows", cursoId],
      queryFn: () => listTurmas(cursoId, { page: 1, pageSize: 200 }),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    })),
  });
  const cursoLabelById = useMemo(
    () => new Map(cursos.map((curso) => [String(curso.value), curso.label])),
    [cursos]
  );
  const turmaLabelById = useMemo(
    () => {
      const map = new Map<string, string>(
        turmas.map((turma) => [String(turma.value), turma.label])
      );

      // Fallback para listagem global: resolve nome da turma via cursoId/turmaId
      // quando a API ainda não retorna turmaNome no item de frequência.
      turmasByCursoQueries.forEach((query) => {
        if (!Array.isArray(query.data)) return;
        query.data.forEach((turma) => {
          const turmaId = String((turma as any)?.id ?? "");
          const turmaNome = (turma as any)?.nome;
          if (!turmaId || !turmaNome || map.has(turmaId)) return;
          map.set(turmaId, turmaNome);
        });
      });

      aulaItems.forEach((item) => {
        if (item.turmaId && item.turmaNome && !map.has(item.turmaId)) {
          map.set(item.turmaId, item.turmaNome);
        }
      });

      return map;
    },
    [aulaItems, turmas, turmasByCursoQueries]
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
  const totalItems =
    paginationToUse?.total ??
    (isAulaView ? aulaItems.length : resumoItems.length);
  const totalPages =
    paginationToUse?.totalPages ??
    Math.max(1, Math.ceil(totalItems / pageSize));

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
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      }
    },
    [currentPage, totalPages]
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const isFiltersReady = isAulaView
    ? true
    : Boolean(selectedCourseId && selectedTurmaId);
  const shouldShowSkeleton = isAulaView
    ? frequenciaQuery.isFetching || frequenciaQuery.isLoading
    : isFiltersReady &&
      (resumoQuery.isFetching || resumoQuery.isLoading || aulasQuery.isLoading);

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
              key: "origemTipo",
              label: "Tipo de origem",
              mode: "single" as const,
              options: origemTipoOptions,
              placeholder: "Selecionar",
              disabled: !selectedTurmaId,
            } satisfies FilterField,
            ...(selectedOrigemTipo
              ? ([
                  {
                    key: "origemId",
                    label:
                      selectedOrigemTipo === "PROVA"
                        ? "Prova"
                        : selectedOrigemTipo === "ATIVIDADE"
                          ? "Atividade"
                          : "Aula",
                    mode: "single" as const,
                    options: origemOptions,
                    placeholder: !selectedTurmaId
                      ? "Selecione uma turma"
                      : aulasQuery.isLoading ||
                          provasQuery.isLoading ||
                          atividadesQuery.isLoading
                        ? "Carregando..."
                        : "Selecionar",
                    disabled:
                      !selectedTurmaId ||
                      aulasQuery.isLoading ||
                      provasQuery.isLoading ||
                      atividadesQuery.isLoading,
                    emptyPlaceholder: selectedTurmaId
                      ? "Sem opções disponíveis"
                      : "Selecione uma turma primeiro",
                  } satisfies FilterField,
                ] as const)
              : []),
          ] as const)
        : []),
    ],
    [
      aulasQuery.isLoading,
      atividadesQuery.isLoading,
      cursos,
      isAulaView,
      loadingCursos,
      loadingTurmas,
      now,
      origemOptions,
      origemTipoOptions,
      periodo,
      provasQuery.isLoading,
      resumoAno,
      resumoMes,
      selectedCourseId,
      selectedOrigemTipo,
      selectedTurmaId,
      turmas,
    ]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaId: selectedTurmaId,
      ...(isAulaView
        ? { origemTipo: selectedOrigemTipo, origemId: selectedOrigemId }
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
      selectedCourseId,
      selectedOrigemId,
      selectedOrigemTipo,
      selectedTurmaId,
    ]
  );

  const showEmptyState =
    !shouldShowSkeleton &&
    ((isAulaView && aulaItems.length === 0) ||
      (!isAulaView && (!isFiltersReady || resumoItems.length === 0)));
  const currentViewError = isAulaView
    ? frequenciaQuery.error
    : resumoQuery.error;
  const currentErrorCopy = useMemo(
    () => resolveQueryErrorCopy(currentViewError),
    [currentViewError]
  );

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

  const aulaGridClassName = useMemo(() => {
    const base = "lg:grid-cols-12 lg:gap-3 xl:gap-4";
    const row1 =
      "lg:[&>*:nth-child(1)]:col-span-6 lg:[&>*:nth-child(2)]:col-span-6";

    if (selectedOrigemTipo) {
      // 1 search, 2 curso, 3 turma, 4 tipoOrigem, 5 origem, 6 actions
      return [
        base,
        row1,
        "lg:[&>*:nth-child(3)]:row-start-2 lg:[&>*:nth-child(3)]:col-start-1 lg:[&>*:nth-child(3)]:col-span-3",
        "lg:[&>*:nth-child(4)]:row-start-2 lg:[&>*:nth-child(4)]:col-start-4 lg:[&>*:nth-child(4)]:col-span-3",
        "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-7 lg:[&>*:nth-child(5)]:col-span-5",
        "lg:[&>*:nth-child(6)]:row-start-2 lg:[&>*:nth-child(6)]:col-start-12 lg:[&>*:nth-child(6)]:col-span-1",
      ].join(" ");
    }

    // 1 search, 2 curso, 3 turma, 4 tipoOrigem, 5 actions
    return [
      base,
      row1,
      "lg:[&>*:nth-child(3)]:row-start-2 lg:[&>*:nth-child(3)]:col-start-1 lg:[&>*:nth-child(3)]:col-span-6",
      "lg:[&>*:nth-child(4)]:row-start-2 lg:[&>*:nth-child(4)]:col-start-7 lg:[&>*:nth-child(4)]:col-span-5",
      "lg:[&>*:nth-child(5)]:row-start-2 lg:[&>*:nth-child(5)]:col-start-12 lg:[&>*:nth-child(5)]:col-span-1",
    ].join(" ");
  }, [selectedOrigemTipo]);

  const emptyStateTitle = useMemo(() => {
    if (!isFiltersReady && !isAulaView) {
      return isAulaView
        ? "Selecione curso, turma e origem"
        : "Selecione curso e turma";
    }
    if (currentViewError) return currentErrorCopy.title;
    if (!isAulaView && (resumoQuery.data?.totalAulasNoPeriodo ?? 0) === 0) {
      return "Sem aulas no período selecionado";
    }
    return isAulaView ? "Nenhuma frequência encontrada" : "Nenhum aluno encontrado";
  }, [
    currentErrorCopy.title,
    currentViewError,
    isAulaView,
    isFiltersReady,
    resumoQuery.data?.totalAulasNoPeriodo,
  ]);

  const emptyStateDescription = useMemo(() => {
    if (!isFiltersReady && !isAulaView) {
      return isAulaView
        ? "Escolha um curso, uma turma e a origem para lançar a frequência."
        : "Escolha um curso e uma turma para visualizar o resumo.";
    }
    if (currentViewError) return currentErrorCopy.description;
    if (!isAulaView && (resumoQuery.data?.totalAulasNoPeriodo ?? 0) === 0) {
      return "Ajuste o filtro de período ou selecione outra data.";
    }
    return isAulaView
      ? "Nenhum registro de frequência para os filtros aplicados."
      : "Nenhum aluno encontrado para os filtros aplicados.";
  }, [
    currentErrorCopy.description,
    currentViewError,
    isAulaView,
    isFiltersReady,
    resumoQuery.data?.totalAulasNoPeriodo,
  ]);

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="space-y-4">
        <div className="py-2">
          <div className="space-y-3">
            <FilterBar
              fields={filterFields}
              values={filterValues}
              gridClassName={isAulaView ? aulaGridClassName : resumoGridClassName}
              rightActionsClassName={
                isAulaView
                  ? "lg:justify-stretch lg:items-stretch xl:flex-row xl:justify-stretch xl:items-stretch"
                  : undefined
              }
              onChange={(key, value) => {
                if (key === "cursoId") {
                  setSelectedCourseId((value as string) || null);
                  setSelectedTurmaId(null);
                  setSelectedOrigemId(null);
                  setCurrentPage(1);
                }
                if (key === "turmaId") {
                  setSelectedTurmaId((value as string) || null);
                  setSelectedOrigemId(null);
                  setCurrentPage(1);
                }
                if (key === "origemTipo") {
                  setSelectedOrigemTipo((value as FrequenciaOrigemTipo) || null);
                  setSelectedOrigemId(null);
                  setCurrentPage(1);
                }
                if (key === "origemId") {
                  setSelectedOrigemId((value as string) || null);
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
                setSelectedOrigemTipo(null);
                setSelectedOrigemId(null);
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
                <div
                  className={cn(
                    "flex w-full flex-col gap-2 sm:flex-row sm:items-end",
                    isAulaView ? "sm:justify-stretch" : "sm:justify-end"
                  )}
                >
                  <ButtonCustom
                    variant="primary"
                    size="lg"
                    onClick={() => handleSearchSubmit()}
                    disabled={
                      !isSearchInputValid || (!isAulaView && !isFiltersReady)
                    }
                    className={isAulaView ? "w-full" : "md:w-full xl:w-auto"}
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
          {isAulaView &&
            selectedOrigemTipo === "AULA" &&
            !canEdit &&
            selectedOrigemId && (
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
              <Table className="min-w-[1220px]">
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
                      Curso/Turma
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Tipo
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Evidência
                    </TableHead>
                    <TableHead className="font-medium text-gray-700 py-4 px-3">
                      Status
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
                        cursoNome={cursoLabelById.get(item.cursoId) ?? null}
                        turmaNome={turmaLabelById.get(item.turmaId) ?? null}
                        canEdit={canEdit}
                        canOverride={canOverride}
                        aula={selectedAula}
                        aulaNome={selectedAula?.titulo ?? item.origemTitulo ?? null}
                        blockedMessage={blockedMessage}
                        isSaving={
                          updateFrequencia.isPending &&
                          updateFrequencia.variables?.inscricaoId ===
                            item.inscricaoId &&
                          updateFrequencia.variables?.origemId ===
                            (item.origemId ?? item.aulaId ?? "")
                        }
                        onSave={({ status, motivo }) =>
                          updateFrequencia
                            .mutateAsync({
                              cursoId: item.cursoId,
                              turmaId: item.turmaId,
                              tipoOrigem: item.tipoOrigem,
                              origemId: item.origemId ?? item.aulaId ?? "",
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

            {totalItems > 0 && (
              <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {(() => {
                      const startIndex = paginationToUse
                        ? (paginationToUse.page - 1) * paginationToUse.pageSize + 1
                        : (currentPage - 1) * pageSize + 1;
                      const endIndex = paginationToUse
                        ? Math.min(
                            paginationToUse.page * paginationToUse.pageSize,
                            totalItems
                          )
                        : Math.min(currentPage * pageSize, totalItems);
                      return `Mostrando ${startIndex} a ${endIndex} de ${totalItems} registro${
                        totalItems === 1 ? "" : "s"
                      }`;
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
