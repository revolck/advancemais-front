"use client";

import { useState, useMemo, useCallback } from "react";
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
import {
  User,
  Edit,
  Shield,
  CreditCard,
  Crown,
  Users,
  PenTool,
  Eye,
  Calendar,
  X,
} from "lucide-react";
import type { AdminCompanyAuditoriaItem } from "@/api/empresas/admin/types";

export interface HistoryTabProps {
  auditoria: AdminCompanyAuditoriaItem[];
  isLoading?: boolean;
}

interface FilterValues {
  acao: string[];
  campo: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

export function HistoryTab({ auditoria, isLoading = false }: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterValues>({
    acao: [],
    campo: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Função para formatar nomes de campos de forma amigável
  const formatFieldName = (fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      instagram: "Instagram",
      linkedin: "LinkedIn",
      facebook: "Facebook",
      youtube: "YouTube",
      twitter: "Twitter",
      tiktok: "TikTok",
      redes_sociais: "Redes Sociais",
      social_instagram: "Instagram",
      social_linkedin: "LinkedIn",
      social_facebook: "Facebook",
      social_youtube: "YouTube",
      social_twitter: "Twitter",
      social_tiktok: "TikTok",
      descricao: "Descrição",
      nome: "Nome",
      email: "E-mail",
      telefone: "Telefone",
      endereco: "Endereço",
      endereco_completo: "Endereço Completo",
      enderecos: "Endereços",
      logradouro: "Logradouro",
      numero: "Número",
      bairro: "Bairro",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      cnpj: "CNPJ",
      site: "Site",
      logo: "Logo",
      status: "Status",
      plano: "Plano",
      plano_nome: "Nome do Plano",
      plano_modo: "Modo do Plano",
      plano_status: "Status do Plano",
      plano_modelo_pagamento: "Modelo de Pagamento",
      plano_metodo_pagamento: "Método de Pagamento",
      plano_status_pagamento: "Status de Pagamento",
      plano_dias_teste: "Dias de Teste",
      data_criacao: "Data de Criação",
      data_atualizacao: "Data de Atualização",
      bloqueio_aplicado: "Bloqueio Aplicado",
      bloqueio_revogado: "Bloqueio Revogado",
    };

    return (
      fieldMap[fieldName] ||
      fieldName
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  // Função para formatar ações de forma amigável
  const formatActionName = (action: string): string => {
    const actionMap: Record<string, string> = {
      EMPRESA_ATUALIZADA: "Empresa Atualizada",
      PLANO_ASSIGNADO: "Plano Atribuído",
      PLANO_ASSIGNED: "Plano Atribuído",
      BLOQUEIO_APLICADO: "Bloqueio Aplicado",
      BLOQUEIO_REVOGADO: "Bloqueio Revogado",
      EMPRESA_CRIADA: "Empresa Criada",
      EMPRESA_DELETADA: "Empresa Deletada",
      USUARIO_ADICIONADO: "Usuário Adicionado",
      USUARIO_REMOVIDO: "Usuário Removido",
      VAGA_CRIADA: "Vaga Criada",
      VAGA_ATUALIZADA: "Vaga Atualizada",
      VAGA_DELETADA: "Vaga Deletada",
      CANDIDATO_APLICOU: "Candidato Aplicou",
      CANDIDATO_APROVADO: "Candidato Aprovado",
      CANDIDATO_REJEITADO: "Candidato Rejeitado",
    };

    return (
      actionMap[action] ||
      action
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    );
  };

  // Filtrar dados baseado na busca e filtros
  const filteredData = useMemo(() => {
    return auditoria.filter((item) => {
      // Filtro de busca
      const matchesSearch =
        searchTerm === "" ||
        item.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alteradoPor.nomeCompleto
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.campo &&
          item.campo.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtros específicos (múltipla seleção)
      const matchesAcao =
        !filters.acao ||
        filters.acao.length === 0 ||
        filters.acao.includes(item.acao);
      const matchesCampo =
        filters.campo.length === 0 ||
        (item.campo && filters.campo.includes(item.campo));
      const matchesAlteradoPor =
        !filters.alteradoPor ||
        filters.alteradoPor.length === 0 ||
        filters.alteradoPor.includes(item.alteradoPor.nomeCompleto);

      // Filtro por período de data
      const itemDate = new Date(item.criadoEm);
      const matchesDataInicio =
        !filters.periodo.from || itemDate >= filters.periodo.from;
      const matchesDataFim =
        !filters.periodo.to || itemDate <= filters.periodo.to;

      return (
        matchesSearch &&
        matchesAcao &&
        matchesCampo &&
        matchesAlteradoPor &&
        matchesDataInicio &&
        matchesDataFim
      );
    });
  }, [auditoria, searchTerm, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Função para mudar página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Função para limpar filtros
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      acao: [],
      campo: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
    setCurrentPage(1);
  }, []);

  // Opções para filtros
  const acaoOptions = useMemo(() => {
    const acoes = [...new Set(auditoria.map((item) => item.acao))];
    return acoes.map((acao) => ({
      value: acao,
      label: formatActionName(acao),
    }));
  }, [auditoria]);

  const campoOptions = useMemo(() => {
    const campos = [
      ...new Set(auditoria.map((item) => item.campo).filter(Boolean)),
    ];
    return campos.map((campo) => ({
      value: campo!,
      label: formatFieldName(campo!),
    }));
  }, [auditoria]);

  const alteradoPorOptions = useMemo(() => {
    const usuarios = [
      ...new Set(auditoria.map((item) => item.alteradoPor.nomeCompleto)),
    ];
    return usuarios.map((nome) => ({ value: nome, label: nome }));
  }, [auditoria]);

  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | Date | DateRange | null) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      setCurrentPage(1);
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setFilters({
      acao: [],
      campo: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // Função para verificar se um valor está vazio
  const valueIsEmpty = (value: unknown): boolean => {
    if (value === undefined || value === null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "string") return value.length === 0;
    return false;
  };

  // Função para encontrar o label de uma opção
  const findLabel = (
    options: { value: string; label: string }[],
    value: string | null
  ): string | null => {
    if (!value) return null;
    const found = options.find((o) => o.value === value);
    return found?.label ?? value;
  };

  // Chips ativos para mostrar filtros aplicados
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];

    // Chips para filtros de seleção múltipla
    const fields = [
      { key: "acao", label: "Ação", options: acaoOptions },
      { key: "campo", label: "Campo", options: campoOptions },
      {
        key: "alteradoPor",
        label: "Alterado por",
        options: alteradoPorOptions,
      },
    ];

    fields.forEach((f) => {
      const value = filters[f.key as keyof FilterValues] as
        | string
        | string[]
        | null
        | undefined;
      if (!valueIsEmpty(value)) {
        const arr = (value as string[]).map(
          (v) => findLabel(f.options, v) ?? v
        );
        chips.push({ key: f.key, label: `${f.label}: ${arr.join(", ")}` });
      }
    });

    // Chips para filtros de período
    if (filters.periodo.from || filters.periodo.to) {
      const dataInicioFormatada =
        filters.periodo.from?.toLocaleDateString("pt-BR") || "...";
      const dataFimFormatada =
        filters.periodo.to?.toLocaleDateString("pt-BR") || "...";
      chips.push({
        key: "periodo",
        label: `Período: ${dataInicioFormatada} - ${dataFimFormatada}`,
      });
    }

    return chips;
  }, [filters, acaoOptions, campoOptions, alteradoPorOptions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Atualizado agora";
    if (diffInMinutes < 60) return `Atualizado em ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Atualizado em ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `Atualizado há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `Atualizado há ${diffInMonths} mês${diffInMonths > 1 ? "es" : ""}`;
  };

  // Função para truncar texto e criar tooltip
  const truncateValue = (value: string | null, maxLength: number = 50) => {
    if (!value || value === "—") return value;
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + "...";
  };

  // Função para formatar informações de plano
  const formatPlanoInfo = (plano: any): string => {
    if (!plano || typeof plano !== "object") {
      return "Plano não informado";
    }

    const parts: string[] = [];

    if (plano.nome) parts.push(`Nome: ${plano.nome}`);
    if (plano.modo) parts.push(`Modo: ${plano.modo}`);
    if (plano.status) parts.push(`Status: ${plano.status}`);
    if (plano.modeloPagamento) parts.push(`Modelo: ${plano.modeloPagamento}`);
    if (plano.metodoPagamento) parts.push(`Método: ${plano.metodoPagamento}`);
    if (plano.statusPagamento)
      parts.push(`Pagamento: ${plano.statusPagamento}`);
    if (plano.diasTeste) parts.push(`Dias teste: ${plano.diasTeste}`);

    return parts.length > 0 ? parts.join(" • ") : "Plano sem informações";
  };

  // Função para formatar informações de bloqueio
  const formatBloqueioInfo = (metadata: any): string => {
    if (!metadata || typeof metadata !== "object") {
      return "Informações de bloqueio não disponíveis";
    }

    const tipoMap: Record<string, string> = {
      TEMPORARIO: "Temporário",
      PERMANENTE: "Permanente",
      RESTRICAO_DE_RECURSO: "Restrição de Recurso",
    };
    const tipoLabel = tipoMap[metadata.tipo] || metadata.tipo;

    const parts: string[] = [];

    parts.push(`Tipo: ${tipoLabel}`);
    if (metadata.motivo) parts.push(`Motivo: ${metadata.motivo}`);
    if (metadata.duracaoDias)
      parts.push(`Duração: ${metadata.duracaoDias} dias`);

    // Adicionar informações de data se disponíveis
    if (metadata.inicio) {
      const dataInicio = new Date(metadata.inicio).toLocaleDateString("pt-BR");
      parts.push(`Início: ${dataInicio}`);
    }
    if (metadata.fim) {
      const dataFim = new Date(metadata.fim).toLocaleDateString("pt-BR");
      parts.push(`Fim: ${dataFim}`);
    } else if (metadata.tipo === "PERMANENTE") {
      parts.push(`Fim: Sem data de término`);
    }

    if (metadata.observacoes) parts.push(`Obs: ${metadata.observacoes}`);

    return parts.length > 0 ? parts.join(" • ") : "Bloqueio sem informações";
  };

  // Função para formatar JSON de forma amigável para o usuário
  const formatJsonForUser = (obj: any): string => {
    if (typeof obj !== "object" || obj === null) {
      return String(obj);
    }

    // Verifica se é um objeto de metadata com informações de plano
    if (obj.planoAnterior || obj.planoNovo) {
      const changes: string[] = [];

      if (obj.planoAnterior && obj.planoNovo) {
        changes.push(`Plano anterior: ${formatPlanoInfo(obj.planoAnterior)}`);
        changes.push(`Plano novo: ${formatPlanoInfo(obj.planoNovo)}`);
        return changes.join(" → ");
      } else if (obj.planoAnterior) {
        return `Plano anterior: ${formatPlanoInfo(obj.planoAnterior)}`;
      } else if (obj.planoNovo) {
        return `Plano novo: ${formatPlanoInfo(obj.planoNovo)}`;
      }
    }

    // Verifica se é um objeto de metadata com informações de bloqueio
    if (obj.tipo && (obj.motivo || obj.observacoes)) {
      return formatBloqueioInfo(obj);
    }

    const entries = Object.entries(obj);
    // Filtra apenas valores não nulos e não vazios
    const nonNullEntries = entries.filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    );

    if (nonNullEntries.length === 0) {
      return "Nenhuma informação";
    }

    return nonNullEntries
      .map(([key, value]) => {
        const formattedKey = formatFieldName(key);
        return `${formattedKey}: ${value}`;
      })
      .join(", ");
  };

  // Função para formatar valor de forma amigável ao usuário
  const formatValueForUser = (value: string | null) => {
    if (!value || value === "—" || value === "null" || value === "undefined") {
      return "Não informado";
    }

    // Se for JSON, formata de forma mais amigável
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const parsed = JSON.parse(value);
        return formatJsonForUser(parsed);
      } catch {
        return value;
      }
    }

    // Se for array vazio ou objeto vazio
    if (value === "[]" || value === "{}") {
      return "Vazio";
    }

    return value;
  };

  // Função para formatar valor para exibição no tooltip
  const formatValueForDisplay = (value: string | null) => {
    if (!value || value === "—") return value;

    // Se for JSON, tenta formatar
    if (value.startsWith("{") && value.endsWith("}")) {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }

    return value;
  };

  // Função para renderizar valor com tooltip
  const renderValueWithTooltip = (
    value: string | null,
    maxLength: number = 50
  ) => {
    if (!value || value === "—") {
      return <span className="text-gray-400">—</span>;
    }

    // Formata o valor para exibição amigável
    const userFriendlyValue = formatValueForUser(value);
    const truncatedValue = truncateValue(userFriendlyValue, maxLength);
    const isTruncated = userFriendlyValue.length > maxLength;
    const formattedValue = formatValueForDisplay(value);

    if (!isTruncated) {
      return <span className="text-gray-600">{userFriendlyValue}</span>;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-gray-600 cursor-help hover:text-gray-800 transition-colors">
            {truncatedValue}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-lg p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50"
        >
          <div className="break-words whitespace-pre-wrap font-mono">
            {formattedValue}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Função para obter ícone baseado na ação
  const getActionIcon = (acao: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      EMPRESA_ATUALIZADA: <Edit className="h-3 w-3" />,
      PLANO_ASSIGNADO: <CreditCard className="h-3 w-3" />,
      BLOQUEIO_APLICADO: <Shield className="h-3 w-3" />,
      BLOQUEIO_REVOGADO: <Shield className="h-3 w-3" />,
    };
    return iconMap[acao] || <User className="h-3 w-3" />;
  };

  // Função para obter label da ação
  const getActionLabel = (acao: string) => {
    return formatActionName(acao);
  };

  // Função para obter cores neutras e pastéis para as ações
  const getActionBadgeColors = (acao: string) => {
    const colorMap: Record<string, string> = {
      EMPRESA_ATUALIZADA: "bg-blue-50 text-blue-700 border-blue-200",
      PLANO_ASSIGNADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
      BLOQUEIO_APLICADO: "bg-rose-50 text-rose-700 border-rose-200",
      BLOQUEIO_REVOGADO: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colorMap[acao] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const renderAction = (acao: string) => {
    const icon = getActionIcon(acao);
    const label = getActionLabel(acao);
    const colorClass = getActionBadgeColors(acao);

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium",
          colorClass
        )}
      >
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  // Função para obter ícone da role
  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      ADMIN: <Crown className="h-3 w-3" />,
      MODERADOR: <Users className="h-3 w-3" />,
      EDITOR: <PenTool className="h-3 w-3" />,
      VIEWER: <Eye className="h-3 w-3" />,
    };
    return iconMap[role] || <User className="h-3 w-3" />;
  };

  // Função para renderizar badge da role
  const getRoleBadge = (role: string) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200/50">
        {getRoleIcon(role)}
        {role}
      </span>
    );
  };

  const renderTableContent = () => {
    if (paginatedData.length === 0) {
      return (
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de histórico"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros de auditoria para esta empresa com os filtros aplicados."
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
                Campo
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Valor Anterior
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Valor Novo
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
                      {getRoleBadge(item.alteradoPor.role)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {renderAction(item.acao)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {renderValueWithTooltip(
                    item.campo ? formatFieldName(item.campo) : null,
                    30
                  )}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {renderValueWithTooltip(item.valorAnterior, 50)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {item.acao === "BLOQUEIO_APLICADO" ||
                  item.acao === "BLOQUEIO_REVOGADO" ||
                  item.acao === "PLANO_ASSIGNADO" ||
                  item.acao === "PLANO_ATUALIZADO"
                    ? renderValueWithTooltip(
                        item.metadata ? formatJsonForUser(item.metadata) : "—",
                        50
                      )
                    : renderValueWithTooltip(item.valorNovo, 50)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Calcular páginas visíveis (igual ao dashboard empresas)
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

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <ButtonCustom
                variant={currentPage === totalPages ? "primary" : "outline"}
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
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
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

  // Se não há dados de auditoria, mostrar apenas o estado vazio
  if (auditoria.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de histórico"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros de auditoria para esta empresa."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      </div>
    );
  }

  // Se está carregando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton dos Filtros */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Skeleton da Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex flex-col space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-6 w-32 rounded-md" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton da Paginação */}
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros Customizados com Tamanho Maior */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
        {/* Grid de Filtros com Tamanhos Maiores */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-6">
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
              value={filters.periodo}
              onChange={(range) => handleFilterChange("periodo", range)}
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
                    onClick={() => handleFilterChange(chip.key, null)}
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
