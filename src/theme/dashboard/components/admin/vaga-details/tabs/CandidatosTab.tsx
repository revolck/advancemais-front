"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  CalendarDays,
  Eye,
  Download,
  Edit,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "../utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditarStatusCandidatoModal } from "../modal-acoes";
import { VerCandidatoDetalheModal } from "../modal-acoes";
import type { CandidatoItem, AboutTabProps } from "../types";
import { listarCandidatosOverview } from "@/api/candidatos";
import type { CandidatoOverview, Candidatura } from "@/api/candidatos/types";

// Dados simulados de candidatos (fallback apenas se API falhar)
const getCandidatosSimulados = (): CandidatoItem[] => {
  const candidatos: CandidatoItem[] = [];
  const nomes = [
    "Ana Silva Santos",
    "Carlos Eduardo Lima",
    "Maria Fernanda Costa",
    "João Pedro Oliveira",
    "Juliana Rodrigues",
    "Rafael Mendes",
    "Camila Alves",
    "Diego Souza",
    "Larissa Ferreira",
    "Bruno Carvalho",
    "Patricia Gomes",
    "Felipe Santos",
    "Amanda Ribeiro",
    "Lucas Pereira",
    "Carla Mendes",
    "Thiago Silva",
    "Fernanda Lima",
    "Marcos Oliveira",
    "Beatriz Costa",
    "André Rodrigues",
    "Gabriela Alves",
    "Rodrigo Souza",
    "Isabela Ferreira",
    "Vinícius Carvalho",
    "Natália Gomes",
    "Gustavo Santos",
    "Luciana Ribeiro",
    "Henrique Pereira",
    "Vanessa Mendes",
    "Leandro Silva",
  ];

  const statusOptions: Array<CandidatoItem["status"]> = [
    "pendente",
    "aprovado",
    "rejeitado",
    "em_analise",
  ];
  const experiencias = ["Júnior", "Pleno", "Sênior", "Especialista"];
  const formacoes = [
    "Ensino Médio",
    "Técnico",
    "Superior",
    "Pós-graduação",
    "Mestrado",
  ];

  for (let i = 0; i < 25; i++) {
    const nome = nomes[i % nomes.length];
    const email = nome.toLowerCase().replace(/\s+/g, ".") + "@email.com";
    const telefone = `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${
      Math.floor(Math.random() * 9000) + 1000
    }`;
    const dataInscricao = new Date(
      2024,
      8,
      Math.floor(Math.random() * 30) + 1
    ).toISOString();
    const status =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const experiencia =
      experiencias[Math.floor(Math.random() * experiencias.length)];
    const formacao = formacoes[Math.floor(Math.random() * formacoes.length)];

    candidatos.push({
      id: `candidato-${i + 1}`,
      nome,
      email,
      telefone,
      dataInscricao,
      status,
      experiencia,
      formacao,
      createdAt: dataInscricao,
    });
  }

  return candidatos.sort(
    (a, b) =>
      new Date(b.dataInscricao).getTime() - new Date(a.dataInscricao).getTime()
  );
};

// Mapeia status do backend para o enum local exibido
function mapBackendStatusToUi(status?: Candidatura["status"]): CandidatoItem["status"] {
  switch (status) {
    case "CONTRATADO":
      return "aprovado";
    case "RECUSADO":
    case "DESISTIU":
    case "NAO_COMPARECEU":
    case "ARQUIVADO":
    case "CANCELADO":
      return "rejeitado";
    case "EM_ANALISE":
    case "EM_TRIAGEM":
    case "ENTREVISTA":
    case "DESAFIO":
    case "DOCUMENTACAO":
      return "em_analise";
    case "RECEBIDA":
    default:
      return "pendente";
  }
}

// Função para obter cor do status
const getStatusColor = (status: CandidatoItem["status"]) => {
  switch (status) {
    case "aprovado":
      return "text-green-600 bg-green-50 border-green-200";
    case "rejeitado":
      return "text-red-600 bg-red-50 border-red-200";
    case "em_analise":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "pendente":
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

// Função para obter label do status
const getStatusLabel = (status: CandidatoItem["status"]) => {
  switch (status) {
    case "aprovado":
      return "Aprovado";
    case "rejeitado":
      return "Rejeitado";
    case "em_analise":
      return "Em Análise";
    case "pendente":
    default:
      return "Pendente";
  }
};

export function CandidatosTab({ vaga }: AboutTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatosData, setCandidatosData] = useState<CandidatoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] =
    useState<CandidatoItem | null>(null);
  const itemsPerPage = 8;

  // Buscar candidatos reais da vaga
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await listarCandidatosOverview({ vagaId: vaga.id, page: 1, pageSize: 100 });
        const data = resp?.data ?? [];

        // Mapear para o formato local
        const mapped: CandidatoItem[] = data.map((cand: CandidatoOverview) => {
          const candidatura = (cand.candidaturas || []).find(
            (c) => c.vagaId === vaga.id
          );
          const statusUI = mapBackendStatusToUi(candidatura?.status);
          const aplicadaEm = candidatura?.aplicadaEm || cand.criadoEm;
          return {
            id: cand.id,
            nome: cand.nomeCompleto,
            email: cand.email,
            telefone: cand.telefone ?? undefined,
            dataInscricao: aplicadaEm,
            status: statusUI,
            experiencia: "—",
            formacao: "—",
            createdAt: aplicadaEm,
            candidaturaId: candidatura?.id,
          } satisfies CandidatoItem;
        });

        if (isMounted) {
          setCandidatosData(mapped);
        }
      } catch (err) {
        console.error("Erro ao carregar candidatos da vaga:", err);
        if (isMounted) {
          setError("Não foi possível carregar candidatos da vaga.");
          // fallback para mock se necessário
          setCandidatosData(getCandidatosSimulados());
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [vaga.id]);

  // Cálculos de paginação
  const totalPages = Math.ceil(candidatosData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidatos = candidatosData.slice(startIndex, endIndex);

  // Funções de navegação
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Funções para editar status do candidato
  const handleEditStatus = (candidato: CandidatoItem) => {
    setSelectedCandidato(candidato);
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = (
    candidatoId: string,
    newStatus: CandidatoItem["status"]
  ) => {
    setCandidatosData((prev) =>
      prev.map((candidato) =>
        candidato.id === candidatoId
          ? { ...candidato, status: newStatus }
          : candidato
      )
    );
    setIsEditModalOpen(false);
    setSelectedCandidato(null);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedCandidato(null);
  };

  // Detalhes do candidato
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCandidato, setDetailsCandidato] = useState<CandidatoItem | null>(null);
  const [loadingCandidatoId, setLoadingCandidatoId] = useState<string | null>(null);

  const handleViewDetails = (candidato: CandidatoItem) => {
    setLoadingCandidatoId(candidato.id);
    setDetailsCandidato(candidato);
    setIsDetailsOpen(true);
    // Reset loading after modal opens
    setTimeout(() => setLoadingCandidatoId(null), 500);
  };

  // Lógica para páginas visíveis (mesmo padrão do CompanyDashboard)
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

  // Colunas da tabela
  const tableColumns = [
    {
      key: "nome",
      label: "Candidato",
      className: "min-w-[200px] max-w-[250px]",
    },
    {
      key: "contato",
      label: "Contato",
      className: "min-w-[180px] max-w-[220px]",
    },
    {
      key: "experiencia",
      label: "Experiência",
      className: "min-w-[120px] max-w-[150px]",
    },
    {
      key: "formacao",
      label: "Formação",
      className: "min-w-[120px] max-w-[150px]",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[120px] max-w-[150px]",
    },
    {
      key: "dataInscricao",
      label: "Data de Inscrição",
      className: "min-w-[140px] max-w-[180px]",
    },
  ];

  // Função para renderizar cada item da lista
  const renderCandidatoItem = (
    candidato: CandidatoItem,
    onView: (item: CandidatoItem) => void,
    isRowLoading: boolean,
    isDisabled: boolean
  ) => {
    return (
      <>
        {/* Nome do Candidato */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-gray-900 truncate text-sm">
                  {candidato.nome}
                </div>
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                  {candidato.id}
                </code>
              </div>
            </div>
          </div>
        </td>

        {/* Contato */}
        <td className="px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{candidato.email}</span>
            </div>
            {candidato.telefone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{candidato.telefone}</span>
              </div>
            )}
          </div>
        </td>

        {/* Experiência */}
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-gray-900">
            {candidato.experiencia}
          </span>
        </td>

        {/* Formação */}
        <td className="px-4 py-3">
          <span className="text-sm text-gray-900">{candidato.formacao}</span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              candidato.status
            )}`}
          >
            {getStatusLabel(candidato.status)}
          </span>
        </td>

        {/* Data de Inscrição */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(candidato.dataInscricao)}</span>
          </div>
        </td>

        {/* Ações */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(candidato)}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer",
                    isRowLoading 
                      ? "text-blue-600 bg-blue-100" 
                      : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                    "disabled:opacity-50 disabled:cursor-wait"
                  )}
                  aria-label="Ver detalhes"
                >
                  {isRowLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                  <Eye className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {isRowLoading ? "Carregando..." : "Ver detalhes"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditStatus(candidato)}
                  disabled={isDisabled}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Editar status"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Editar status</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDisabled}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Baixar currículo"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>Baixar currículo</TooltipContent>
            </Tooltip>
          </div>
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h5 className="!mb-0">Candidatos Inscritos</h5>
        <p>Lista de todos os candidatos que se inscreveram nesta vaga</p>
      </div>

      {/* Lista de Candidatos */}
      <div className="w-full max-w-none">
        {candidatosData.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Nenhum candidato encontrado
                </h3>
                <p className="text-gray-500">
                  Ainda não há candidatos inscritos nesta vaga.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 bg-gray-50/50">
                    {tableColumns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={
                          column.className || "min-w-[120px] max-w-[150px]"
                        }
                      >
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {column.label}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <td className="px-4 py-6 text-sm text-gray-500" colSpan={tableColumns.length + 1}>
                        Carregando candidatos...
                      </td>
                    </TableRow>
                  )}
                  {!isLoading && error && (
                    <TableRow>
                      <td className="px-4 py-6 text-sm text-red-600" colSpan={tableColumns.length + 1}>
                        {error}
                      </td>
                    </TableRow>
                  )}
                  {!isLoading && !error && paginatedCandidatos.map((candidato) => {
                    const isRowLoading = loadingCandidatoId === candidato.id;
                    const isDisabled = loadingCandidatoId !== null && !isRowLoading;
                    return (
                    <TableRow
                      key={candidato.id}
                        className={cn(
                          "border-gray-100 transition-colors",
                          isDisabled 
                            ? "opacity-50 pointer-events-none" 
                            : "hover:bg-gray-50/50",
                          isRowLoading && "bg-blue-50/50"
                        )}
                    >
                        {renderCandidatoItem(candidato, handleViewDetails, isRowLoading, isDisabled)}
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 px-1 py-6 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      candidatosData.length
                    )}{" "}
                    a{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      candidatosData.length
                    )}{" "}
                    de {candidatosData.length}{" "}
                    {candidatosData.length === 1 ? "candidato" : "candidatos"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
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
                        onClick={() => goToPage(1)}
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
                      onClick={() => goToPage(page)}
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
                        onClick={() => goToPage(totalPages)}
                        className="h-8 w-8 p-0"
                      >
                        {totalPages}
                      </ButtonCustom>
                    </>
                  )}

                  <ButtonCustom
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3"
                  >
                    Próxima
                  </ButtonCustom>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Edição de Status */}
      <EditarStatusCandidatoModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        candidato={selectedCandidato}
        onSaveStatus={handleSaveStatus}
      />

      {/* Modal de Detalhes do Candidato */}
      <VerCandidatoDetalheModal
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        candidaturaId={detailsCandidato?.candidaturaId}
        fallback={
          detailsCandidato
            ? {
                nome: detailsCandidato.nome,
                email: detailsCandidato.email,
                telefone: detailsCandidato.telefone,
                dataInscricao: detailsCandidato.dataInscricao,
              }
            : undefined
        }
      />
    </div>
  );
}
