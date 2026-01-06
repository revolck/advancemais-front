"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import { getCursoAlunoDetalhes } from "@/api/cursos";
import {
  getMockAlunoFrequencias,
  getMockAlunoCandidatoData,
} from "@/mockData/aluno-candidato";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Video, BookOpen, PlayCircle } from "lucide-react";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface FrequenciaListItem {
  id: string;
  key: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  aulaId: string;
  aulaNome: string;
  inscricaoId: string;
  alunoId: string;
  statusAtual: "PRESENTE" | "AUSENTE" | "JUSTIFICADO" | "ATRASADO";
  justificativa?: string | null;
  observacoes?: string | null;
  dataReferencia: string;
  evidence?: {
    ultimoLogin?: string | null;
    tempoAoVivoMin?: number | null;
  } | null;
}

function getStatusConfig(status: FrequenciaListItem["statusAtual"]) {
  switch (status) {
    case "PRESENTE":
      return {
        label: "Presente",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "AUSENTE":
      return {
        label: "Ausente",
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case "JUSTIFICADO":
      return {
        label: "Justificado",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    case "ATRASADO":
      return {
        label: "Atrasado",
        className: "bg-orange-100 text-orange-800 border-orange-200",
      };
    default:
      return {
        label: "Pendente",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
}

type FrequenciaStatusFilter =
  | "PRESENTE"
  | "AUSENTE"
  | "JUSTIFICADO"
  | "ATRASADO"
  | null;

export function AlunoFrequenciaView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<FrequenciaStatusFilter>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Buscar perfil do usuário
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      const token = getCookieValue("token");
      if (!token) throw new Error("Token não encontrado");
      return await getUserProfile(token);
    },
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

      // Criar inscrições mockadas baseadas nos cursos e frequências
      const turmasMap = new Map<
        string,
        { cursoId: string; turmaId: string; turmaNome: string }
      >();
      mockData.frequencias?.forEach((freq) => {
        if (!turmasMap.has(freq.turmaId)) {
          turmasMap.set(freq.turmaId, {
            cursoId: freq.cursoId,
            turmaId: freq.turmaId,
            turmaNome: freq.turmaNome,
          });
        }
      });

      const inscricoes = Array.from(turmasMap.values()).map((turma) => {
        const curso = mockData.cursos.find((c) => c.id === turma.cursoId);
        return {
          inscricaoId: `inscricao-${turma.turmaId}`,
          turmaId: turma.turmaId,
          turmaNome: turma.turmaNome,
          cursoId: turma.cursoId,
          cursoNome: curso?.nome || turma.cursoId,
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
    },
    enabled: true, // Sempre habilitado para usar dados mockados
    staleTime: 5 * 60 * 1000,
  });

  // Extrair cursos únicos para o filtro
  const cursosUnicos = useMemo(() => {
    const cursosMap = new Map<string, { value: string; label: string }>();
    alunoData?.data?.inscricoes?.forEach((inscricao: any) => {
      if (inscricao.cursoId && inscricao.cursoNome) {
        cursosMap.set(inscricao.cursoId, {
          value: inscricao.cursoId,
          label: inscricao.cursoNome,
        });
      }
    });
    return Array.from(cursosMap.values());
  }, [alunoData]);

  // Extrair aulas únicas para o filtro (baseado no curso selecionado)
  const aulasUnicas = useMemo(() => {
    const mockData = getMockAlunoCandidatoData();
    const frequencias = mockData.frequencias ?? [];

    let filtered = frequencias;
    if (selectedCourseId) {
      filtered = filtered.filter((freq) => freq.cursoId === selectedCourseId);
    }

    const aulasMap = new Map<string, { value: string; label: string }>();
    filtered.forEach((freq) => {
      if (freq.aulaId && freq.aulaNome) {
        aulasMap.set(freq.aulaId, {
          value: freq.aulaId,
          label: freq.aulaNome,
        });
      }
    });

    return Array.from(aulasMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR")
    );
  }, [selectedCourseId]);

  // Buscar frequências (usando dados mockados por enquanto)
  const { data: frequenciasData, isLoading: isLoadingFrequencias } = useQuery({
    queryKey: ["aluno-frequencias", selectedCourseId, selectedAulaId, userId],
    queryFn: async () => {
      // Usar dados mockados por enquanto (até a API estar disponível)
      try {
        const mockData = getMockAlunoCandidatoData();
        const frequencias = getMockAlunoFrequencias(
          selectedCourseId || undefined,
          selectedAulaId || undefined
        );

        // Mapear para o formato esperado
        const items: FrequenciaListItem[] = frequencias.map((freq) => ({
          id: freq.id,
          key: freq.key,
          cursoId: freq.cursoId,
          cursoNome: freq.cursoNome,
          turmaId: freq.turmaId,
          turmaNome: freq.turmaNome,
          aulaId: freq.aulaId,
          aulaNome: freq.aulaNome,
          inscricaoId: freq.inscricaoId,
          alunoId: freq.alunoId,
          statusAtual: freq.statusAtual,
          justificativa: freq.justificativa,
          observacoes: freq.observacoes,
          dataReferencia: freq.dataReferencia,
          evidence: freq.evidence ?? undefined,
        }));

        return { items };
      } catch (error) {
        console.error("Erro ao buscar frequências mockadas:", error);
        return { items: [] };
      }
    },
    enabled: true,
    staleTime: 60 * 1000,
  });

  const isLoading = isLoadingAluno || isLoadingFrequencias;

  // Aplicar filtros
  const frequenciasFiltradas = useMemo(() => {
    const todasFrequencias = frequenciasData?.items ?? [];
    let filtered = todasFrequencias;

    // Filtro por status
    if (selectedStatus) {
      filtered = filtered.filter((freq) => freq.statusAtual === selectedStatus);
    }

    // Filtro por período
    if (selectedDateRange.from || selectedDateRange.to) {
      filtered = filtered.filter((freq) => {
        const dataFreq = new Date(freq.dataReferencia);
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
          const freqDate = new Date(dataFreq);
          freqDate.setHours(0, 0, 0, 0);

          return freqDate >= inicio && freqDate <= fim;
        }
        if (dataInicio) {
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          const freqDate = new Date(dataFreq);
          freqDate.setHours(0, 0, 0, 0);
          return freqDate >= inicio;
        }
        if (dataFim) {
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          return dataFreq <= fim;
        }
        return true;
      });
    }

    return filtered;
  }, [frequenciasData?.items, selectedStatus, selectedDateRange]);

  // Paginação
  const totalPages = Math.max(
    1,
    Math.ceil(frequenciasFiltradas.length / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const frequencias = frequenciasFiltradas.slice(startIndex, endIndex);

  const showEmptyState = !isLoading && frequenciasFiltradas.length === 0;
  const shouldShowFilters = true; // Sempre mostrar filtros, pois temos dados mockados

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCourseId,
    selectedAulaId,
    selectedStatus,
    selectedDateRange.from,
    selectedDateRange.to,
  ]);

  // Reset aula quando curso muda
  useEffect(() => {
    setSelectedAulaId(null);
  }, [selectedCourseId]);

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

  const statusOptions = useMemo(
    () => [
      { value: "PRESENTE", label: "Presente" },
      { value: "AUSENTE", label: "Ausente" },
      { value: "JUSTIFICADO", label: "Justificado" },
      { value: "ATRASADO", label: "Atrasado" },
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
        key: "aulaId",
        label: "Aula",
        mode: "single" as const,
        options: aulasUnicas,
        placeholder: "Selecionar aula",
        disabled: !selectedCourseId || aulasUnicas.length === 0,
        emptyPlaceholder: "Selecione um curso primeiro",
      },
      {
        key: "status",
        label: "Frequência",
        mode: "single" as const,
        options: statusOptions,
        placeholder: "Selecionar frequência",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, aulasUnicas, isLoadingAluno, selectedCourseId, statusOptions]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      aulaId: selectedAulaId,
      status: selectedStatus,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedAulaId, selectedStatus, selectedDateRange]
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Filtros */}
      {shouldShowFilters && (
        <div>
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
              }
              if (key === "aulaId") {
                setSelectedAulaId((value as string) || null);
              }
              if (key === "status") {
                setSelectedStatus((value as FrequenciaStatusFilter) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedAulaId(null);
              setSelectedStatus(null);
              setSelectedDateRange(createEmptyDateRange());
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Aula
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Data
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Evidência
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Motivo
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Frequência
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="border-gray-100 bg-white">
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-4 px-3">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200/60">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhuma frequência encontrada"
            description={
              selectedCourseId ||
              selectedAulaId ||
              selectedStatus ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhuma frequência encontrada com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui frequências registradas"
            }
          />
        </div>
      )}

      {/* Lista de Frequências */}
      {!isLoading && frequencias.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Aula
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 py-4 px-3">
                    Data
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
                {frequencias.map((freq) => {
                  const statusConfig = getStatusConfig(freq.statusAtual);

                  return (
                    <TableRow
                      key={freq.key}
                      className="border-gray-100 bg-white transition-colors hover:bg-blue-50/40"
                    >
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <PlayCircle className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>{freq.aulaNome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {freq.cursoNome} / {freq.turmaNome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {format(
                              new Date(freq.dataReferencia),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        {freq.evidence?.tempoAoVivoMin ? (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-default">
                                <Video className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {freq.evidence.tempoAoVivoMin} min
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8} className="max-w-sm">
                              <div className="space-y-1 text-xs leading-relaxed">
                                <div>
                                  Você assistiu a aula por{" "}
                                  <b>
                                    {Math.floor(
                                      freq.evidence.tempoAoVivoMin / 60
                                    ) > 0
                                      ? `${Math.floor(
                                          freq.evidence.tempoAoVivoMin / 60
                                        )}h `
                                      : ""}
                                    {freq.evidence.tempoAoVivoMin % 60}min
                                  </b>
                                </div>
                                {freq.evidence.ultimoLogin && (
                                  <div>
                                    Último acesso:{" "}
                                    <b>
                                      {format(
                                        new Date(freq.evidence.ultimoLogin),
                                        "dd/MM/yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </b>
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-3">
                        {freq.justificativa ? (
                          <Tooltip disableHoverableContent>
                            <TooltipTrigger asChild>
                              <div className="cursor-default min-w-0">
                                <div className="text-sm font-medium text-gray-900 break-words leading-snug line-clamp-2 max-w-[400px]">
                                  {freq.justificativa.length > 100
                                    ? `${freq.justificativa.substring(
                                        0,
                                        100
                                      )}...`
                                    : freq.justificativa}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={8} className="max-w-lg">
                              <div className="space-y-1">
                                <div className="text-xs font-semibold">
                                  Justificativa
                                </div>
                                <div className="text-xs whitespace-pre-wrap break-words">
                                  {freq.justificativa}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                              statusConfig.className
                            )}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {frequenciasFiltradas.length > 0 && (
            <div className="flex flex-col gap-4 px-4 md:px-6 py-4 border-t border-gray-200/60 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Mostrando{" "}
                  {Math.min(startIndex + 1, frequenciasFiltradas.length)} a{" "}
                  {Math.min(endIndex, frequenciasFiltradas.length)} de{" "}
                  {frequenciasFiltradas.length}
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
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        className="h-8 px-3"
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
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="h-8 px-3"
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
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="h-8 px-3"
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
    </div>
  );
}
