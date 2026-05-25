"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { listMeusEstagios } from "@/api/cursos";
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
import {
  mapMeuEstagioToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
  type AlunoEstagioListItem,
} from "./alunoEstagio.mapper";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

function getStatusConfig(status: AlunoEstagioListItem["status"]) {
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
    case "REPROVADO":
      return {
        label: "Reprovado",
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
  const dataInicio = toApiDate(selectedDateRange.from);
  const dataFim = toApiDate(selectedDateRange.to);

  const {
    data: estagiosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "aluno-estagios-reais",
      selectedCourseId,
      dataInicio,
      dataFim,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      try {
        const response = await listMeusEstagios({
          cursoId: selectedCourseId,
          dataInicio,
          dataFim,
          page: currentPage,
          pageSize,
        });
        return {
          items: response.data.items.map(mapMeuEstagioToListItem),
          pagination: response.data.pagination,
          filters: response.data.filters,
        };
      } catch (error) {
        if (shouldShowAlunoDataAsEmptyState(error)) {
          return {
            items: [],
            pagination: { page: 1, pageSize, total: 0, totalPages: 1 },
            filters: { cursos: [] },
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const cursosUnicos = useMemo(
    () =>
      (estagiosData?.filters.cursos ?? []).map((curso) => ({
        value: curso.id,
        label: curso.nome,
      })),
    [estagiosData?.filters.cursos]
  );
  const estagios = estagiosData?.items ?? [];
  const pagination = estagiosData?.pagination;
  const effectivePage = pagination?.page ?? currentPage;
  const totalItems = pagination?.total ?? estagios.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startIndex = totalItems === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const endIndex = Math.min(effectivePage * pageSize, totalItems);

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourseId, selectedDateRange.from, selectedDateRange.to]);

  const showEmptyState = !isLoading && !isError && estagios.length === 0;
  const shouldShowFilters = true;

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursosUnicos,
        placeholder: isLoading ? "Carregando..." : "Selecionar",
        disabled: isLoading && cursosUnicos.length === 0,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, isLoading]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedDateRange]
  );

  const [selectedEstagio, setSelectedEstagio] =
    useState<AlunoEstagioListItem | null>(null);

  const formatEndereco = (estagio: AlunoEstagioListItem): string => {
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

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {(error as Error)?.message ||
                "Não foi possível carregar seus estágios."}
            </span>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="w-full border-red-200 bg-white text-red-700 hover:bg-red-100 sm:w-auto"
              withAnimation={false}
            >
              Tentar novamente
            </ButtonCustom>
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
      {!isLoading && !isError && estagios.length > 0 && (
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
                {estagios.map((estagio) => {
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
                  Mostrando {startIndex} a {endIndex} de {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={effectivePage === 1}
                    className="text-sm"
                    withAnimation={false}
                  >
                    Anterior
                  </ButtonCustom>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <ButtonCustom
                        key={page}
                        variant={effectivePage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "text-sm min-w-[40px]",
                          effectivePage === page &&
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
                    disabled={effectivePage === totalPages}
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
