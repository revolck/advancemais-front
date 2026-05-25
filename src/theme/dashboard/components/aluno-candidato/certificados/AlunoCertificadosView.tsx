"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { listMeCertificados } from "@/api/cursos";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, Calendar, BookOpen, Download, Eye } from "lucide-react";
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
  mapMeuCertificadoToListItem,
  shouldShowAlunoDataAsEmptyState,
  toApiDate,
  type AlunoCertificadoListItem,
} from "./alunoCertificado.mapper";

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

export function AlunoCertificadosView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const emitidoDe = toApiDate(selectedDateRange.from);
  const emitidoA = toApiDate(selectedDateRange.to);

  const {
    data: certificadosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "aluno-certificados-reais",
      selectedCourseId,
      selectedTurmaId,
      emitidoDe,
      emitidoA,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      try {
        const response = await listMeCertificados({
          cursoId: selectedCourseId ?? undefined,
          turmaId: selectedTurmaId ?? undefined,
          emitidoDe: emitidoDe ?? undefined,
          emitidoA: emitidoA ?? undefined,
          page: currentPage,
          pageSize,
        });
        return {
          items: response.items.map(mapMeuCertificadoToListItem),
          pagination: response.pagination,
          filters: response.filters ?? { cursos: [], turmas: [] },
        };
      } catch (error) {
        if (shouldShowAlunoDataAsEmptyState(error)) {
          return {
            items: [],
            pagination: { page: 1, pageSize, total: 0, totalPages: 1 },
            filters: { cursos: [], turmas: [] },
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const cursosUnicos = useMemo(
    () =>
      (certificadosData?.filters.cursos ?? []).map((curso) => ({
        value: curso.id,
        label: curso.nome,
      })),
    [certificadosData?.filters.cursos]
  );
  const turmasUnicas = useMemo(
    () =>
      (certificadosData?.filters.turmas ?? [])
        .filter((turma) => turma.cursoId === selectedCourseId)
        .map((turma) => ({ value: turma.id, label: turma.nome })),
    [certificadosData?.filters.turmas, selectedCourseId]
  );
  const certificados = certificadosData?.items ?? [];
  const pagination = certificadosData?.pagination;
  const effectivePage = pagination?.page ?? currentPage;
  const totalItems = pagination?.total ?? certificados.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startIndex = totalItems === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const endIndex = Math.min(effectivePage * pageSize, totalItems);

  // Reset página quando filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCourseId,
    selectedTurmaId,
    selectedDateRange.from,
    selectedDateRange.to,
  ]);

  // Reset turma ao trocar/limpar curso
  useEffect(() => {
    setSelectedTurmaId(null);
  }, [selectedCourseId]);

  const showEmptyState = !isLoading && !isError && certificados.length === 0;
  const shouldShowFilters = true;

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "cursoId",
        label: "Curso",
        mode: "single" as const,
        options: cursosUnicos,
        placeholder: "Selecionar",
        disabled: false,
        emptyPlaceholder: "Sem cursos disponíveis",
      },
      {
        key: "turmaId",
        label: "Turma",
        mode: "single" as const,
        options: turmasUnicas,
        placeholder: selectedCourseId ? "Selecionar" : "Selecione um curso",
        disabled: !selectedCourseId,
        emptyPlaceholder: selectedCourseId
          ? "Sem turmas disponíveis"
          : "Selecione um curso primeiro",
      },
      {
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos, selectedCourseId, turmasUnicas]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      turmaId: selectedTurmaId,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedDateRange, selectedTurmaId]
  );

  const [selectedCertificado, setSelectedCertificado] =
    useState<AlunoCertificadoListItem | null>(null);

  const handleView = useCallback((certificado: AlunoCertificadoListItem) => {
    setSelectedCertificado(certificado);
  }, []);

  const handleDownload = useCallback(
    async (certificado: AlunoCertificadoListItem) => {
      const pdfUrl =
        certificado.pdfUrl ||
        `/api/v1/cursos/certificados/${certificado.id}/pdf`;
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    },
    []
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
              if (key === "turmaId") {
                setSelectedTurmaId((value as string) || null);
              }
              if (key === "periodo") {
                setSelectedDateRange(
                  (value as DateRange) || createEmptyDateRange()
                );
              }
            }}
            onClearAll={() => {
              setSelectedCourseId(null);
              setSelectedTurmaId(null);
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
                "Não foi possível carregar seus certificados."}
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
            title="Nenhum certificado encontrado"
            description={
              selectedCourseId ||
              selectedTurmaId ||
              selectedDateRange.from ||
              selectedDateRange.to
                ? "Nenhum certificado encontrado com os filtros aplicados. Tente ajustar os filtros."
                : "Você ainda não possui certificados emitidos"
            }
          />
        </div>
      )}

      {/* Tabela de Certificados */}
      {!isLoading && !isError && certificados.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100 bg-white hover:bg-white">
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Código
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Curso/Turma
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700">
                    Data de Emissão
                  </TableHead>
                  <TableHead className="text-sm font-semibold text-gray-700 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificados.map((cert) => (
                  <TableRow
                    key={cert.id}
                    className="border-gray-100 bg-white hover:bg-blue-50/40"
                  >
                    <TableCell className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium">{cert.codigo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>
                          {cert.cursoNome} / {cert.turmaNome}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>
                          {format(
                            new Date(cert.emitidoEm),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ButtonCustom
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(cert)}
                              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                              withAnimation={false}
                            >
                              <Eye className="h-4 w-4" />
                            </ButtonCustom>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Visualizar
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ButtonCustom
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(cert)}
                              className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer"
                              withAnimation={false}
                            >
                              <Download className="h-4 w-4" />
                            </ButtonCustom>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            Baixar PDF
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Modal de Visualização do Certificado */}
      {selectedCertificado && (
        <ModalCustom
          isOpen={!!selectedCertificado}
          onOpenChange={(open) => {
            if (!open) setSelectedCertificado(null);
          }}
          size="5xl"
          backdrop="blur"
          scrollBehavior="inside"
        >
          <ModalContentWrapper>
            <ModalHeader>
              <ModalTitle>
                Certificado - {selectedCertificado.codigo}
              </ModalTitle>
            </ModalHeader>
            <ModalBody className="p-0">
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden max-h-[70vh]">
                  <iframe
                    title={`Preview ${selectedCertificado.codigo}`}
                    src={
                      selectedCertificado.previewUrl ||
                      `/api/v1/cursos/certificados/${selectedCertificado.id}/preview`
                    }
                    className="w-full min-h-[70vh] border-0 bg-white"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <ButtonCustom
                    variant="outline"
                    onClick={() => setSelectedCertificado(null)}
                    withAnimation={false}
                  >
                    Fechar
                  </ButtonCustom>
                  <ButtonCustom
                    onClick={() => handleDownload(selectedCertificado)}
                    withAnimation={false}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
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
