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
  Edit,
  Calendar,
  Crown,
  Users,
  PenTool,
  Eye,
  X,
} from "lucide-react";
import { listCursoAuditoria, type CursoAuditoriaItem } from "@/api/cursos";
import { listCategorias, listSubcategorias } from "@/api/cursos/categorias";
import type {
  CategoriaCurso,
  SubcategoriaCurso,
} from "@/api/cursos/categorias/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface HistoryTabProps {
  cursoId: string;
  isLoading?: boolean;
}

interface FilterValues {
  campo: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

// Mapeamento de campos para português
const campoLabels: Record<string, string> = {
  nome: "Nome do Curso",
  descricao: "Descrição",
  imagemUrl: "Imagem do Curso",
  cargaHoraria: "Carga Horária",
  categoriaId: "Categoria",
  subcategoriaId: "Subcategoria",
  statusPadrao: "Status Padrão",
  estagioObrigatorio: "Estágio Obrigatório",
};

// Cores para roles
const getRoleBadgeColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    MODERADOR: "bg-blue-50 text-blue-700 border-blue-200",
    PEDAGOGICO: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INSTRUTOR: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return colorMap[role] || "bg-gray-50 text-gray-700 border-gray-200";
};

// Ícones para roles
const getRoleIcon = (role: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    ADMIN: <Crown className="h-3 w-3" />,
    MODERADOR: <Users className="h-3 w-3" />,
    PEDAGOGICO: <PenTool className="h-3 w-3" />,
    INSTRUTOR: <Eye className="h-3 w-3" />,
  };
  return iconMap[role] || <User className="h-3 w-3" />;
};

// Formatar valores especiais
const formatValue = (
  campo: string | null,
  value: any,
  categoriasMap?: {
    categorias: Map<number, string>;
    subcategorias: Map<number, string>;
  },
): string => {
  if (value === null || value === undefined || value === "") {
    return "(vazio)";
  }

  if (campo === "cargaHoraria") {
    return `${value}h`;
  }

  if (campo === "estagioObrigatorio") {
    return value === true || value === "true" ? "Sim" : "Não";
  }

  // Mapear categoriaId para nome da categoria
  if (campo === "categoriaId" && categoriasMap) {
    const id = typeof value === "string" ? parseInt(value, 10) : Number(value);
    if (!isNaN(id) && categoriasMap.categorias.has(id)) {
      return categoriasMap.categorias.get(id)!;
    }
    // Se não encontrar, retornar o ID original
    return String(value);
  }

  // Mapear subcategoriaId para nome da subcategoria
  if (campo === "subcategoriaId" && categoriasMap) {
    const id = typeof value === "string" ? parseInt(value, 10) : Number(value);
    if (!isNaN(id) && categoriasMap.subcategorias.has(id)) {
      return categoriasMap.subcategorias.get(id)!;
    }
    // Se não encontrar, retornar o ID original
    return String(value);
  }

  if (campo === "imagemUrl") {
    if (!value || value === "") return "Imagem removida";
    // Extrair nome do arquivo da URL
    try {
      const url = new URL(value);
      const pathname = url.pathname;
      const filename = pathname.split("/").pop() || "Imagem";
      return filename;
    } catch {
      return value;
    }
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

export function HistoryTab({
  cursoId,
  isLoading: externalLoading = false,
}: HistoryTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    campo: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Buscar categorias e subcategorias para mapear IDs para nomes
  const { data: categoriasData } = useQuery({
    queryKey: ["categorias-cursos"],
    queryFn: async () => {
      try {
        const response = await listCategorias({ pageSize: 1000 });
        // A resposta pode ser um array ou um objeto com data
        if (Array.isArray(response)) {
          return response;
        }
        // Se for um objeto de erro, retornar array vazio
        if (response && "success" in response && !response.success) {
          return [];
        }
        // Se tiver propriedade data, usar ela
        if (response && "data" in response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (err) {
        console.error("❌ Erro ao buscar categorias:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Buscar subcategorias de todas as categorias para garantir mapeamento completo
  const { data: allSubcategorias } = useQuery({
    queryKey: ["subcategorias-cursos", categoriasData?.map((c) => c.id)],
    queryFn: async () => {
      if (
        !categoriasData ||
        !Array.isArray(categoriasData) ||
        categoriasData.length === 0
      ) {
        return [];
      }

      try {
        // Buscar subcategorias de todas as categorias
        const subcategoriasPromises = categoriasData
          .filter(
            (cat: CategoriaCurso) =>
              cat && typeof cat === "object" && "id" in cat,
          )
          .map((cat: CategoriaCurso) =>
            listSubcategorias(cat.id, { pageSize: 1000 })
              .then((result) => {
                // Garantir que o resultado é um array válido
                if (Array.isArray(result)) {
                  return result.filter(
                    (sub: SubcategoriaCurso) =>
                      sub &&
                      typeof sub === "object" &&
                      "id" in sub &&
                      "nome" in sub,
                  );
                }
                return [];
              })
              .catch(() => []),
          );
        const allSubs = await Promise.all(subcategoriasPromises);
        // Filtrar elementos undefined/null e garantir estrutura válida
        return allSubs
          .flat()
          .filter(
            (sub: SubcategoriaCurso) =>
              sub && typeof sub === "object" && "id" in sub && "nome" in sub,
          );
      } catch (err) {
        console.error("❌ Erro ao buscar subcategorias:", err);
        return [];
      }
    },
    enabled:
      !!categoriasData &&
      Array.isArray(categoriasData) &&
      categoriasData.length > 0,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Criar mapas separados para lookup rápido de categorias e subcategorias
  const categoriasMap = useMemo(() => {
    const catMap = new Map<number, string>();
    const subMap = new Map<number, string>();

    if (categoriasData && Array.isArray(categoriasData)) {
      categoriasData.forEach((cat: CategoriaCurso) => {
        // Verificar se cat existe e tem id e nome antes de adicionar ao mapa
        if (cat && typeof cat === "object" && "id" in cat && "nome" in cat) {
          catMap.set(cat.id, cat.nome);
          // Mapear subcategorias que vêm dentro da categoria
          if (cat.subcategorias && Array.isArray(cat.subcategorias)) {
            cat.subcategorias.forEach((sub: SubcategoriaCurso) => {
              // Verificar se sub existe e tem id e nome antes de adicionar ao mapa
              if (
                sub &&
                typeof sub === "object" &&
                "id" in sub &&
                "nome" in sub
              ) {
                subMap.set(sub.id, sub.nome);
              }
            });
          }
        }
      });
    }

    // Adicionar subcategorias buscadas separadamente
    if (allSubcategorias && Array.isArray(allSubcategorias)) {
      allSubcategorias.forEach((sub: SubcategoriaCurso) => {
        // Verificar se sub existe e tem id e nome antes de adicionar ao mapa
        if (sub && typeof sub === "object" && "id" in sub && "nome" in sub) {
          subMap.set(sub.id, sub.nome);
        }
      });
    }

    return { categorias: catMap, subcategorias: subMap };
  }, [categoriasData, allSubcategorias]);

  const {
    data: response,
    isLoading: isLoadingAuditoria,
    error,
  } = useQuery({
    queryKey: ["curso-auditoria", cursoId, currentPage, itemsPerPage],
    queryFn: async () => {
      try {
        const result = await listCursoAuditoria(cursoId, {
          page: currentPage,
          pageSize: itemsPerPage,
        });

        // Remover duplicatas usando uma chave composta mais robusta
        // Considera: campo, valorAnterior, valorNovo, criadoEm (até o segundo), e alteradoPor.id
        if (result?.data && Array.isArray(result.data)) {
          const originalLength = result.data.length;
          const seen = new Set<string>();
          const seenByCompositeKey = new Set<string>();

          result.data = result.data.filter((item) => {
            // Primeiro, verificar duplicata por ID (caso a API retorne o mesmo ID duas vezes)
            if (seen.has(item.id)) {
              return false; // Duplicata por ID, remover
            }
            seen.add(item.id);

            // Criar chave composta para identificar alterações duplicadas mesmo com IDs diferentes
            // Normalizar data para segundo (ignorar milissegundos) para agrupar alterações no mesmo segundo
            const dataNormalizada = item.criadoEm
              ? new Date(item.criadoEm).toISOString().substring(0, 19) // YYYY-MM-DDTHH:mm:ss
              : "";

            const valorAnteriorStr =
              item.valorAnterior !== null && item.valorAnterior !== undefined
                ? String(item.valorAnterior)
                : "null";
            const valorNovoStr =
              item.valorNovo !== null && item.valorNovo !== undefined
                ? String(item.valorNovo)
                : "null";

            const compositeKey = [
              item.campo || "null",
              valorAnteriorStr,
              valorNovoStr,
              dataNormalizada,
              item.alteradoPor?.id || "null",
            ].join("|");

            // Se já vimos esta combinação, é duplicata
            if (seenByCompositeKey.has(compositeKey)) {
              return false; // Duplicata por chave composta, remover
            }
            seenByCompositeKey.add(compositeKey);

            return true;
          });

          // Log para debug (apenas em desenvolvimento)
          if (process.env.NODE_ENV === "development") {
            const finalLength = result.data.length;
            const duplicatasRemovidas = originalLength - finalLength;
            if (duplicatasRemovidas > 0) {
              console.log("🔍 Auditoria - Duplicatas removidas:", {
                cursoId,
                totalOriginal: originalLength,
                totalAposDedup: finalLength,
                duplicatasRemovidas,
              });
            }
          }
        }

        return result;
      } catch (err) {
        console.error("❌ Erro ao buscar auditoria:", err);
        throw err;
      }
    },
    enabled: !!cursoId,
    staleTime: 0, // Sempre busca dados frescos
    refetchOnWindowFocus: true, // Refaz fetch ao focar na janela para pegar atualizações
    refetchOnMount: true, // Refaz fetch ao montar o componente
  });

  const isLoading = externalLoading || isLoadingAuditoria;
  const auditoria = response?.data || [];
  const pagination = response?.pagination;

  // Filtrar dados baseado nos filtros
  const filteredData = useMemo(() => {
    return auditoria.filter((item) => {
      // Filtro por campo
      const matchesCampo =
        filters.campo.length === 0 ||
        (item.campo && filters.campo.includes(item.campo));

      // Filtro por alterado por
      const matchesAlteradoPor =
        filters.alteradoPor.length === 0 ||
        filters.alteradoPor.includes(item.alteradoPor.nomeCompleto);

      // Filtro por período
      const itemDate = new Date(item.criadoEm);
      const periodo = filters.periodo || { from: null, to: null };

      // Normalizar datas para comparação (considerar apenas o dia, ignorar horário)
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      const itemDateNormalized = normalizeDate(itemDate);

      const matchesDataInicio =
        !periodo.from || itemDateNormalized >= normalizeDate(periodo.from);

      // Para a data final, considerar o fim do dia (23:59:59.999)
      const matchesDataFim =
        !periodo.to ||
        (() => {
          const endDate = new Date(periodo.to);
          endDate.setHours(23, 59, 59, 999);
          return itemDate <= endDate;
        })();

      return (
        matchesCampo &&
        matchesAlteradoPor &&
        matchesDataInicio &&
        matchesDataFim
      );
    });
  }, [auditoria, filters]);

  // Paginação
  const totalPages = pagination
    ? pagination.totalPages
    : Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Opções para filtros
  const campoOptions = useMemo(() => {
    const campos = [
      ...new Set(auditoria.map((item) => item.campo).filter(Boolean)),
    ];
    return campos.map((campo) => ({
      value: campo!,
      label: campoLabels[campo!] || campo!,
    }));
  }, [auditoria]);

  const alteradoPorOptions = useMemo(() => {
    const usuarios = [
      ...new Set(auditoria.map((item) => item.alteradoPor.nomeCompleto)),
    ];
    return usuarios.map((nome) => ({ value: nome, label: nome }));
  }, [auditoria]);

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | DateRange | null) => {
      setFilters((prev) => {
        // Se for período e receber null, manter a estrutura correta
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
      campo: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
    setCurrentPage(1);
  }, []);

  // Chips ativos
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];

    if (filters.campo.length > 0) {
      const campoLabels = filters.campo
        .map((c) => campoOptions.find((opt) => opt.value === c)?.label || c)
        .join(", ");
      chips.push({ key: "campo", label: `Campo: ${campoLabels}` });
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
  }, [filters, campoOptions]);

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
          description="Não encontramos registros de alterações para este curso com os filtros aplicados."
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
                Campo
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Valor Anterior
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Valor Novo
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Descrição
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
                      {item.alteradoPor.nomeCompleto}
                    </div>
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium",
                          getRoleBadgeColor(item.alteradoPor.role),
                        )}
                      >
                        {getRoleIcon(item.alteradoPor.role)}
                        {getRoleLabel(item.alteradoPor.role)}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {item.campo ? (
                    <span className="text-gray-600">
                      {campoLabels[item.campo] || item.campo}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  <span className="text-gray-700">
                    {formatValue(item.campo, item.valorAnterior, categoriasMap)}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  <span className="text-gray-700">
                    {formatValue(item.campo, item.valorNovo, categoriasMap)}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {item.descricao ? (
                    item.descricao.length > 100 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-gray-600 cursor-help hover:text-gray-800 transition-colors">
                            {item.descricao.substring(0, 100)}...
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-lg p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50"
                        >
                          <div className="break-words whitespace-pre-wrap">
                            {item.descricao}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-gray-600">{item.descricao}</span>
                    )
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
          {/* Filtro de Campo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Campo</Label>
            <MultiSelectFilter
              title="Campo"
              placeholder="Selecionar campos"
              options={campoOptions}
              selectedValues={filters.campo}
              onSelectionChange={(val) => handleFilterChange("campo", val)}
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
                // Garantir que sempre temos um objeto válido
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
                      if (chip.key === "campo" || chip.key === "alteradoPor") {
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
