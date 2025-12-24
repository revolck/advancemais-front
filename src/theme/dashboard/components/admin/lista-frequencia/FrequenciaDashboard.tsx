"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ButtonCustom, EmptyState, FilterBar } from "@/components/ui/custom";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../shared/filterUtils";
import { useCursosForSelect } from "./hooks/useCursosForSelect";
import { useTurmasForSelect } from "./hooks/useTurmasForSelect";
import { useAulasForSelect } from "./hooks/useAulasForSelect";
import { useFrequenciaDashboardQuery } from "./hooks/useFrequenciaDashboardQuery";
import { useUpdateFrequenciaMutation } from "./hooks/useUpdateFrequenciaMutation";
import { FrequenciaRow } from "./components/FrequenciaRow";
import { FrequenciaTableSkeleton } from "./components/FrequenciaTableSkeleton";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

const SEARCH_HELPER_TEXT = "Pesquise pelo nome ou código do aluno.";

export function FrequenciaDashboard({ className }: { className?: string }) {
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const role = useUserRole();

  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { turmas, isLoading: loadingTurmas } = useTurmasForSelect(selectedCourseId);
  const aulasQuery = useAulasForSelect({ turmaId: selectedTurmaId });

  const selectedAula = useMemo(
    () => (selectedAulaId ? aulasQuery.itemById.get(selectedAulaId) ?? null : null),
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
    aula: selectedAula,
    search: normalizedSearch,
    page: currentPage,
    pageSize,
  });

  const updateFrequencia = useUpdateFrequenciaMutation();

  const items = useMemo(() => frequenciaQuery.data?.items ?? [], [frequenciaQuery.data]);
  const canEditByTime = frequenciaQuery.data?.canEdit ?? false;
  const allowedRoles = useMemo(
    () => [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO, UserRole.INSTRUTOR],
    []
  );
  const hasPermission = role ? allowedRoles.includes(role) : true;
  const canEdit = hasPermission && canEditByTime;
  const blockedMessage = !hasPermission
    ? "Seu perfil não tem permissão para lançar frequência."
    : "A frequência só pode ser lançada após a aula acontecer.";
  const pagination = frequenciaQuery.data?.pagination;
  const totalItems = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const isFiltersReady = Boolean(selectedCourseId && selectedTurmaId && selectedAulaId);
  const shouldShowSkeleton =
    isFiltersReady && (frequenciaQuery.isFetching || frequenciaQuery.isLoading);

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
      },
    ],
    [
      aulasQuery.isLoading,
      aulasQuery.options,
      cursos,
      loadingCursos,
      loadingTurmas,
      selectedCourseId,
      selectedTurmaId,
      turmas,
    ]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaId: selectedTurmaId,
      aulaId: selectedAulaId,
    }),
    [selectedAulaId, selectedCourseId, selectedTurmaId]
  );

  const showEmptyState =
    !shouldShowSkeleton && (!isFiltersReady || items.length === 0);

  const emptyStateTitle = useMemo(() => {
    if (!isFiltersReady) return "Selecione curso, turma e aula";
    if (frequenciaQuery.error) return "Não foi possível carregar a frequência";
    return "Nenhum aluno encontrado";
  }, [frequenciaQuery.error, isFiltersReady]);

  const emptyStateDescription = useMemo(() => {
    if (!isFiltersReady) return "Escolha um curso, uma turma e uma aula para lançar a frequência.";
    if (frequenciaQuery.error) return "Tente novamente em instantes.";
    return "Nenhum aluno encontrado para os filtros aplicados.";
  }, [frequenciaQuery.error, isFiltersReady]);

  return (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="border-b border-gray-200 top-0 z-10">
        <div className="py-4">
          <FilterBar
            fields={filterFields}
            values={filterValues}
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
            }}
            onClearAll={() => {
              setPendingSearchTerm("");
              setAppliedSearchTerm("");
              setSelectedCourseId(null);
              setSelectedTurmaId(null);
              setSelectedAulaId(null);
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
              <ButtonCustom
                variant="primary"
                size="lg"
                onClick={() => handleSearchSubmit()}
                disabled={!isSearchInputValid || !isFiltersReady}
                className="md:w-full xl:w-auto"
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {!showEmptyState && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!canEdit && selectedAulaId && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {blockedMessage}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50/50">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Aluno
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Sugestão
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Evidência
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Lançamento
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shouldShowSkeleton ? (
                  <FrequenciaTableSkeleton rows={8} />
                ) : (
                  items.map((item) => (
                    <FrequenciaRow
                      key={item.key}
                      item={item}
                      canEdit={canEdit}
                      blockedMessage={blockedMessage}
                      isSaving={
                        updateFrequencia.isPending &&
                        updateFrequencia.variables?.alunoId === item.alunoId &&
                        updateFrequencia.variables?.aulaId === item.aulaId
                      }
                      onSave={(status, motivo) =>
                        updateFrequencia
                          .mutateAsync({
                            cursoId: item.cursoId,
                            turmaId: item.turmaId,
                            aulaId: item.aulaId,
                            alunoId: item.alunoId,
                            status,
                            motivo,
                          })
                          .then(() => undefined)
                      }
                    />
                  ))
                )}
              </TableBody>
            </Table>

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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
