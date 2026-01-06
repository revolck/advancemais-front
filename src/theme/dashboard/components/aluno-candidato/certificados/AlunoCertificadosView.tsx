"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import type { FilterField } from "@/components/ui/custom/filters";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/api/usuarios";
import { getMockAlunoCertificados } from "@/mockData/aluno-candidato";
import {
  getModeloCertificado,
  gerarHtmlCertificado,
  type CertificadoDados,
} from "@/mockData/certificados";
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

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

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
  templateId?: string;
  cargaHoraria?: number;
  dataInicio?: string;
  dataFim?: string;
}

export function AlunoCertificadosView() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(
    createEmptyDateRange()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Buscar perfil do usuário (para usar o nome no certificado)
  const { data: alunoProfile } = useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      const token = getCookieValue("token");
      if (!token) throw new Error("Token não encontrado");
      return await getUserProfile(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Buscar certificados (mockados por enquanto)
  const { data: todasCertificados, isLoading } = useQuery({
    queryKey: ["aluno-certificados", selectedCourseId],
    queryFn: async () => {
      return getMockAlunoCertificados(selectedCourseId || undefined);
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

  // Filtrar certificados
  const certificadosFiltradas = useMemo(() => {
    const certificados = todasCertificados ?? [];
    let filtered = [...certificados];

    if (selectedCourseId) {
      filtered = filtered.filter((cert) => cert.cursoId === selectedCourseId);
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
  }, [selectedCourseId, selectedDateRange.from, selectedDateRange.to]);

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
        key: "periodo",
        label: "Período",
        type: "date-range" as const,
        placeholder: "Selecionar período",
      },
    ],
    [cursosUnicos]
  );

  const filterValues = useMemo(
    () => ({
      cursoId: selectedCourseId,
      periodo: selectedDateRange,
    }),
    [selectedCourseId, selectedDateRange]
  );

  const [selectedCertificado, setSelectedCertificado] =
    useState<CertificadoListItem | null>(null);

  const handleView = useCallback((certificado: CertificadoListItem) => {
    setSelectedCertificado(certificado);
  }, []);

  const handleDownload = useCallback(
    async (certificado: CertificadoListItem) => {
      try {
        const modeloId = certificado.templateId || "modelo-padrao-001";
        const modelo = getModeloCertificado(modeloId);
        if (!modelo) {
          console.error("Modelo de certificado não encontrado:", modeloId);
          return;
        }

        const dadosCertificado: CertificadoDados = {
          alunoNome:
            (alunoProfile && "usuario" in alunoProfile
              ? alunoProfile.usuario.nomeCompleto
              : alunoProfile && "data" in alunoProfile && alunoProfile.data
              ? alunoProfile.data.nomeCompleto
              : null) || "Nome do Aluno",
          cursoNome: certificado.cursoNome,
          cargaHoraria: certificado.cargaHoraria || 40,
          dataInicio: certificado.dataInicio || certificado.emitidoEm,
          dataFim: certificado.dataFim || certificado.emitidoEm,
          turmaNome: certificado.turmaNome,
          codigo: certificado.codigo,
          conteudoProgramatico: [
            "Introdução ao conteúdo do curso",
            "Desenvolvimento de habilidades práticas",
            "Aplicação de conhecimentos",
            "Projetos e avaliações",
          ],
        };

        const htmlCertificado = gerarHtmlCertificado(modelo, dadosCertificado);

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlCertificado;
        tempDiv.style.position = "absolute";
        tempDiv.style.top = "-10000px";
        tempDiv.style.left = "-10000px";
        tempDiv.style.width = "210mm";
        document.body.appendChild(tempDiv);

        await new Promise((resolve) => setTimeout(resolve, 100));

        const [{ default: html2canvas }, { default: jsPDF }] =
          await Promise.all([import("html2canvas"), import("jspdf")]);

        const canvas = await html2canvas(
          tempDiv.firstElementChild as HTMLElement,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          }
        );

        document.body.removeChild(tempDiv);

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.95),
            "JPEG",
            0,
            position,
            imgWidth,
            imgHeight
          );
          heightLeft -= pdfHeight;
        }

        pdf.save(`certificado-${certificado.codigo}.pdf`);
      } catch (error) {
        console.error("Erro ao gerar PDF do certificado:", error);
        if (certificado.pdfUrl) {
          window.open(certificado.pdfUrl, "_blank");
        }
      }
    },
    [alunoProfile]
  );

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
            title="Nenhum certificado encontrado"
            description={
              selectedCourseId || selectedDateRange.from || selectedDateRange.to
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
                <CertificadoPreview certificado={selectedCertificado} />
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

// Componente para preview do certificado
function CertificadoPreview({
  certificado,
}: {
  certificado: CertificadoListItem;
}) {
  const { data: alunoProfile } = useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      const token = getCookieValue("token");
      if (!token) throw new Error("Token não encontrado");
      return await getUserProfile(token);
    },
    staleTime: 5 * 60 * 1000,
  });

  const modeloId = certificado.templateId || "modelo-padrao-001";
  const modelo = getModeloCertificado(modeloId);

  if (!modelo) {
    return (
      <div className="p-8 text-center text-gray-500">
        Modelo de certificado não encontrado
      </div>
    );
  }

  const dadosCertificado: CertificadoDados = {
    alunoNome:
      (alunoProfile && "usuario" in alunoProfile
        ? alunoProfile.usuario.nomeCompleto
        : alunoProfile && "data" in alunoProfile && alunoProfile.data
        ? alunoProfile.data.nomeCompleto
        : null) || "Nome do Aluno",
    cursoNome: certificado.cursoNome,
    cargaHoraria: certificado.cargaHoraria || 40,
    dataInicio: certificado.dataInicio || certificado.emitidoEm,
    dataFim: certificado.dataFim || certificado.emitidoEm,
    turmaNome: certificado.turmaNome,
    codigo: certificado.codigo,
    conteudoProgramatico: [
      "Introdução ao conteúdo do curso",
      "Desenvolvimento de habilidades práticas",
      "Aplicação de conhecimentos",
      "Projetos e avaliações",
    ],
  };

  const htmlCertificado = gerarHtmlCertificado(modelo, dadosCertificado);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-[70vh]">
      <div
        className="certificado-preview bg-white mx-auto"
        dangerouslySetInnerHTML={{ __html: htmlCertificado }}
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
        }}
      />
    </div>
  );
}
