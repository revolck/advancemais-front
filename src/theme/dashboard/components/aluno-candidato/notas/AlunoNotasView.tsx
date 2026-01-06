"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import { getCursoAlunoDetalhes } from "@/api/cursos";
import { listNotas, type NotaLancamento } from "@/api/cursos";
import {
  getMockAlunoNotas,
  getMockAlunoCandidatoData,
} from "@/mockData/aluno-candidato";
import { NotaHistoryModal } from "@/theme/dashboard/components/admin/lista-notas/components/NotaHistoryModal";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, Calendar, Award, TrendingUp, History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DateRange } from "@/components/ui/custom/date-picker";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface NotaListItem {
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId?: string;
  alunoId: string;
  nota: number | null;
  atualizadoEm: string;
  motivo?: string | null;
  origem?: {
    tipo: "PROVA" | "ATIVIDADE" | "AULA" | "OUTRO";
    id?: string | null;
    titulo?: string | null;
  } | null;
  isManual: boolean;
  history: any[];
}

function getSituacao(nota: number | null) {
  if (nota === null) {
    return {
      label: "Sem nota",
      className: "bg-gray-100 text-gray-800 border-gray-200",
      color: "text-gray-600",
    };
  }
  if (nota >= 7) {
    return {
      label: "Aprovado",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      color: "text-emerald-600",
    };
  }
  if (nota >= 5) {
    return {
      label: "Recuperação",
      className: "bg-red-100 text-red-800 border-red-200",
      color: "text-red-600",
    };
  }
  return {
    label: "Reprovado",
    className: "bg-red-100 text-red-800 border-red-200",
    color: "text-red-600",
  };
}

function formatNota(nota: number | null): string {
  if (nota === null) return "—";
  if (!Number.isFinite(nota)) return "—";
  return nota.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(nota) ? 0 : 1,
    maximumFractionDigits: 2,
  });
}

function getOrigemLabel(tipo: string) {
  if (tipo === "AULA") return "Aula";
  if (tipo === "PROVA") return "Prova";
  if (tipo === "ATIVIDADE") return "Atividade";
  return tipo;
}

type SituacaoFilter = "APROVADO" | "RECUPERACAO" | "REPROVADO" | null;

export function AlunoNotasView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSituacao, setSelectedSituacao] =
    useState<SituacaoFilter>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [selectedNotaHistory, setSelectedNotaHistory] =
    useState<NotaListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const token = useMemo(() => getCookieValue("token"), []);

  // Buscar perfil do usuário logado
  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!token) throw new Error("Token não encontrado");
      return getUserProfile(token);
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });

  const userId = useMemo(() => {
    return profileResponse && "usuario" in profileResponse
      ? profileResponse.usuario.id
      : null;
  }, [profileResponse]);

  // Buscar detalhes do aluno com suas inscrições (usando dados mockados por enquanto)
  const { data: alunoData, isLoading: isLoadingAluno } = useQuery({
    queryKey: ["aluno-detalhes", userId],
    queryFn: async () => {
      // Usar dados mockados por enquanto (até a API estar disponível)
      const mockData = getMockAlunoCandidatoData();

      // Criar inscrições mockadas baseadas nos cursos e notas
      // Usar as turmas que existem nas notas mockadas
      const turmasMap = new Map<
        string,
        { cursoId: string; turmaId: string; turmaNome: string }
      >();
      mockData.notas.forEach((nota) => {
        const key = `${nota.cursoId}::${nota.turmaId}`;
        if (!turmasMap.has(key)) {
          turmasMap.set(key, {
            cursoId: nota.cursoId,
            turmaId: nota.turmaId,
            turmaNome: nota.turmaNome,
          });
        }
      });

      const inscricoes = Array.from(turmasMap.values()).map((turma) => {
        const curso = mockData.cursos.find((c) => c.id === turma.cursoId);
        return {
          cursoId: turma.cursoId,
          cursoNome: curso?.nome || turma.cursoId,
          turmaId: turma.turmaId,
          turmaNome: turma.turmaNome,
          alunoId: userId || "aluno-001",
          statusInscricao: curso?.status || "EM_PROGRESSO",
        };
      });

      return {
        success: true,
        data: {
          id: userId || "aluno-001",
          nome: "Aluno Teste",
          email: "aluno@teste.com",
          inscricoes,
        },
      };

      // Código para quando a API estiver disponível:
      // if (!userId) throw new Error("ID do usuário não encontrado");
      // return getCursoAlunoDetalhes(userId);
    },
    enabled: true, // Sempre habilitado para usar dados mockados
    staleTime: 5 * 60 * 1000,
  });

  // Extrair cursos únicos das inscrições
  const cursosUnicos = useMemo(() => {
    if (!alunoData?.data?.inscricoes) return [];
    const cursosMap = new Map<string, { value: string; label: string }>();
    alunoData.data.inscricoes.forEach((inscricao: any) => {
      if (inscricao.cursoId && inscricao.cursoNome) {
        cursosMap.set(inscricao.cursoId, {
          value: inscricao.cursoId,
          label: inscricao.cursoNome,
        });
      }
    });
    return Array.from(cursosMap.values());
  }, [alunoData]);

  // Buscar notas (usando dados mockados por enquanto)
  const { data: notasData, isLoading: isLoadingNotas } = useQuery({
    queryKey: ["aluno-notas", selectedCourseId, userId],
    queryFn: async () => {
      // Usar dados mockados por enquanto (até a API estar disponível)
      try {
        const mockData = getMockAlunoCandidatoData();

        // Se houver curso selecionado, filtrar por ele; caso contrário, trazer todas as notas
        let mockNotas = selectedCourseId
          ? mockData.notas.filter((nota) => nota.cursoId === selectedCourseId)
          : mockData.notas;

        // Agrupar por cursoId e manter apenas a nota mais recente (nota final) de cada curso
        const notasPorCurso = new Map<string, (typeof mockNotas)[0]>();

        mockNotas.forEach((nota) => {
          const cursoKey = nota.cursoId;
          const notaExistente = notasPorCurso.get(cursoKey);

          if (!notaExistente) {
            notasPorCurso.set(cursoKey, nota);
          } else {
            // Comparar datas e manter a mais recente
            const dataExistente = new Date(notaExistente.atualizadoEm);
            const dataAtual = new Date(nota.atualizadoEm);

            if (dataAtual > dataExistente) {
              notasPorCurso.set(cursoKey, nota);
            }
          }
        });

        // Converter map para array
        const notasFinais = Array.from(notasPorCurso.values());

        // Mapear para o formato esperado
        const items: NotaListItem[] = notasFinais.map((nota) => ({
          key: `${nota.cursoId}::final`,
          cursoId: nota.cursoId,
          cursoNome: nota.cursoNome,
          turmaId: nota.turmaId,
          turmaNome: nota.turmaNome,
          inscricaoId: nota.inscricaoId,
          alunoId: nota.alunoId,
          nota: nota.nota,
          atualizadoEm: nota.atualizadoEm,
          motivo: nota.motivo,
          origem: nota.origem,
          isManual: nota.isManual,
          history: nota.history,
        }));

        return { items };
      } catch (error) {
        console.error("Erro ao buscar notas mockadas:", error);
        return { items: [] };
      }

      // Código para quando a API estiver disponível:
      // const response = await listNotas(selectedCourseId, {
      //   turmaIds: selectedTurmaIds.join(","),
      // });
      // const minhasNotas = (response.data?.items ?? []).filter(
      //   (nota: NotaLancamento) => nota.alunoId === userId
      // );
      // const items: NotaListItem[] = minhasNotas.map((nota: NotaLancamento) => {
      //   const inscricao = alunoData?.data?.inscricoes?.find(
      //     (i: any) =>
      //       i.cursoId === nota.cursoId &&
      //       i.turmaId === nota.turmaId &&
      //       i.alunoId === nota.alunoId
      //   );
      //   return {
      //     key: `${nota.cursoId}::${nota.turmaId}::${nota.alunoId}`,
      //     cursoId: nota.cursoId,
      //     cursoNome: inscricao?.cursoNome || "—",
      //     turmaId: nota.turmaId,
      //     turmaNome: inscricao?.turmaNome || "—",
      //     inscricaoId: nota.inscricaoId,
      //     alunoId: nota.alunoId,
      //     nota: nota.nota,
      //     atualizadoEm: nota.atualizadoEm,
      //     motivo: nota.motivo,
      //     origem: nota.origem,
      //     isManual: nota.isManual,
      //     history: nota.history ?? [],
      //   };
      // });
      // return { items };
    },
    enabled: true, // Sempre habilitado para buscar todas as notas ou filtradas
    staleTime: 60 * 1000,
  });

  const isLoading = isLoadingAluno || isLoadingNotas;

  // Aplicar filtros
  const notasFiltradas = useMemo(() => {
    const todasNotas = notasData?.items ?? [];
    let filtered = todasNotas;

    // Filtro por situação
    if (selectedSituacao) {
      filtered = filtered.filter((nota) => {
        const situacao = getSituacao(nota.nota);
        if (selectedSituacao === "APROVADO") {
          return situacao.label === "Aprovado";
        }
        if (selectedSituacao === "RECUPERACAO") {
          return situacao.label === "Recuperação";
        }
        if (selectedSituacao === "REPROVADO") {
          return situacao.label === "Reprovado";
        }
        return true;
      });
    }

    // Filtro por período
    if (selectedDateRange.from || selectedDateRange.to) {
      filtered = filtered.filter((nota) => {
        const dataNota = new Date(nota.atualizadoEm);
        const dataInicio = selectedDateRange.from
          ? new Date(selectedDateRange.from)
          : null;
        const dataFim = selectedDateRange.to
          ? new Date(selectedDateRange.to)
          : null;

        if (dataInicio && dataFim) {
          // Ajustar para comparar apenas a data (sem hora)
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          const notaDate = new Date(dataNota);
          notaDate.setHours(0, 0, 0, 0);

          return notaDate >= inicio && notaDate <= fim;
        }
        if (dataInicio) {
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          const notaDate = new Date(dataNota);
          notaDate.setHours(0, 0, 0, 0);
          return notaDate >= inicio;
        }
        if (dataFim) {
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          return dataNota <= fim;
        }
        return true;
      });
    }

    return filtered;
  }, [notasData?.items, selectedSituacao, selectedDateRange]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(notasFiltradas.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const notas = notasFiltradas.slice(startIndex, endIndex);

  const showEmptyState = !isLoading && notasFiltradas.length === 0;
  const shouldShowFilters = cursosUnicos.length > 0; // Sempre mostrar filtro se houver cursos

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedSituacao, selectedDateRange]);

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages]
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
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
  }, [currentPage, totalPages]);

  const situacaoOptions = useMemo(
    () => [
      { value: "APROVADO", label: "Aprovado" },
      { value: "RECUPERACAO", label: "Recuperação" },
      { value: "REPROVADO", label: "Reprovado" },
    ],
    []
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursosUnicos,
        placeholder: isLoadingAluno ? "Carregando..." : "Selecionar",
        disabled: isLoadingAluno,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "situacao",
        label: "Situação",
        mode: "single" as const,
        options: situacaoOptions,
        placeholder: "Selecionar situação",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, isLoadingAluno, situacaoOptions]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      situacao: selectedSituacao,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedSituacao, selectedDateRange]
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Filtros */}
      {shouldShowFilters && (
        <div>
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
              }
              if (key === "situacao") {
                setSelectedSituacao((value as SituacaoFilter) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedSituacao(null);
              setSelectedDateRange(createEmptyDateRange());
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl bg-white p-4 md:p-6 border border-gray-200/60">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="rounded-xl bg-white p-8 border border-gray-200/60">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma nota encontrada"
            description={
              selectedCourseId ||
              selectedSituacao ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhuma nota encontrada com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui notas registradas"
            }
          />
        </div>
      )}

      {/* Lista de Notas */}
      {!isLoading && notas.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="divide-y divide-gray-200/60">
            {notas.map((nota) => {
              const situacao = getSituacao(nota.nota);
              const hasHistory = (nota.history?.length ?? 0) > 0;

              return (
                <div
                  key={nota.key}
                  className="p-5 md:p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                    {/* Nota - Destaque */}
                    <div className="flex items-center gap-4 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl cursor-help",
                              situacao.className
                                .replace("text-", "bg-")
                                .replace("-800", "-100"),
                              situacao.color
                            )}
                          >
                            {formatNota(nota.nota)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>
                          Nota: {formatNota(nota.nota)} / 10
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Informações Principais */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Curso e Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="mb-0!">{nota.cursoNome}</h5>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium shrink-0",
                                situacao.className
                              )}
                            >
                              {situacao.label}
                            </Badge>
                          </div>

                          {/* Informações da Turma */}
                          <div className="mt-1 mb-0 flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                {nota.turmaNome}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data de Atualização */}
                      <div className="mt-[-5px] flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>
                          Atualizado em{" "}
                          <span className="font-medium text-gray-600">
                            {format(
                              new Date(nota.atualizadoEm),
                              "dd 'de' MMMM 'de' yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="shrink-0 lg:ml-auto">
                      {hasHistory && (
                        <ButtonCustom
                          variant="outline"
                          size="sm"
                          icon="History"
                          onClick={() => setSelectedNotaHistory(nota)}
                          className="w-full lg:w-auto"
                        >
                          Histórico
                        </ButtonCustom>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginação */}
          {notasFiltradas.length > 0 && (
            <div className="flex flex-col gap-4 px-4 md:px-6 py-4 border-t border-gray-200/60 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando {Math.min(startIndex + 1, notasFiltradas.length)} a{" "}
                  {Math.min(endIndex, notasFiltradas.length)} de{" "}
                  {notasFiltradas.length}
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

      {/* Modal de Histórico */}
      {selectedNotaHistory && (
        <NotaHistoryModal
          isOpen={true}
          onClose={() => setSelectedNotaHistory(null)}
          alunoNome={selectedNotaHistory.cursoNome}
          turmaNome={selectedNotaHistory.turmaNome}
          history={selectedNotaHistory.history ?? []}
        />
      )}
    </div>
  );
}
