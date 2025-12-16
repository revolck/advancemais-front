"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/config/roles";
import {
  User,
  Calendar,
  Crown,
  Users,
  PenTool,
  Eye,
  X,
} from "lucide-react";
import { getAulaHistorico, type AulaHistorico } from "@/api/aulas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface HistoricoTabProps {
  aulaId: string;
  isLoading?: boolean;
}

interface FilterValues {
  acao: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

// Mapeamento de ações para português
const acaoLabels: Record<string, string> = {
  CRIADA: "Aula criada",
  EDITADA: "Aula atualizada",
  VINCULADA_TURMA: "Vinculada à turma",
  DESVINCULADA_TURMA: "Desvinculada da turma",
  STATUS_ALTERADO: "Status alterado",
  CANCELADA: "Aula cancelada",
  RESTAURADA: "Aula restaurada",
  // Compatibilidade com valores antigos
  AULA_CRIADA: "Aula criada",
  AULA_ATUALIZADA: "Aula atualizada",
  AULA_EXCLUIDA: "Aula excluída",
  MATERIAL_ADICIONADO: "Material adicionado",
  MATERIAL_REMOVIDO: "Material removido",
  MATERIAL_ATUALIZADO: "Material atualizado",
};

// Cores para badges de ação
const getAcaoBadgeColor = (acao: string): string => {
  const colorMap: Record<string, string> = {
    CRIADA: "bg-green-50 text-green-700 border-green-200",
    EDITADA: "bg-blue-50 text-blue-700 border-blue-200",
    VINCULADA_TURMA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DESVINCULADA_TURMA: "bg-orange-50 text-orange-700 border-orange-200",
    STATUS_ALTERADO: "bg-purple-50 text-purple-700 border-purple-200",
    CANCELADA: "bg-red-50 text-red-700 border-red-200",
    RESTAURADA: "bg-green-50 text-green-700 border-green-200",
    // Compatibilidade com valores antigos
    AULA_CRIADA: "bg-green-50 text-green-700 border-green-200",
    AULA_ATUALIZADA: "bg-blue-50 text-blue-700 border-blue-200",
    AULA_EXCLUIDA: "bg-red-50 text-red-700 border-red-200",
    MATERIAL_ADICIONADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MATERIAL_REMOVIDO: "bg-orange-50 text-orange-700 border-orange-200",
    MATERIAL_ATUALIZADO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return colorMap[acao] || "bg-gray-50 text-gray-700 border-gray-200";
};

// Cores para badges de role
const getRoleBadgeColor = (role?: string): string => {
  const colorMap: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    MODERADOR: "bg-blue-50 text-blue-700 border-blue-200",
    PEDAGOGICO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INSTRUTOR: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colorMap[role || ""] || "bg-gray-50 text-gray-700 border-gray-200";
};

// Ícones para roles
const getRoleIcon = (role?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    ADMIN: <Crown className="h-3 w-3" />,
    MODERADOR: <Users className="h-3 w-3" />,
    PEDAGOGICO: <PenTool className="h-3 w-3" />,
    INSTRUTOR: <Eye className="h-3 w-3" />,
  };
  return iconMap[role || ""] || <User className="h-3 w-3" />;
};

// Formatar valores especiais
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "(vazio)";
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" && value.length > 50) {
    return value.substring(0, 50) + "...";
  }

  return String(value);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 1) return "Agora";
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30)
    return `Há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `Há ${diffInMonths} mês${diffInMonths > 1 ? "es" : ""}`;
};

export function HistoricoTab({
  aulaId,
  isLoading: externalLoading = false,
}: HistoricoTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    acao: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: historico,
    isLoading: isLoadingHistorico,
    error,
  } = useQuery<AulaHistorico[], Error>({
    queryKey: ["aulaHistorico", aulaId],
    queryFn: () => getAulaHistorico(aulaId),
    staleTime: 0, // Sempre busca dados frescos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const isLoading = externalLoading || isLoadingHistorico;

  // Filtrar dados baseado nos filtros
  const filteredData = useMemo(() => {
    if (!historico || !Array.isArray(historico)) return [];

    return historico.filter((item) => {
      // Filtro por ação
      const matchesAcao =
        filters.acao.length === 0 || filters.acao.includes(item.acao);

      // Filtro por alterado por
      const matchesAlteradoPor =
        filters.alteradoPor.length === 0 ||
        filters.alteradoPor.includes(item.usuario?.nome || "");

      // Filtro por período
      const itemDate = new Date(item.criadoEm);
      const periodo = filters.periodo || { from: null, to: null };

      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      const itemDateNormalized = normalizeDate(itemDate);

      const matchesDataInicio =
        !periodo.from || itemDateNormalized >= normalizeDate(periodo.from);

      const matchesDataFim =
        !periodo.to ||
        (() => {
          const endDate = new Date(periodo.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate <= endDate;
        })();

      return matchesAcao && matchesAlteradoPor && matchesDataInicio && matchesDataFim;
    });
  }, [historico, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Opções para filtros
  const acaoOptions = useMemo(() => {
    if (!historico || !Array.isArray(historico)) return [];
    const acoes = [...new Set(historico.map((item) => item.acao).filter(Boolean))];
    return acoes.map((acao) => ({
      value: acao,
      label: acaoLabels[acao] || acao,
    }));
  }, [historico]);

  const alteradoPorOptions = useMemo(() => {
    if (!historico || !Array.isArray(historico)) return [];
    const usuarios = [
      ...new Set(
        historico
          .map((item) => item.usuario?.nome)
          .filter((nome): nome is string => !!nome),
      ),
    ];
    return usuarios.map((nome) => ({ value: nome, label: nome }));
  }, [historico]);

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | DateRange | null) => {
      setFilters((prev) => {
        if (key === "periodo" && value === null) {
          return {
            ...prev,
            periodo: { from: null, to: null },
          };
        }
        return {
          ...prev,
          [key]: value,
        };
      });
      setCurrentPage(1);
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setFilters({
      acao: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
    setCurrentPage(1);
  }, []);

  // Chips ativos
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];

    if (filters.acao.length > 0) {
      const acaoLabels = filters.acao
        .map((a) => acaoOptions.find((opt) => opt.value === a)?.label || a)
        .join(", ");
      chips.push({ key: "acao", label: `Ação: ${acaoLabels}` });
    }

    if (filters.alteradoPor.length > 0) {
      chips.push({
        key: "alteradoPor",
        label: `Alterado por: ${filters.alteradoPor.join(", ")}`,
      });
    }

    const periodo = filters.periodo || { from: null, to: null };
    if (periodo.from || periodo.to) {
      const dataInicioFormatada =
        periodo.from?.toLocaleDateString("pt-BR") || "...";
      const dataFimFormatada = periodo.to?.toLocaleDateString("pt-BR") || "...";
      chips.push({
        key: "periodo",
        label: `Período: ${dataInicioFormatada} - ${dataFimFormatada}`,
      });
    }

    return chips;
  }, [filters, acaoOptions]);

  // Calcular páginas visíveis
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
          title="Erro ao carregar histórico"
          description="Não foi possível carregar o histórico de alterações. Tente novamente mais tarde."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      );
    }

    if (filteredData.length === 0) {
      return (
        <EmptyState
          illustration="myFiles"
          illustrationAlt="Ilustração de histórico vazio"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros de alterações para esta aula com os filtros aplicados."
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
                Data
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Alterado Por
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Ação
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Detalhes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                      <Calendar className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        {formatDate(item.criadoEm)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {formatRelativeTime(item.criadoEm)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm">
                    <div className="text-gray-900 font-medium">
                      {item.usuario?.nome || "—"}
                    </div>
                    {item.usuario?.role && (
                      <div className="mt-1">
                        <Badge
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium",
                            getRoleBadgeColor(item.usuario.role),
                          )}
                        >
                          {getRoleIcon(item.usuario.role)}
                          {getRoleLabel(item.usuario.role)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      getAcaoBadgeColor(item.acao),
                    )}
                  >
                    {acaoLabels[item.acao] || item.acao}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {item.camposAlterados &&
                  item.camposAlterados !== null &&
                  typeof item.camposAlterados === "object" &&
                  Object.keys(item.camposAlterados).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(item.camposAlterados).map(
                        ([campo, mudanca]) => {
                          const { de, para } = mudanca as {
                            de: any;
                            para: any;
                          };
                          const campoLabel =
                            campo.charAt(0).toUpperCase() +
                            campo.slice(1).replace(/([A-Z])/g, " $1");
                          return (
                            <div key={campo} className="text-xs">
                              <span className="font-medium text-gray-700">
                                {campoLabel}:
                              </span>{" "}
                              <span className="text-red-600">
                                {formatValue(de)}
                              </span>{" "}
                              →{" "}
                              <span className="text-green-600">
                                {formatValue(para)}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Mostrando {startIndex + 1} a{" "}
            {Math.min(endIndex, filteredData.length)} de {filteredData.length}{" "}
            registros
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                onClick={() => setCurrentPage(1)}
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
              onClick={() => setCurrentPage(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </ButtonCustom>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <ButtonCustom
                variant={currentPage === totalPages ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </ButtonCustom>
            </>
          )}
          <ButtonCustom
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Filtro de Ação */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Ação</Label>
            <MultiSelectFilter
              title="Ação"
              placeholder="Selecionar ações"
              options={acaoOptions}
              selectedValues={filters.acao}
              onSelectionChange={(val) => handleFilterChange("acao", val)}
              showApplyButton
              className="w-full"
            />
          </div>

          {/* Filtro de Alterado Por */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Alterado por
            </Label>
            <MultiSelectFilter
              title="Alterado por"
              placeholder="Selecionar usuários"
              options={alteradoPorOptions}
              selectedValues={filters.alteradoPor}
              onSelectionChange={(val) =>
                handleFilterChange("alteradoPor", val)
              }
              showApplyButton
              className="w-full"
            />
          </div>

          {/* Filtro de Período */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Período
            </Label>
            <DatePickerRangeCustom
              value={filters.periodo || { from: null, to: null }}
              onChange={(range) => {
                const periodoValue = range || { from: null, to: null };
                handleFilterChange("periodo", periodoValue);
              }}
              placeholder="Selecionar período"
              size="md"
              clearable
              format="dd/MM/yyyy"
              maxDate={new Date()}
            />
          </div>
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
                      if (chip.key === "acao" || chip.key === "alteradoPor") {
                        handleFilterChange(chip.key, []);
                      } else if (chip.key === "periodo") {
                        handleFilterChange(chip.key, { from: null, to: null });
                      } else {
                        handleFilterChange(chip.key, null);
                      }
                    }}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label={`Limpar ${chip.key}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <ButtonCustom
              variant="outline"
              size="sm"
              onClick={handleClearAll}
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
