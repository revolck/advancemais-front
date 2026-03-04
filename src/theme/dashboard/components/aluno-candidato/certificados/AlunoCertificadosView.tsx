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

const createEmptyDateRange = (): DateRange => ({ from: null, to: null });

interface CertificadoListItem {
  id: string;
  key: string;
  codigo: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  turmaNome: string;
  inscricaoId: string;
  alunoId: string;
  emitidoEm: string;
  pdfUrl?: string | null;
  previewUrl?: string | null;
  templateId?: string;
  cargaHoraria?: number;
  dataInicio?: string;
  dataFim?: string;
}

export function AlunoCertificadosView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Buscar certificados do aluno autenticado
  const { data: todasCertificados, isLoading } = useQuery({
    queryKey: ["aluno-certificados"],
    queryFn: async () => {
      const response = await listMeCertificados({
        page: 1,
        pageSize: 200,
      });
      return (response.items ?? []).map((item) => ({
        id: item.id,
        key: item.id,
        codigo: item.codigo || item.numero || "—",
        cursoId: item.curso?.id || item.cursoId || "",
        cursoNome: item.curso?.nome || "Curso",
        turmaId: item.turma?.id || item.turmaId || "",
        turmaNome: item.turma?.nome || "Turma",
        inscricaoId: item.inscricaoId || "",
        alunoId: item.aluno?.id || item.alunoId || "",
        emitidoEm: item.emitidoEm,
        pdfUrl: item.pdfUrl || null,
        previewUrl: item.previewUrl || null,
        templateId: item.modelo?.id || item.templateId,
      })) as CertificadoListItem[];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Extrair cursos únicos dos certificados
  const cursosUnicos = useMemo(() => {
    const certificados = todasCertificados ?? [];
    if (certificados.length === 0) return [];
    const cursosMap = new Map<string, { value: string; label: string }>();
    certificados.forEach((cert) => {
      if (!cursosMap.has(cert.cursoId)) {
        cursosMap.set(cert.cursoId, {
          value: cert.cursoId,
          label: cert.cursoNome,
        });
      }
    });
    return Array.from(cursosMap.values());
  }, [todasCertificados]);

  // Extrair turmas únicas de acordo com o curso selecionado
  const turmasUnicas = useMemo(() => {
    if (!selectedCourseId) return [];
    const certificados = todasCertificados ?? [];
    if (certificados.length === 0) return [];

    const turmasMap = new Map<string, { value: string; label: string }>();
    certificados
      .filter((cert) => cert.cursoId === selectedCourseId)
      .forEach((cert) => {
        if (!turmasMap.has(cert.turmaId)) {
          turmasMap.set(cert.turmaId, {
            value: cert.turmaId,
            label: cert.turmaNome,
          });
        }
      });

    return Array.from(turmasMap.values());
  }, [selectedCourseId, todasCertificados]);

  // Filtrar certificados
  const certificadosFiltradas = useMemo(() => {
    const certificados = todasCertificados ?? [];
    let filtered = [...certificados];

    if (selectedCourseId) {
      filtered = filtered.filter((cert) => cert.cursoId === selectedCourseId);
    }

    if (selectedTurmaId) {
      filtered = filtered.filter((cert) => cert.turmaId === selectedTurmaId);
    }

    if (selectedDateRange.from || selectedDateRange.to) {
      filtered = filtered.filter((cert) => {
        const dataCert = new Date(cert.emitidoEm);
        const dataInicio = selectedDateRange.from
          ? new Date(selectedDateRange.from)
          : null;
        const dataFim = selectedDateRange.to
          ? new Date(selectedDateRange.to)
          : null;

        if (dataInicio && dataFim) {
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          const dataCertDate = new Date(dataCert);
          dataCertDate.setHours(0, 0, 0, 0);
          return dataCertDate >= inicio && dataCertDate <= fim;
        }
        if (dataInicio) {
          const inicio = new Date(dataInicio);
          inicio.setHours(0, 0, 0, 0);
          const dataCertDate = new Date(dataCert);
          dataCertDate.setHours(0, 0, 0, 0);
          return dataCertDate >= inicio;
        }
        if (dataFim) {
          const fim = new Date(dataFim);
          fim.setHours(23, 59, 59, 999);
          return dataCert <= fim;
        }
        return true;
      });
    }

    return filtered;
  }, [
    todasCertificados,
    selectedCourseId,
    selectedTurmaId,
    selectedDateRange.from,
    selectedDateRange.to,
  ]);

  // Paginação
  const totalPages = Math.max(
    1,
    Math.ceil(certificadosFiltradas.length / pageSize)
  );
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const certificadosPaginadas = certificadosFiltradas.slice(
    startIndex,
    endIndex
  );

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

  const showEmptyState = !isLoading && certificadosFiltradas.length === 0;
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
    useState<CertificadoListItem | null>(null);

  const handleView = useCallback((certificado: CertificadoListItem) => {
    setSelectedCertificado(certificado);
  }, []);

  const handleDownload = useCallback(
    async (certificado: CertificadoListItem) => {
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
      {!isLoading && certificadosFiltradas.length > 0 && (
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
                {certificadosPaginadas.map((cert) => (
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
                  Mostrando {startIndex + 1} a{" "}
                  {Math.min(endIndex, certificadosFiltradas.length)} de{" "}
                  {certificadosFiltradas.length}
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
