"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { SelectCustom } from "@/components/ui/custom/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Calendar,
  Mail,
  MapPin,
  GraduationCap,
  ExternalLink,
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
}

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

const getProgressColor = (progresso: number): string => {
  if (progresso <= 30) return "bg-red-500";
  if (progresso <= 70) return "bg-amber-500";
  return "bg-emerald-500";
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
    const inicio = dataInicio ? format(new Date(dataInicio), "dd/MM/yyyy", { locale: ptBR }) : "—";
    const fim = dataFim ? format(new Date(dataFim), "dd/MM/yyyy", { locale: ptBR }) : "—";
    return `${inicio} - ${fim}`;
  } catch {
    return "—";
  }
};

export function AlunosMatriculadosTab({
  cursoId,
  turmas = [],
  isLoading: externalLoading = false,
}: AlunosMatriculadosTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    status: [],
    turmaId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    data: response,
    isLoading: isLoadingInscricoes,
    error,
  } = useQuery({
    queryKey: ["curso-inscricoes", cursoId, currentPage, itemsPerPage, filters],
    queryFn: async () => {
      const result = await listInscricoesCurso(cursoId, {
        page: currentPage,
        pageSize: itemsPerPage,
        status: filters.status.length > 0 ? filters.status : undefined,
        turmaId: filters.turmaId || undefined,
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
    });
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
        .map(
          (s) => STATUS_OPTIONS.find((opt) => opt.value === s)?.label || s
        )
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

    return chips;
  }, [filters, turmas]);

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
          illustration="error"
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
              <TableHead className="font-semibold text-gray-700">Aluno</TableHead>
              <TableHead className="font-semibold text-gray-700">Email</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Localização
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Turma</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Progresso</TableHead>
              <TableHead className="font-semibold text-gray-700">
                Data de Inscrição
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Período</TableHead>
              <TableHead className="font-semibold text-gray-700">Ações</TableHead>
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
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {inscricao.aluno.nomeCompleto}
                      </div>
                      <div className="text-xs text-gray-500">
                        {inscricao.aluno.codigo}
                      </div>
                      <div className="text-xs text-gray-400">
                        {inscricao.aluno.cpf}
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
                        {[
                          inscricao.aluno.cidade,
                          inscricao.aluno.estado,
                        ]
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
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          getProgressColor(inscricao.progresso)
                        )}
                        style={{ width: `${inscricao.progresso}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 min-w-[35px]">
                      {inscricao.progresso}%
                    </span>
                  </div>
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
                  <Link
                    href={`/dashboard/usuarios/${inscricao.aluno.id}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Ver perfil
                    <ExternalLink className="h-3 w-3" />
                  </Link>
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
    const endIndex = Math.min(
      currentPage * itemsPerPage,
      pagination.total
    );

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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Filtro de Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Status</Label>
            <MultiSelectFilter
              title="Status"
              placeholder="Selecionar status"
              options={STATUS_OPTIONS}
              selectedValues={filters.status}
              onSelectionChange={(val) => handleFilterChange("status", val)}
              showApplyButton
              className="w-full"
            />
          </div>

          {/* Filtro de Turma */}
          {turmaOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Turma</Label>
              <SelectCustom
                placeholder="Todas as turmas"
                options={turmaOptions}
                value={filters.turmaId}
                onChange={(val) => handleFilterChange("turmaId", val)}
              />
            </div>
          )}
        </div>

        {/* Chips de Filtros Ativos */}
        {activeChips.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => {
                      if (chip.key === "status") {
                        handleFilterChange("status", []);
                      } else {
                        handleFilterChange(chip.key as keyof FilterValues, null);
                      }
                    }}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={`Limpar ${chip.key}`}
                  >
                    <span className="sr-only">Remover filtro</span>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-sm"
            >
              Limpar todos
            </ButtonCustom>
          </div>
        )}
      </div>

      {/* Tabela */}
      {renderTableContent()}

      {/* Paginação */}
      {renderPagination()}
    </div>
  );
}
