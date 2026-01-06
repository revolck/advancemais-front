"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  CalendarDays,
  Eye,
  Download,
  Edit,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDate } from "../utils";
import { getInitials } from "../utils/formatters";
import { AvatarCustom } from "@/components/ui/custom/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom/button";
import { FilterBar } from "@/components/ui/custom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/custom/empty-state";
import { EditarStatusCandidatoModal } from "../modal-acoes";
import { VerCandidatoDetalheModal } from "../modal-acoes";
import type { CandidatoItem, AboutTabProps } from "../types";
import {
  listarCandidatosOverview,
  getCandidaturaDetalhe,
  atualizarStatusCandidaturaById,
} from "@/api/candidatos";
import type {
  CandidatoOverview,
  Candidatura,
  CandidatosFilters,
  Curriculo,
} from "@/api/candidatos/types";
import { generateCurriculoPdf } from "../../candidato-details/utils/generateCurriculoPdf";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { toastCustom } from "@/components/ui/custom/toast";
import type { FilterField } from "@/components/ui/custom/filters";
import type { DateRange } from "@/components/ui/custom/date-picker";
import {
  DEFAULT_SEARCH_MIN_LENGTH,
  getNormalizedSearchOrUndefined,
  getSearchValidationMessage,
} from "../../shared/filterUtils";

const ITEMS_PER_PAGE = 10;
const SEARCH_HELPER_TEXT = "Pesquise por nome, email ou código do candidato.";

// Helpers para DateRange
const createEmptyDateRange = (): DateRange => ({
  from: null,
  to: null,
});

const cloneDateRange = (range: DateRange): DateRange => ({
  from: range.from ?? null,
  to: range.to ?? null,
});

// Formata telefone com máscara brasileira
function formatPhone(phone?: string | null): string {
  if (!phone) return "";

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, "");

  // Celular com 11 dígitos: (XX) 9XXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  // Telefone fixo com 10 dígitos: (XX) XXXX-XXXX
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  // Se não encaixa, retorna como veio
  return phone;
}

// Verifica se um valor parece ser um UUID
function isUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// Mapeia status do backend para o enum local exibido
function mapBackendStatusToUi(
  status?: Candidatura["status"],
): CandidatoItem["status"] {
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

// Extrai resumo de experiência do currículo
function getExperienciaSummary(candidato: CandidatoOverview): string {
  const curriculos = candidato.curriculos || [];
  // Pega o currículo principal ou o primeiro disponível
  const curriculo = curriculos.find((c) => c.principal) || curriculos[0];

  if (
    !curriculo ||
    !curriculo.experiencias ||
    curriculo.experiencias.length === 0
  ) {
    return "—";
  }

  const experiencias = curriculo.experiencias;
  const totalExp = experiencias.length;

  if (totalExp === 1) {
    const exp = experiencias[0];
    // Se tem cargo, mostra o cargo
    if (exp?.cargo) {
      return exp.cargo;
    }
    return "1 experiência";
  }

  return `${totalExp} experiências`;
}

// Extrai resumo de formação do currículo
function getFormacaoSummary(candidato: CandidatoOverview): string {
  const curriculos = candidato.curriculos || [];
  // Pega o currículo principal ou o primeiro disponível
  const curriculo = curriculos.find((c) => c.principal) || curriculos[0];

  if (!curriculo || !curriculo.formacao || curriculo.formacao.length === 0) {
    return "—";
  }

  const formacoes = curriculo.formacao;
  const totalForm = formacoes.length;

  if (totalForm === 1) {
    const form = formacoes[0];
    // Se tem curso, mostra o curso
    if (form?.curso) {
      return form.curso;
    }
    return "1 formação";
  }

  return `${totalForm} formações`;
}

// Skeleton para a tabela de candidatos
function CandidatosTableSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100 bg-gray-50/50">
            <TableHead className="min-w-[200px]">
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead className="min-w-[180px]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="min-w-[120px]">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead className="min-w-[140px]">
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index} className="border-gray-100">
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CandidatosTab({ vaga }: AboutTabProps) {
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Estados de busca (pendente vs aplicada)
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  // Estados de filtro de data
  const [pendingDateRange, setPendingDateRange] = useState<DateRange>(() =>
    createEmptyDateRange(),
  );
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>(() =>
    createEmptyDateRange(),
  );

  // Query client para invalidação
  const queryClient = useQueryClient();

  // Estados dos modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] =
    useState<CandidatoItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCandidato, setDetailsCandidato] =
    useState<CandidatoItem | null>(null);
  const [loadingCandidatoId, setLoadingCandidatoId] = useState<string | null>(
    null,
  );
  const [downloadingCurriculoId, setDownloadingCurriculoId] = useState<
    string | null
  >(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Validação do campo de busca
  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm],
  );
  const isSearchInputValid = !searchValidationMessage;

  // Normaliza busca para API
  const normalizedSearch = useMemo(
    () =>
      getNormalizedSearchOrUndefined(
        appliedSearchTerm,
        DEFAULT_SEARCH_MIN_LENGTH,
      ),
    [appliedSearchTerm],
  );

  // Filtros normalizados para a query
  const normalizedFilters = useMemo<CandidatosFilters>(() => {
    const filters: CandidatosFilters = {
      vagaId: vaga.id,
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    };

    if (normalizedSearch) {
      filters.search = normalizedSearch;
    }

    // Filtro de período de inscrição (aplicadaEm)
    if (appliedDateRange.from) {
      filters.aplicadaDe = appliedDateRange.from.toISOString().split("T")[0];
    }
    if (appliedDateRange.to) {
      filters.aplicadaAte = appliedDateRange.to.toISOString().split("T")[0];
    }

    return filters;
  }, [vaga.id, currentPage, normalizedSearch, appliedDateRange]);

  // React Query para buscar candidatos
  const {
    data: queryResult,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.candidatos.byVagaFiltered(vaga.id, normalizedFilters),
    queryFn: async () => {
      const resp = await listarCandidatosOverview(normalizedFilters);
      const data = resp?.data ?? [];
      const pagination = resp?.pagination ?? {
        page: normalizedFilters.page ?? 1,
        pageSize: normalizedFilters.pageSize ?? ITEMS_PER_PAGE,
        total: data.length,
        totalPages: Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE)),
      };

      // Mapear para o formato local
      const mapped: CandidatoItem[] = data.map((cand: CandidatoOverview) => {
        const candidatura = (cand.candidaturas || []).find(
          (c) => c.vagaId === vaga.id,
        );
        const statusUI = mapBackendStatusToUi(candidatura?.status);
        const aplicadaEm = candidatura?.aplicadaEm || cand.criadoEm;

        // Fallback seguro para o nome: se vier vazio ou for UUID, mostra email
        let nome = cand.nomeCompleto;
        if (!nome || isUUID(nome)) {
          // Extrai parte do email antes do @ como fallback
          nome = cand.email?.split("@")[0] || "Candidato";
        }

        // Extrai experiência e formação do currículo
        const experiencia = getExperienciaSummary(cand);
        const formacao = getFormacaoSummary(cand);

        // Pega o curriculoId da candidatura ou do currículo principal do candidato
        const curriculos = cand.curriculos || [];
        const curriculoPrincipal =
          curriculos.find((c) => c.principal) || curriculos[0];
        const curriculoId = candidatura?.curriculoId || curriculoPrincipal?.id;

        return {
          id: cand.id,
          codUsuario: cand.codUsuario,
          nome,
          email: cand.email,
          telefone: cand.telefone ?? undefined,
          avatarUrl: cand.avatarUrl,
          dataInscricao: aplicadaEm,
          status: statusUI,
          experiencia,
          formacao,
          createdAt: aplicadaEm,
          candidaturaId: candidatura?.id,
          curriculoId,
        } satisfies CandidatoItem;
      });

      return {
        candidatos: mapped,
        pagination,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const candidatosData = queryResult?.candidatos ?? [];
  const pagination = queryResult?.pagination ?? {
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  };

  const totalPages = pagination.totalPages;
  const totalItems = pagination.total;

  // Handle de submit da pesquisa (só busca ao clicar)
  const handleSearchSubmit = useCallback(
    (rawValue?: string) => {
      const value = rawValue ?? pendingSearchTerm;
      const validationMessage = getSearchValidationMessage(value);
      if (validationMessage) {
        return;
      }

      const trimmedValue = value.trim();
      setPendingSearchTerm(trimmedValue);
      setAppliedSearchTerm(trimmedValue);
      setAppliedDateRange(cloneDateRange(pendingDateRange));
      setCurrentPage(1);
    },
    [pendingSearchTerm, pendingDateRange],
  );

  // Funções de navegação de página
  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(nextPage);
    },
    [totalPages],
  );

  // Funções para editar status do candidato
  const handleEditStatus = (candidato: CandidatoItem) => {
    setSelectedCandidato(candidato);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedCandidato(null);
  };

  const handleViewDetails = (candidato: CandidatoItem) => {
    setLoadingCandidatoId(candidato.id);
    setDetailsCandidato(candidato);
    setIsDetailsOpen(true);
    // Reset loading after modal opens
    setTimeout(() => setLoadingCandidatoId(null), 500);
  };

  // Download do currículo - gera PDF no frontend usando a função existente
  const handleDownloadCurriculo = async (candidato: CandidatoItem) => {
    if (!candidato.candidaturaId) {
      toastCustom.error({
        title: "Currículo não disponível",
        description: "Este candidato não possui candidatura válida.",
      });
      return;
    }

    setDownloadingCurriculoId(candidato.id);
    try {
      // Busca os detalhes da candidatura (que inclui o currículo completo)
      const response = await getCandidaturaDetalhe(candidato.candidaturaId);
       
      const responseAny = response as any;
      const candidaturaData = responseAny?.candidatura ?? responseAny;
      const curriculo = candidaturaData?.curriculo;

      if (!curriculo) {
        toastCustom.error({
          title: "Currículo não disponível",
          description: "Este candidato não possui currículo cadastrado.",
        });
        return;
      }

      // Monta os dados do usuário para o PDF (usa dados da candidatura se disponíveis)
      const candidatoData = candidaturaData?.candidato;
      const usuarioData = {
        email: candidatoData?.email || candidato.email,
        telefone: candidatoData?.telefone || candidato.telefone,
        avatarUrl: candidatoData?.avatarUrl || candidato.avatarUrl,
      };

      // Gera o PDF no frontend
      await generateCurriculoPdf(
        curriculo as Curriculo,
        candidatoData?.nome || candidatoData?.nomeCompleto || candidato.nome,
        usuarioData as Parameters<typeof generateCurriculoPdf>[2],
      );

      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF do currículo:", error);
      toastCustom.error({
        title: "Erro ao gerar PDF",
        description:
          "Não foi possível gerar o currículo em PDF. Tente novamente.",
      });
    } finally {
      setDownloadingCurriculoId(null);
    }
  };

  // Salvar status da candidatura - chama a API
  const handleSaveStatus = async (candidaturaId: string, statusId: string) => {
    setIsSavingStatus(true);
    try {
      await atualizarStatusCandidaturaById(candidaturaId, statusId);

      toastCustom.success({
        title: "Status atualizado",
        description: "O status do candidato foi atualizado com sucesso.",
      });

      // Invalidar queries para atualizar a lista
      await queryClient.invalidateQueries({
        queryKey: queryKeys.candidatos.byVagaFiltered(
          vaga.id,
          normalizedFilters,
        ),
      });

      // Fechar modal e limpar seleção
      setIsEditModalOpen(false);
      setSelectedCandidato(null);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toastCustom.error({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status. Tente novamente.",
      });
      throw error; // Re-throw para o modal saber que falhou
    } finally {
      setIsSavingStatus(false);
    }
  };

  // Lógica para páginas visíveis
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

  // Campos de filtro
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "dateRange",
        label: "Período de inscrição",
        type: "date-range",
        placeholder: "Selecionar período",
      },
    ],
    [],
  );

  const filterValues = useMemo(
    () => ({
      dateRange: pendingDateRange,
    }),
    [pendingDateRange],
  );

  // Limpar todos os filtros
  const handleClearAll = useCallback(() => {
    setPendingSearchTerm("");
    setAppliedSearchTerm("");
    const resetRange = createEmptyDateRange();
    setPendingDateRange(resetRange);
    setAppliedDateRange(resetRange);
    setCurrentPage(1);
  }, []);

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
    isDisabled: boolean,
  ) => {
    return (
      <>
        {/* Nome do Candidato */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <AvatarCustom
              name={candidato.nome}
              src={candidato.avatarUrl || undefined}
              size="sm"
              showStatus={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-gray-900 truncate text-sm">
                  {candidato.nome}
                </div>
                {candidato.codUsuario && (
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                    {candidato.codUsuario}
                  </code>
                )}
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
                <span className="text-gray-600">
                  {formatPhone(candidato.telefone)}
                </span>
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
              candidato.status,
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
                    "disabled:opacity-50 disabled:cursor-wait",
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
                  disabled={
                    isDisabled || downloadingCurriculoId === candidato.id
                  }
                  onClick={() => handleDownloadCurriculo(candidato)}
                  className={cn(
                    "h-8 w-8 rounded-full cursor-pointer",
                    downloadingCurriculoId === candidato.id
                      ? "text-green-600 bg-green-100"
                      : "text-gray-500 hover:text-white hover:bg-[var(--primary-color)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  aria-label="Baixar currículo"
                >
                  {downloadingCurriculoId === candidato.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {downloadingCurriculoId === candidato.id
                  ? "Baixando..."
                  : "Baixar currículo"}
              </TooltipContent>
            </Tooltip>
          </div>
        </td>
      </>
    );
  };

  const shouldShowSkeleton =
    isLoading || (isFetching && candidatosData.length === 0);
  const showEmptyState = !isLoading && !isFetching && totalItems === 0;
  const errorMessage = error ? "Erro ao carregar candidatos." : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h5 className="!mb-0">Candidatos Inscritos</h5>
        <p>Lista de todos os candidatos que se inscreveram nesta vaga</p>
      </div>

      {/* Barra de Filtros */}
      <div className="border-b border-gray-200 pb-4">
        <FilterBar
          className="lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto]"
          fields={filterFields}
          values={filterValues}
          onChange={(key, value) => {
            if (key === "dateRange") {
              const range = value
                ? cloneDateRange(value as DateRange)
                : createEmptyDateRange();
              setPendingDateRange(range);
              // Aplica o filtro de data automaticamente (sem precisar do botão Pesquisar)
              setAppliedDateRange(range);
              setCurrentPage(1);
            }
          }}
          onClearAll={handleClearAll}
          search={{
            label: "Pesquisar candidato",
            value: pendingSearchTerm,
            onChange: (value) => setPendingSearchTerm(value),
            placeholder: "Buscar por nome, email ou código...",
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
              disabled={isLoading || isFetching || !isSearchInputValid}
              fullWidth
              className="md:w-full xl:w-auto"
            >
              Pesquisar
            </ButtonCustom>
          }
        />

        {errorMessage && (
          <div className="mt-3 text-sm text-red-600 flex items-center gap-2 px-1">
            <span>{errorMessage}</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => refetch()}
              className="p-0 h-auto"
              disabled={isLoading}
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </div>

      {/* Lista de Candidatos */}
      <div className="w-full max-w-none">
        {/* Loading State com Skeleton */}
        {shouldShowSkeleton && <CandidatosTableSkeleton />}

        {/* Empty State */}
        {showEmptyState && (
          <EmptyState
            illustration="userProfiles"
            title="Nenhum candidato encontrado"
            description={
              appliedSearchTerm || appliedDateRange.from || appliedDateRange.to
                ? "Nenhum candidato corresponde aos filtros aplicados. Tente ajustar sua busca."
                : "Ainda não há candidatos inscritos nesta vaga. Quando os candidatos se inscreverem, eles aparecerão aqui."
            }
            size="md"
          />
        )}

        {/* Data State */}
        {!shouldShowSkeleton &&
          !showEmptyState &&
          candidatosData.length > 0 && (
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
                    {candidatosData.map((candidato) => {
                      const isRowLoading = loadingCandidatoId === candidato.id;
                      const isDisabled =
                        loadingCandidatoId !== null && !isRowLoading;
                      return (
                        <TableRow
                          key={candidato.id}
                          className={cn(
                            "border-gray-100 transition-colors",
                            isDisabled
                              ? "opacity-50 pointer-events-none"
                              : "hover:bg-gray-50/50",
                            isRowLoading && "bg-blue-50/50",
                          )}
                        >
                          {renderCandidatoItem(
                            candidato,
                            handleViewDetails,
                            isRowLoading,
                            isDisabled,
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Controles de Paginação */}
              <div className="flex flex-col gap-4 px-1 py-6 border-t border-gray-200 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    Mostrando{" "}
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      totalItems,
                    )}{" "}
                    a {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de{" "}
                    {totalItems} {totalItems === 1 ? "candidato" : "candidatos"}
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
            </>
          )}
      </div>

      {/* Modal de Edição de Status */}
      <EditarStatusCandidatoModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        candidato={selectedCandidato}
        onSaveStatus={handleSaveStatus}
        isSaving={isSavingStatus}
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
                avatarUrl: detailsCandidato.avatarUrl,
              }
            : undefined
        }
      />
    </div>
  );
}
