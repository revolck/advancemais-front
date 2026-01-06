"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import {
  getMockAlunoCandidatoData,
  getMockAlunoEstagios,
} from "@/mockData/aluno-candidato";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  Calendar,
  BookOpen,
  MapPin,
  Clock,
  Phone,
  Eye,
} from "lucide-react";
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
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@/components/ui/custom/modal";
import type { MockEstagioItemData } from "@/mockData/aluno-candidato";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function getStatusConfig(status: MockEstagioItemData["status"]) {
  switch (status) {
    case "PENDENTE":
      return {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    case "EM_ANDAMENTO":
      return {
        label: "Em Andamento",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "CONCLUIDO":
      return {
        label: "Concluído",
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "CANCELADO":
      return {
        label: "Cancelado",
        className: "bg-red-100 text-red-800 border-red-200",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
}

export function AlunoEstagiosView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Buscar perfil do usuário
  const { data: profileResponse } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = getCookieValue("token");
      if (!token) throw new Error("Token não encontrado");
      return getUserProfile(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  const userId = useMemo(() => {
    return profileResponse && "usuario" in profileResponse
      ? profileResponse.usuario.id
      : null;
  }, [profileResponse]);

  // Buscar detalhes do aluno com suas inscrições (usando dados mockados)
  const { data: alunoData, isLoading: isLoadingAluno } = useQuery({
    queryKey: ["aluno-detalhes", userId],
    queryFn: async () => {
      const mockData = getMockAlunoCandidatoData();
      const turmasMap = new Map<
        string,
        { cursoId: string; turmaId: string; turmaNome: string }
      >();
      mockData.cursos.forEach((curso) => {
        const key = `${curso.id}::turma-001`;
        if (!turmasMap.has(key)) {
          turmasMap.set(key, {
            cursoId: curso.id,
            turmaId: "turma-001",
            turmaNome: "Turma A - Manhã",
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
    },
    enabled: true,
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

  // Buscar estágios (mockados por enquanto)
  const { data: todosEstagios, isLoading: isLoadingEstagios } = useQuery({
    queryKey: ["aluno-estagios", selectedCourseId],
    queryFn: async () => {
      return getMockAlunoEstagios(selectedCourseId || undefined);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingEstagios || isLoadingAluno;

  // Filtrar estágios
  const estagiosFiltrados = useMemo(() => {
    const estagios = todosEstagios ?? [];
    let filtered = [...estagios];

    if (selectedDateRange.from || selectedDateRange.to) {
      filtered = filtered.filter((estagio) => {
        const dataInicio = new Date(estagio.dataInicioPrevista);
        const dataInicioFiltro = selectedDateRange.from
          ? new Date(selectedDateRange.from)
          : null;
        const dataFimFiltro = selectedDateRange.to
          ? new Date(selectedDateRange.to)
          : null;

        if (dataInicioFiltro && dataFimFiltro) {
          const inicio = new Date(dataInicioFiltro);
          inicio.setHours(0, 0, 0, 0);
          const fim = new Date(dataFimFiltro);
          fim.setHours(23, 59, 59, 999);
          const dataInicioDate = new Date(dataInicio);
          dataInicioDate.setHours(0, 0, 0, 0);
          return dataInicioDate >= inicio && dataInicioDate <= fim;
        }
        if (dataInicioFiltro) {
          const inicio = new Date(dataInicioFiltro);
          inicio.setHours(0, 0, 0, 0);
          const dataInicioDate = new Date(dataInicio);
          dataInicioDate.setHours(0, 0, 0, 0);
          return dataInicioDate >= inicio;
        }
        if (dataFimFiltro) {
          const fim = new Date(dataFimFiltro);
          fim.setHours(23, 59, 59, 999);
          return dataInicio <= fim;
        }
        return true;
      });
    }

    return filtered;
  }, [todosEstagios, selectedDateRange.from, selectedDateRange.to]);

  // Paginação
  const totalPages = Math.max(
    1,
    Math.ceil(estagiosFiltrados.length / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const estagiosPaginados = estagiosFiltrados.slice(startIndex, endIndex);

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedDateRange.from, selectedDateRange.to]);

  const showEmptyState = !isLoading && estagiosFiltrados.length === 0;
  const shouldShowFilters = true;

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
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, isLoadingAluno]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedDateRange]
  );

  const [selectedEstagio, setSelectedEstagio] =
    useState<MockEstagioItemData | null>(null);

  const formatEndereco = (estagio: MockEstagioItemData): string => {
    const parts = [
      estagio.rua,
      estagio.numero,
      estagio.bairro,
      estagio.cidade,
      estagio.estado,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Filtros */}
      {shouldShowFilters && (
        <div>
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "cursoId") {
                setSelectedCourseId((value as string) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedDateRange(createEmptyDateRange());
            }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="rounded-xl bg-white p-8 border border-gray-200/60">
          <EmptyState
            illustration="fileNotFound"
            title="Nenhum estágio encontrado"
            description={
              selectedCourseId || selectedDateRange.from || selectedDateRange.to
                ? "Nenhum estágio encontrado com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui estágios cadastrados"
            }
          />
        </div>
      )}

      {/* Tabela de Estágios */}
      {!isLoading && estagiosFiltrados.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Empresa
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Endereço
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Período
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Horário
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estagiosPaginados.map((estagio) => {
                  const statusConfig = getStatusConfig(estagio.status);
                  return (
                    <TableRow
                      key={estagio.id}
                      className="border-gray-100 bg-white hover:bg-blue-50/40"
                    >
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {estagio.empresaNome}
                            </div>
                            {estagio.empresaTelefone && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" />
                                {estagio.empresaTelefone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {estagio.cursoNome} / {estagio.turmaNome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex items-center gap-2 max-w-[300px]">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="line-clamp-2">
                                {formatEndereco(estagio)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              sideOffset={8}
                              className="max-w-[400px]"
                            >
                              <div className="space-y-1">
                                <div className="font-medium">
                                  Endereço completo:
                                </div>
                                <div>{formatEndereco(estagio)}</div>
                                <div className="text-xs text-gray-400">
                                  CEP: {estagio.cep}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <div>
                            <div>
                              {format(
                                new Date(estagio.dataInicioPrevista),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}{" "}
                              -{" "}
                              {format(
                                new Date(estagio.dataFimPrevista),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span>
                            {estagio.horarioInicio} - {estagio.horarioFim}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium border",
                            statusConfig.className
                          )}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ButtonCustom
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEstagio(estagio)}
                              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                              withAnimation={false}
                            >
                              <Eye className="h-4 w-4" />
                            </ButtonCustom>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Ver detalhes
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200/60 px-4 md:px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, estagiosFiltrados.length)} de{" "}
                  {estagiosFiltrados.length}
                </p>
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="text-sm"
                    withAnimation={false}
                  >
                    Anterior
                  </ButtonCustom>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <ButtonCustom
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "text-sm min-w-[40px]",
                          currentPage === page &&
                            "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
                        )}
                        withAnimation={false}
                      >
                        {page}
                      </ButtonCustom>
                    )
                  )}
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="text-sm"
                    withAnimation={false}
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes do Estágio */}
      {selectedEstagio && (
        <ModalCustom
          isOpen={!!selectedEstagio}
          onOpenChange={(open) => {
            if (!open) setSelectedEstagio(null);
          }}
          size="2xl"
          backdrop="blur"
          scrollBehavior="inside"
        >
          <ModalContentWrapper>
            <ModalHeader>
              <ModalTitle>Detalhes do Estágio</ModalTitle>
            </ModalHeader>
            <ModalBody className="p-6">
              <div className="space-y-4">
                {/* Grid de informações principais */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Empresa */}
                  <div className="rounded-lg border border-gray-200/70 bg-gray-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Empresa
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedEstagio.empresaNome}
                        </p>
                      </div>
                      {selectedEstagio.empresaTelefone && (
                        <div className="flex items-center gap-2 ml-6">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {selectedEstagio.empresaTelefone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="rounded-lg border border-gray-200/70 bg-gray-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Status
                    </p>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium border",
                          getStatusConfig(selectedEstagio.status).className
                        )}
                      >
                        {getStatusConfig(selectedEstagio.status).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Curso/Turma */}
                  <div className="rounded-lg border border-gray-200/70 bg-gray-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Curso/Turma
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedEstagio.cursoNome} /{" "}
                        {selectedEstagio.turmaNome}
                      </p>
                    </div>
                  </div>

                  {/* Horário */}
                  <div className="rounded-lg border border-gray-200/70 bg-gray-50/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Horário
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedEstagio.horarioInicio} às{" "}
                        {selectedEstagio.horarioFim}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Período */}
                <div className="rounded-lg border border-gray-200/70 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Período
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {format(
                        new Date(selectedEstagio.dataInicioPrevista),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}{" "}
                      até{" "}
                      {format(
                        new Date(selectedEstagio.dataFimPrevista),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>

                {/* Endereço */}
                <div className="rounded-lg border border-gray-200/70 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Endereço
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {formatEndereco(selectedEstagio)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          CEP: {selectedEstagio.cep}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedEstagio.observacoes && (
                  <div className="rounded-lg border border-gray-200/70 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedEstagio.observacoes}
                    </p>
                  </div>
                )}

                {/* Botão de fechar */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200/60">
                  <ButtonCustom
                    variant="outline"
                    onClick={() => setSelectedEstagio(null)}
                    withAnimation={false}
                  >
                    Fechar
                  </ButtonCustom>
                </div>
              </div>
            </ModalBody>
          </ModalContentWrapper>
        </ModalCustom>
      )}
    </div>
  );
}
