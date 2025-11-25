"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, FilterBar } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { SelectCustom } from "@/components/ui/custom/select";
import type { FilterField } from "@/components/ui/custom/filters";
import type { SelectOption } from "@/components/ui/custom/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  User,
  Calendar,
  Mail,
  MapPin,
  GraduationCap,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  listInscricoesCurso,
  type InscricaoCurso,
  type StatusInscricao,
} from "@/api/cursos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface AlunosMatriculadosTabProps {
  cursoId: string;
  turmas?: Array<{ id: string; nome: string; codigo: string }>;
  isLoading?: boolean;
}

interface FilterValues {
  status: string[];
  turmaId: string | null;
  cidade: string[];
}

const MIN_SEARCH_LENGTH = 3;
const SEARCH_HELPER_TEXT = "Pesquise por nome, CPF ou código da inscrição.";

const getSearchValidationMessage = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return `Informe pelo menos ${MIN_SEARCH_LENGTH} caracteres para pesquisar.`;
  }
  return null;
};

const STATUS_OPTIONS: Array<{ value: StatusInscricao; label: string }> = [
  { value: "INSCRITO", label: "Inscrito" },
  { value: "EM_ANDAMENTO", label: "Em Andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "REPROVADO", label: "Reprovado" },
  { value: "EM_ESTAGIO", label: "Em Estágio" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "TRANCADO", label: "Trancado" },
];

const getStatusBadgeColor = (status: StatusInscricao): string => {
  const colorMap: Record<StatusInscricao, string> = {
    INSCRITO: "bg-blue-50 text-blue-700 border-blue-200",
    EM_ANDAMENTO: "bg-amber-50 text-amber-700 border-amber-200",
    CONCLUIDO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REPROVADO: "bg-rose-50 text-rose-700 border-rose-200",
    EM_ESTAGIO: "bg-purple-50 text-purple-700 border-purple-200",
    CANCELADO: "bg-gray-50 text-gray-700 border-gray-200",
    TRANCADO: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return colorMap[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const formatDateRange = (
  dataInicio: string | null,
  dataFim: string | null
): string => {
  if (!dataInicio && !dataFim) return "—";
  try {
    const inicio = dataInicio
      ? format(new Date(dataInicio), "dd/MM/yyyy", { locale: ptBR })
      : "—";
    const fim = dataFim
      ? format(new Date(dataFim), "dd/MM/yyyy", { locale: ptBR })
      : "—";
    return `${inicio} - ${fim}`;
  } catch {
    return "—";
  }
};

const formatCPF = (cpf: string): string => {
  if (!cpf) return "—";
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, "");
  // Aplica máscara: XXX.XXX.XXX-XX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  // Se não tiver 11 dígitos, retorna o original
  return cpf;
};

export function AlunosMatriculadosTab({
  cursoId,
  turmas = [],
  isLoading: externalLoading = false,
}: AlunosMatriculadosTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: [],
    turmaId: null,
    cidade: [],
  });
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    data: response,
    isLoading: isLoadingInscricoes,
    error,
  } = useQuery({
    queryKey: [
      "curso-inscricoes",
      cursoId,
      currentPage,
      itemsPerPage,
      filters,
      appliedSearchTerm,
    ],
    queryFn: async () => {
      const result = await listInscricoesCurso(cursoId, {
        page: currentPage,
        pageSize: itemsPerPage,
        status: filters.status.length > 0 ? filters.status : undefined,
        turmaId: filters.turmaId || undefined,
        search:
          appliedSearchTerm.length >= MIN_SEARCH_LENGTH
            ? appliedSearchTerm
            : undefined,
        cidade:
          filters.cidade.length > 0
            ? filters.cidade.length === 1
              ? filters.cidade[0]
              : filters.cidade
            : undefined,
      });
      return result;
    },
    enabled: !!cursoId,
    staleTime: 30 * 1000, // 30 segundos
  });

  const isLoading = externalLoading || isLoadingInscricoes;
  const inscricoes = response?.data || [];
  const pagination = response?.pagination;

  // Opções de turmas para o filtro
  const turmaOptions = useMemo(() => {
    return turmas.map((turma) => ({
      value: turma.id,
      label: `${turma.codigo} - ${turma.nome}`,
    }));
  }, [turmas]);

  // Opções de cidades baseadas nas inscrições
  const cidadesOptions: SelectOption[] = useMemo(() => {
    const cidades = new Set<string>();
    inscricoes.forEach((inscricao) => {
      if (inscricao.aluno.cidade) {
        cidades.add(inscricao.aluno.cidade);
      }
    });
    return Array.from(cidades)
      .sort()
      .map((cidade) => ({ value: cidade, label: cidade }));
  }, [inscricoes]);

  const searchValidationMessage = useMemo(
    () => getSearchValidationMessage(pendingSearchTerm),
    [pendingSearchTerm]
  );
  const isSearchInputValid = !searchValidationMessage;

  const handleSearchSubmit = useCallback(() => {
    const validationMessage = getSearchValidationMessage(pendingSearchTerm);
    if (validationMessage) return;
    const trimmedValue = pendingSearchTerm.trim();
    setAppliedSearchTerm(trimmedValue);
    setCurrentPage(1);
  }, [pendingSearchTerm]);

  // Função para mudar filtros
  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string | string[] | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      setCurrentPage(1);
    },
    []
  );

  // Função para limpar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({
      status: [],
      turmaId: null,
      cidade: [],
    });
    setPendingSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Função para mudar página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Chips ativos para mostrar filtros aplicados
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];

    if (filters.status.length > 0) {
      const statusLabels = filters.status
        .map((s) => STATUS_OPTIONS.find((opt) => opt.value === s)?.label || s)
        .join(", ");
      chips.push({ key: "status", label: `Status: ${statusLabels}` });
    }

    if (filters.turmaId) {
      const turma = turmas.find((t) => t.id === filters.turmaId);
      chips.push({
        key: "turmaId",
        label: `Turma: ${turma?.codigo || filters.turmaId}`,
      });
    }

    if (filters.cidade.length > 0) {
      const cidadeLabels = filters.cidade.join(", ");
      chips.push({ key: "cidade", label: `Localização: ${cidadeLabels}` });
    }

    if (appliedSearchTerm) {
      chips.push({
        key: "search",
        label: `Pesquisa: ${appliedSearchTerm}`,
      });
    }

    return chips;
  }, [filters, turmas, appliedSearchTerm]);

  // Calcular páginas visíveis
  const visiblePages = useMemo(() => {
    if (!pagination) return [];
    const pages: number[] = [];
    const totalPages = pagination.totalPages;

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
  }, [currentPage, pagination]);

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Erro ao carregar histórico"
          title="Erro ao carregar inscrições"
          description="Não foi possível carregar as inscrições do curso. Tente novamente mais tarde."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      );
    }

    if (inscricoes.length === 0) {
      return (
        <EmptyState
          illustration="myFiles"
          illustrationAlt="Ilustração de histórico vazio"
          title="Nenhuma inscrição encontrada"
          description="Não encontramos inscrições para este curso com os filtros aplicados."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">
                Aluno
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Email
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Localização
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Turma
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Data de Inscrição
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Período
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscricoes.map((inscricao) => (
              <TableRow
                key={inscricao.id}
                className="border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-medium text-gray-900">
                          {inscricao.aluno.nomeCompleto}
                        </div>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 flex-shrink-0">
                          {inscricao.aluno.codigo}
                        </code>
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate max-w-[220px] mt-1">
                        {formatCPF(inscricao.aluno.cpf)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {inscricao.aluno.email}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {inscricao.aluno.cidade || inscricao.aluno.estado ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {[inscricao.aluno.cidade, inscricao.aluno.estado]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {inscricao.turma.codigo}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inscricao.turma.nome}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className={cn(
                      "border font-medium",
                      getStatusBadgeColor(inscricao.statusInscricao)
                    )}
                  >
                    {STATUS_OPTIONS.find(
                      (opt) => opt.value === inscricao.statusInscricao
                    )?.label || inscricao.statusInscricao}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(inscricao.criadoEm)}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-gray-600">
                  {formatDateRange(
                    inscricao.turma.dataInicio,
                    inscricao.turma.dataFim
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-[var(--primary-color)]"
                        aria-label="Visualizar aluno"
                      >
                        <Link
                          href={`/dashboard/cursos/alunos/${inscricao.aluno.id}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>
                      Visualizar aluno
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, pagination.total);

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Mostrando {startIndex} a {endIndex} de {pagination.total} alunos
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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

          {visiblePages[visiblePages.length - 1] < pagination.totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] <
                pagination.totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <ButtonCustom
                variant={
                  currentPage === pagination.totalPages ? "primary" : "outline"
                }
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                className="h-8 w-8 p-0"
              >
                {pagination.totalPages}
              </ButtonCustom>
            </>
          )}
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(Math.min(pagination.totalPages, currentPage + 1))
            }
            disabled={currentPage === pagination.totalPages}
            className="h-8 px-3"
          >
            Próxima
          </ButtonCustom>
        </div>
      </div>
    );
  };

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        mode: "multiple",
        options: STATUS_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        })),
        placeholder: "Selecionar status",
      },
      {
        key: "turma",
        label: "Turma",
        options: turmaOptions,
        placeholder: "Todas as turmas",
        disabled: turmaOptions.length === 0,
      },
      {
        key: "cidade",
        label: "Localização",
        mode: "multiple",
        options: cidadesOptions,
        placeholder: "Selecionar localização",
      },
    ],
    [STATUS_OPTIONS, turmaOptions, cidadesOptions]
  );

  const filterValues = useMemo(
    () => ({
      status: filters.status,
      turma: filters.turmaId,
      cidade: filters.cidade,
    }),
    [filters]
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="border-b border-gray-200">
        <div className="py-4">
          <FilterBar
            className="[&>div]:lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto]"
            fields={filterFields}
            values={filterValues}
            onChange={(key, value) => {
              if (key === "status") {
                handleFilterChange(
                  "status",
                  Array.isArray(value) ? (value as string[]) : []
                );
              } else if (key === "turma") {
                handleFilterChange("turmaId", (value as string) || null);
              } else if (key === "cidade") {
                handleFilterChange(
                  "cidade",
                  Array.isArray(value) ? (value as string[]) : []
                );
              }
            }}
            onClearAll={handleClearFilters}
            search={{
              label: "Pesquisar",
              value: pendingSearchTerm,
              onChange: (value) => setPendingSearchTerm(value),
              placeholder: "Nome, CPF ou código da inscrição...",
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
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
                onClick={handleSearchSubmit}
                disabled={!isSearchInputValid}
              >
                Pesquisar
              </ButtonCustom>
            }
          />
        </div>
      </div>

      {/* Tabela */}
      {renderTableContent()}

      {/* Paginação */}
      {renderPagination()}
    </div>
  );
}
