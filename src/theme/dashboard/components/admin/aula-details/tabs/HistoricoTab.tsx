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
  MATERIAIS_REORDENADOS: "Materiais reordenados",
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
    MATERIAIS_REORDENADOS: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return colorMap[acao] || "bg-gray-50 text-gray-700 border-gray-200";
};

const isDeParaChange = (value: unknown): value is { de: any; para: any } => {
  if (!value || typeof value !== "object") return false;
  return "de" in value && "para" in value;
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

const getCampoLabel = (campo: string): string | null => {
  const map: Record<string, string | null> = {
    // Redundante (já existe coluna "Ação")
    acao: null,
    // Aulas
    titulo: "Título",
    descricao: "Descrição",
    modalidade: "Modalidade",
    status: "Status",
    turmaId: "Turma",
    instrutorId: "Instrutor",
    moduloId: "Módulo",
    dataInicio: "Data de início",
    dataFim: "Data de término",
    horaInicio: "Hora de início",
    horaFim: "Hora de término",
    duracaoMinutos: "Duração (min)",
    obrigatoria: "Obrigatória",
    sala: "Sala",
    youtubeUrl: "YouTube",
    meetUrl: "Google Meet",
    // Materiais (não mostrar IDs internos)
    materialId: null,
    materialTipo: "Tipo",
    materialTitulo: "Material",
    arquivoNome: "Arquivo",
    arquivoMimeType: "Formato",
    linkUrl: "Link",
  };

  if (campo in map) return map[campo] ?? null;

  const human = campo
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();

  return human ? human.charAt(0).toUpperCase() + human.slice(1) : null;
};

const formatCampoValue = (campo: string, value: any): string => {
  const raw = formatValue(value);
  if (raw === "(vazio)") return raw;

  const upper = String(value).toUpperCase?.() ?? raw;

  if (campo === "modalidade") {
    const map: Record<string, string> = {
      ONLINE: "Online",
      PRESENCIAL: "Presencial",
      AO_VIVO: "Ao vivo",
      SEMIPRESENCIAL: "Semipresencial",
    };
    return map[upper] ?? raw;
  }

  if (campo === "status") {
    const map: Record<string, string> = {
      RASCUNHO: "Rascunho",
      PUBLICADA: "Publicada",
      EM_ANDAMENTO: "Em andamento",
      CONCLUIDA: "Concluída",
      CANCELADA: "Cancelada",
    };
    return map[upper] ?? raw;
  }

  if (campo === "materialTipo") {
    const map: Record<string, string> = {
      ARQUIVO: "Arquivo",
      LINK: "Link",
      TEXTO: "Texto",
    };
    return map[upper] ?? raw;
  }

  return raw;
};

const isEmptyFormatted = (v: string) => v === "(vazio)";

const shortenId = (value: any): string | null => {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  // uuid -> primeiros 8 chars
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    return v.slice(0, 8);
  }
  return null;
};

const getEffectiveAcao = (item: AulaHistorico): string => {
  const campos = item.camposAlterados;
  if (!campos || typeof campos !== "object") return item.acao;
  const acaoFromCampos = (campos as any).acao;
  if (typeof acaoFromCampos === "string" && acaoFromCampos.trim()) {
    return acaoFromCampos.trim();
  }
  return item.acao;
};

const extractNameFromUrl = (raw: string): string => {
  try {
    const url = new URL(raw);
    const last = url.pathname.split("/").filter(Boolean).pop();
    return last || url.host;
  } catch {
    // fallback simples
    const parts = raw.split("/").filter(Boolean);
    return parts[parts.length - 1] || raw;
  }
};

const toMaterialNames = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return extractNameFromUrl(item);
        if (item && typeof item === "object") {
          const titulo = (item as any).titulo;
          const url = (item as any).url;
          if (typeof titulo === "string" && titulo.trim()) return titulo.trim();
          if (typeof url === "string" && url.trim()) return extractNameFromUrl(url.trim());
        }
        return null;
      })
      .filter((x): x is string => Boolean(x));
  }
  return [];
};

const formatMateriaisChange = (de: any, para: any): string | null => {
  const from = toMaterialNames(de);
  const to = toMaterialNames(para);
  if (from.length === 0 && to.length === 0) return null;

  const added = to.filter((x) => !from.includes(x));
  const removed = from.filter((x) => !to.includes(x));

  const parts: string[] = [];
  if (added.length > 0) parts.push(`Adicionado: ${added.join(", ")}`);
  if (removed.length > 0) parts.push(`Removido: ${removed.join(", ")}`);
  if (parts.length === 0) return null;
  return parts.join(" • ");
};

const formatMateriaisReordenados = (items: any): string | null => {
  if (!Array.isArray(items)) return null;
  const parts = items
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const materialTitulo =
        typeof (m as any).materialTitulo === "string" && (m as any).materialTitulo.trim()
          ? (m as any).materialTitulo.trim()
          : null;
      const materialId = typeof (m as any).materialId === "string" ? (m as any).materialId : null;
      const short = materialId ? shortenId(materialId) : null;
      const name = materialTitulo || (short ? `#${short}` : "Material");

      const ordem = (m as any).ordem;
      if (!isDeParaChange(ordem)) return null;
      const de = ordem.de;
      const para = ordem.para;
      if (de === undefined || para === undefined || de === para) return null;
      return `${name}: ${de} → ${para}`;
    })
    .filter((x): x is string => Boolean(x));

  if (parts.length === 0) return null;
  return parts.join(" • ");
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
      const effectiveAcao = getEffectiveAcao(item);
      // Filtro por ação
      const matchesAcao =
        filters.acao.length === 0 || filters.acao.includes(effectiveAcao);

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
    const acoes = [
      ...new Set(
        historico.map((item) => getEffectiveAcao(item)).filter(Boolean),
      ),
    ];
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
    (key: string, value: string | string[] | DateRange | Date | null) => {
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
                      getAcaoBadgeColor(getEffectiveAcao(item)),
                    )}
                  >
                    {acaoLabels[getEffectiveAcao(item)] || getEffectiveAcao(item)}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {item.camposAlterados &&
                  item.camposAlterados !== null &&
                  typeof item.camposAlterados === "object" &&
                  Object.keys(item.camposAlterados).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(item.camposAlterados)
                        .map(([campo, mudanca]) => {
                          if (campo === "acao") return null;

                          const changesObj = item.camposAlterados as Record<string, unknown>;

                          const hasMaterialDetail = ["materialTitulo", "arquivoNome", "linkUrl"].some(
                            (k) => {
                              const entry = (changesObj as any)[k] as unknown;
                              if (!isDeParaChange(entry)) return false;
                              const deTxt = formatCampoValue(k, (entry as any).de);
                              const paraTxt = formatCampoValue(k, (entry as any).para);
                              return !isEmptyFormatted(deTxt) || !isEmptyFormatted(paraTxt);
                            }
                          );

                          // Esconder id interno quando há detalhe melhor
                          if (campo === "materialId" && hasMaterialDetail) return null;

                          // Campo especial: materiais
                          if (campo === "materiais") {
                            if (Array.isArray(mudanca)) {
                              const summary = formatMateriaisReordenados(mudanca);
                              if (!summary) return null;
                              return (
                                <div key={campo} className="text-xs">
                                  <span className="font-medium text-gray-700">
                                    Materiais:
                                  </span>{" "}
                                  <span className="text-gray-700">{summary}</span>
                                </div>
                              );
                            }

                            if (isDeParaChange(mudanca)) {
                              const summary = formatMateriaisChange(
                                (mudanca as any).de,
                                (mudanca as any).para,
                              );
                              if (!summary) return null;
                              return (
                                <div key={campo} className="text-xs">
                                  <span className="font-medium text-gray-700">
                                    Materiais:
                                  </span>{" "}
                                  <span className="text-gray-700">{summary}</span>
                                </div>
                              );
                            }

                            return null;
                          }

                          const label = getCampoLabel(campo);
                          if (!label) return null;

                          if (!isDeParaChange(mudanca)) return null;

                          const { de, para } = mudanca as { de: any; para: any };
                          const fromText = formatCampoValue(campo, de);
                          const toText = formatCampoValue(campo, para);

                          // Evita poluição: (vazio) -> (vazio) e valores idênticos
                          if (
                            (isEmptyFormatted(fromText) &&
                              isEmptyFormatted(toText)) ||
                            fromText === toText
                          ) {
                            return null;
                          }

                          // Se só houver id de material, mostrar curto pra ficar legível
                          if (campo === "materialId") {
                            const shortFrom = shortenId(de);
                            const shortTo = shortenId(para);
                            const from = shortFrom ? `#${shortFrom}` : fromText;
                            const to = shortTo ? `#${shortTo}` : toText;
                            const content =
                              isEmptyFormatted(fromText) && !isEmptyFormatted(toText) ? (
                                <span className="text-green-600">{to}</span>
                              ) : !isEmptyFormatted(fromText) && isEmptyFormatted(toText) ? (
                                <span className="text-red-600">{from}</span>
                              ) : (
                                <>
                                  <span className="text-red-600">{from}</span>{" "}
                                  →{" "}
                                  <span className="text-green-600">{to}</span>
                                </>
                              );
                            return (
                              <div key={campo} className="text-xs">
                                <span className="font-medium text-gray-700">
                                  Material:
                                </span>{" "}
                                {content}
                              </div>
                            );
                          }

                          const content = (() => {
                            if (isEmptyFormatted(fromText) && !isEmptyFormatted(toText)) {
                              return <span className="text-green-600">{toText}</span>;
                            }
                            if (!isEmptyFormatted(fromText) && isEmptyFormatted(toText)) {
                              return <span className="text-red-600">{fromText}</span>;
                            }
                            return (
                              <>
                                <span className="text-red-600">{fromText}</span>{" "}
                                →{" "}
                                <span className="text-green-600">{toText}</span>
                              </>
                            );
                          })();

                          return (
                            <div key={campo} className="text-xs">
                              <span className="font-medium text-gray-700">
                                {label}:
                              </span>{" "}
                              {content}
                            </div>
                          );
                        })
                        .filter(Boolean)}
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
