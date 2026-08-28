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
  Eye,
  ExternalLink,
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

  const getGoogleMapsUrl = (estagio: AlunoEstagioListItem): string => {
    const query = [formatEndereco(estagio), estagio.cep]
      .filter(Boolean)
      .join(" ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
                    Período/Horário
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
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                            <Briefcase className="h-4 w-4 text-blue-700" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm! font-semibold! text-gray-900!">
                              {estagio.empresaNome}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <div className="flex min-w-0 items-center gap-2">
                          <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Curso
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {estagio.cursoNome}
                              </span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Turma
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {estagio.turmaNome}
                              </span>
                            </div>
                          </div>
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
                        <div className="flex min-w-0 items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Período
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
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
                              </span>
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-[11px]! text-gray-500!">
                                Horário
                              </span>
                              <span className="min-w-0 truncate text-sm! text-gray-700!">
                                {estagio.horarioInicio} - {estagio.horarioFim}
                              </span>
                            </div>
                          </div>
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
              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                          <Briefcase className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="mb-1! text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">
                            Empresa
                          </p>
                          <h3 className="mb-0! truncate text-lg! font-semibold! text-gray-950!">
                            {selectedEstagio.empresaNome}
                          </h3>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit shrink-0 text-xs! font-medium! border",
                          getStatusConfig(selectedEstagio.status).className
                        )}
                      >
                        {getStatusConfig(selectedEstagio.status).label}
                      </Badge>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-gray-100">
                      <div className="px-5 py-4">
                        <div className="mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                          <p className="mb-0! text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">
                            Curso e turma
                          </p>
                        </div>
                        <div className="min-w-0 space-y-2 pl-6">
                          <div className="min-w-0">
                            <span className="block text-[11px]! text-gray-500!">
                              Curso
                            </span>
                            <p className="mb-0! truncate text-sm! font-semibold! text-gray-900!">
                              {selectedEstagio.cursoNome}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px]! text-gray-500!">
                              Turma
                            </span>
                            <p className="mb-0! truncate text-sm! text-gray-700!">
                              {selectedEstagio.turmaNome}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 px-5 py-4 sm:border-t-0">
                        <div className="mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                          <p className="mb-0! text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">
                            Período e horário
                          </p>
                        </div>
                        <div className="space-y-2 pl-6">
                          <div>
                            <span className="block text-[11px]! text-gray-500!">
                              Período
                            </span>
                            <p className="mb-0! text-sm! font-semibold! text-gray-900!">
                              {format(
                                new Date(selectedEstagio.dataInicioPrevista),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}{" "}
                              até{" "}
                              {format(
                                new Date(selectedEstagio.dataFimPrevista),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[11px]! text-gray-500!">
                              Horário
                            </span>
                            <p className="mb-0! flex items-center gap-1 text-sm! text-gray-700!">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {selectedEstagio.horarioInicio} às{" "}
                              {selectedEstagio.horarioFim}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            <p className="mb-0! text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">
                              Local do estágio
                            </p>
                          </div>
                          <div className="space-y-1 pl-6">
                            <p className="mb-0! text-sm! font-medium! text-gray-900!">
                              {formatEndereco(selectedEstagio)}
                            </p>
                            <p className="mb-0! text-sm! text-gray-500!">
                              CEP: {selectedEstagio.cep}
                            </p>
                          </div>
                        </div>
                        <ButtonCustom
                          variant="outline"
                          size="sm"
                          className="h-9 shrink-0 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() =>
                            window.open(
                              getGoogleMapsUrl(selectedEstagio),
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          withAnimation={false}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver no Google Maps
                        </ButtonCustom>
                      </div>
                    </div>

                    {selectedEstagio.observacoes && (
                      <div className="px-5 py-4">
                        <p className="mb-2! text-xs! font-semibold! uppercase! tracking-wide! text-gray-500!">
                          Observações
                        </p>
                        <p className="mb-0! whitespace-pre-line text-sm! leading-relaxed! text-gray-700!">
                          {selectedEstagio.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <div className="flex justify-end gap-3 border-t border-gray-200/70 pt-4">
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
