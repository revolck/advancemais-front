"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsuarioHistorico } from "@/api/usuarios";
import type {
  GetUsuarioHistoricoResponse,
  UsuarioHistoricoItem,
} from "@/api/usuarios";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import {
  DatePickerRangeCustom,
  type DateRange,
} from "@/components/ui/custom/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/config/roles";
import {
  Link2,
  Calendar,
  Crown,
  Eye,
  Globe,
  LogIn,
  LogOut,
  MailCheck,
  PenTool,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import type { HistoryTabProps } from "../types";

interface FilterValues {
  acao: string[];
  categoria: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

const ITEMS_PER_PAGE = 10;

const TYPE_LABELS: Record<string, string> = {
  USUARIO_CRIADO: "Usuário criado",
  USUARIO_ATUALIZADO: "Usuário atualizado",
  USUARIO_STATUS_ALTERADO: "Status alterado",
  USUARIO_ROLE_ALTERADA: "Role alterada",
  USUARIO_ACESSO_LIBERADO: "Acesso liberado",
  USUARIO_BLOQUEADO: "Usuário bloqueado",
  USUARIO_DESBLOQUEADO: "Usuário desbloqueado",
  USUARIO_EMAIL_LIBERADO: "Validação de e-mail liberada",
  USUARIO_EMAIL_VERIFICADO: "E-mail verificado",
  USUARIO_SENHA_RESETADA: "Senha resetada",
  USUARIO_LOGIN: "Login",
  USUARIO_LOGOUT: "Logout",
  USUARIO_ENDERECO_ATUALIZADO: "Endereço atualizado",
  USUARIO_SOCIAL_LINK_ATUALIZADO: "Rede social atualizada",
  USUARIO_AVATAR_ATUALIZADO: "Avatar atualizado",
  USUARIO_CPF_ATUALIZADO: "CPF atualizado",
  USUARIO_TELEFONE_ATUALIZADO: "Telefone atualizado",
  USUARIO_RECRUTADOR_VINCULO_EMPRESA_CRIADO: "Vínculo por empresa adicionado",
  USUARIO_RECRUTADOR_VINCULO_EMPRESA_REMOVIDO: "Vínculo por empresa removido",
  USUARIO_RECRUTADOR_VINCULO_VAGA_CRIADO: "Vínculo por vaga adicionado",
  USUARIO_RECRUTADOR_VINCULO_VAGA_REMOVIDO: "Vínculo por vaga removido",
};

const CATEGORY_LABELS: Record<string, string> = {
  CADASTRO: "Cadastro",
  PERFIL: "Perfil",
  SEGURANCA: "Segurança",
  ACESSO: "Acesso",
  STATUS: "Status",
  ADMINISTRATIVO: "Administrativo",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

function isSensitiveFieldName(fieldName: string) {
  return (
    /(^id$|Id$|Ids$|_id$|_ids$)/.test(fieldName) ||
    /(token|secret|hash|password|senha|correlation)/i.test(fieldName)
  );
}

function sanitizeStringValue(value: string) {
  const sanitized = value.replace(UUID_REGEX, "[oculto]").trim();
  return sanitized;
}

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Atualizado agora";
  if (diffInMinutes < 60) return `Atualizado em ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Atualizado em ${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `Atualizado há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `Atualizado há ${diffInMonths} mês${diffInMonths > 1 ? "es" : ""}`;
}

function formatFieldName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    emailVerificado: "E-mail verificado",
    emailVerificadoEm: "Data de verificação do e-mail",
    status: "Status",
    role: "Role",
    nomeCompleto: "Nome completo",
    email: "E-mail",
    cpf: "CPF",
    telefone: "Telefone",
    avatarUrl: "Avatar",
    descricao: "Descrição",
    socialLinks: "Redes sociais",
    enderecos: "Endereços",
    tipoVinculo: "Tipo de vínculo",
    empresaNome: "Empresa",
    empresaCodigo: "Código da empresa",
    vagaTitulo: "Vaga",
    vagaCodigo: "Código da vaga",
    origem: "Origem",
    userAgent: "Navegador",
    ip: "IP",
    motivo: "Motivo",
  };

  return (
    fieldMap[fieldName] ||
    fieldName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}

function formatActionName(action: string): string {
  return (
    TYPE_LABELS[action] ||
    action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}

function formatCategoryName(category?: string | null): string {
  if (!category) return "—";
  return CATEGORY_LABELS[category] || formatFieldName(category);
}

function getActionIcon(acao: string) {
  const normalized = acao.toUpperCase();

  if (normalized.includes("RECRUTADOR_VINCULO")) {
    return <Link2 className="h-3 w-3" />;
  }
  if (normalized.includes("LOGIN")) return <LogIn className="h-3 w-3" />;
  if (normalized.includes("LOGOUT")) return <LogOut className="h-3 w-3" />;
  if (normalized.includes("ACESSO")) return <MailCheck className="h-3 w-3" />;
  if (normalized.includes("EMAIL")) return <MailCheck className="h-3 w-3" />;
  if (normalized.includes("BLOQUE") || normalized.includes("SENHA")) {
    return <Shield className="h-3 w-3" />;
  }
  return <User className="h-3 w-3" />;
}

function getActionBadgeColors(acao: string) {
  const normalized = acao.toUpperCase();

  if (normalized.includes("RECRUTADOR_VINCULO")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (normalized.includes("LOGIN") || normalized.includes("LOGOUT")) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  }
  if (normalized.includes("ACESSO")) {
    return "bg-sky-50 text-sky-700 border-sky-200";
  }
  if (normalized.includes("EMAIL")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (normalized.includes("BLOQUE") || normalized.includes("SENHA")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (normalized.includes("STATUS") || normalized.includes("ROLE")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function renderAction(acao: string) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        getActionBadgeColors(acao)
      )}
    >
      {getActionIcon(acao)}
      <span>{formatActionName(acao)}</span>
    </span>
  );
}

function getRoleIcon(role?: string | null) {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN") return <Crown className="h-3 w-3" />;
  if (normalized === "MODERADOR") return <Users className="h-3 w-3" />;
  if (normalized === "PEDAGOGICO") return <PenTool className="h-3 w-3" />;
  if (normalized === "INSTRUTOR") return <Eye className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
}

function getActorName(item: UsuarioHistoricoItem) {
  return item.ator?.nome || "Sistema";
}

function getActorRoleLabel(item: UsuarioHistoricoItem) {
  if (item.ator?.roleLabel) return item.ator.roleLabel;
  if (item.ator?.role) return getRoleLabel(item.ator.role);
  return null;
}

function isRecrutadorVinculoItem(item: UsuarioHistoricoItem) {
  return item.tipo.toUpperCase().includes("RECRUTADOR_VINCULO");
}

function getRecrutadorVinculoResumo(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as Record<string, unknown>;
  const tipoVinculo = String(data.tipoVinculo ?? "").toUpperCase();
  const empresaNome = sanitizeStringValue(String(data.empresaNome ?? "")).trim();
  const empresaCodigo = sanitizeStringValue(String(data.empresaCodigo ?? "")).trim();
  const vagaTitulo = sanitizeStringValue(String(data.vagaTitulo ?? "")).trim();
  const vagaCodigo = sanitizeStringValue(String(data.vagaCodigo ?? "")).trim();

  if (tipoVinculo === "EMPRESA") {
    const parts = [
      empresaNome ? `Empresa: ${empresaNome}` : null,
      empresaCodigo ? `Código: ${empresaCodigo}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" • ") : null;
  }

  if (tipoVinculo === "VAGA") {
    const parts = [
      empresaNome ? `Empresa: ${empresaNome}` : null,
      vagaTitulo ? `Vaga: ${vagaTitulo}` : null,
      vagaCodigo ? `Código: ${vagaCodigo}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" • ") : null;
  }

  return null;
}

function getContextFieldValue(item: UsuarioHistoricoItem) {
  if (isRecrutadorVinculoItem(item)) {
    return item.tipo.toUpperCase().includes("_EMPRESA_")
      ? "Vínculo por empresa"
      : "Vínculo por vaga";
  }

  const previousKeys = Object.keys(item.dadosAnteriores ?? {});
  const nextKeys = Object.keys(item.dadosNovos ?? {});
  const diffKeys = [...new Set([...previousKeys, ...nextKeys])].filter(
    (key) => Boolean(key) && !isSensitiveFieldName(key)
  );

  if (diffKeys.length === 1) return formatFieldName(diffKeys[0]);
  if (diffKeys.length > 1) {
    return diffKeys.slice(0, 3).map(formatFieldName).join(", ");
  }

  if (item.meta?.motivo) return "Motivo";
  if (item.contexto?.origem) return formatFieldName(String(item.contexto.origem));
  return formatCategoryName(item.categoria);
}

function valueIsEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.length === 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length === 0;
  return false;
}

function sanitizeValue(value: unknown): unknown {
  if (value === undefined || value === null) return value;

  if (typeof value === "string") {
    return sanitizeStringValue(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item) => !valueIsEmpty(item));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isSensitiveFieldName(key))
      .map(([key, entryValue]) => [key, sanitizeValue(entryValue)] as const)
      .filter(([, entryValue]) => !valueIsEmpty(entryValue));

    return Object.fromEntries(entries);
  }

  return String(value);
}

function formatJsonForUser(obj: Record<string, unknown>): string {
  const sanitizedObject = sanitizeValue(obj) as Record<string, unknown>;
  const entries = Object.entries(sanitizedObject).filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );

  if (entries.length === 0) return "Alteração interna";

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${formatFieldName(key)}: ${formatValueForUser(value)}`)
    .join(" • ");
}

function formatValueForUser(value: unknown): string {
  const recrutadorVinculoResumo = getRecrutadorVinculoResumo(value);
  if (recrutadorVinculoResumo) {
    return recrutadorVinculoResumo;
  }

  const sanitizedValue = sanitizeValue(value);

  if (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === "") {
    return "Não informado";
  }

  if (typeof sanitizedValue === "boolean") return sanitizedValue ? "Sim" : "Não";
  if (typeof sanitizedValue === "number") return String(sanitizedValue);

  if (typeof sanitizedValue === "string") {
    return sanitizedValue;
  }

  if (Array.isArray(sanitizedValue)) {
    if (sanitizedValue.length === 0) return "Vazio";
    return sanitizedValue.map((item) => formatValueForUser(item)).join(", ");
  }

  if (typeof sanitizedValue === "object") {
    return formatJsonForUser(sanitizedValue as Record<string, unknown>);
  }

  return String(sanitizedValue);
}

function formatValueForDisplay(value: unknown): string {
  const sanitizedValue = sanitizeValue(value);

  if (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === "") {
    return "—";
  }

  if (typeof sanitizedValue === "string") return sanitizedValue;

  if (typeof sanitizedValue === "object") {
    const readable = formatValueForUser(sanitizedValue);
    return readable === "Alteração interna" ? "Sem detalhes públicos" : readable;
  }

  return String(sanitizedValue);
}

function truncateValue(value: string, maxLength = 50) {
  if (value.length <= maxLength) return value;
  return `${value.substring(0, maxLength)}...`;
}

function renderValueWithTooltip(value: unknown, maxLength = 50) {
  const userFriendlyValue = formatValueForUser(value);

  if (
    userFriendlyValue === "Não informado" ||
    userFriendlyValue === "Vazio" ||
    userFriendlyValue === "Alteração interna"
  ) {
    return <span className="text-gray-400">{userFriendlyValue}</span>;
  }

  const truncatedValue = truncateValue(userFriendlyValue, maxLength);
  const isTruncated = userFriendlyValue.length > maxLength;
  const formattedValue = formatValueForDisplay(value);

  if (!isTruncated) {
    return <span className="text-gray-600">{userFriendlyValue}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-gray-600 transition-colors hover:text-gray-800">
          {truncatedValue}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="z-50 max-w-md rounded-lg bg-gray-900 p-3 text-xs text-white shadow-xl"
      >
        <div className="break-words whitespace-pre-wrap">{formattedValue}</div>
      </TooltipContent>
    </Tooltip>
  );
}

function getRoleBadge(item: UsuarioHistoricoItem) {
  const roleLabel = getActorRoleLabel(item);
  if (!roleLabel) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200/50 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
      {getRoleIcon(item.ator?.role)}
      {roleLabel}
    </span>
  );
}

export function HistoryTab({ usuario }: HistoryTabProps) {
  const [filters, setFilters] = useState<FilterValues>({
    acao: [],
    categoria: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
      tipos: filters.acao,
      categorias: filters.categoria,
      atorId: filters.alteradoPor.length === 1 ? filters.alteradoPor[0] : undefined,
      dataInicio: filters.periodo.from?.toISOString(),
      dataFim: filters.periodo.to?.toISOString(),
    }),
    [currentPage, filters]
  );

  const { data, status, error } = useQuery<GetUsuarioHistoricoResponse, Error>({
    queryKey: [
      "usuarios",
      "historico",
      usuario.id,
      queryParams.page,
      queryParams.pageSize,
      queryParams.tipos.join(","),
      queryParams.categorias.join(","),
      queryParams.atorId ?? "",
      queryParams.dataInicio ?? "",
      queryParams.dataFim ?? "",
    ],
    queryFn: () => getUsuarioHistorico(usuario.id, queryParams),
    placeholderData: (previous) => previous,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const serverItems = useMemo(() => data?.data?.items ?? [], [data]);
  const paginatedData = useMemo(() => {
    if (filters.alteradoPor.length <= 1) return serverItems;
    return serverItems.filter((item) => filters.alteradoPor.includes(item.ator?.id ?? ""));
  }, [serverItems, filters.alteradoPor]);

  const pagination = data?.data?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const totalItems = pagination?.total ?? paginatedData.length;
  const startIndex = pagination ? (pagination.page - 1) * pagination.pageSize : 0;
  const endIndex = pagination
    ? startIndex + paginatedData.length
    : paginatedData.length;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string[] | DateRange) => {
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
      categoria: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
    setCurrentPage(1);
  }, []);

  const alteradoPorOptions = useMemo(() => {
    const actors = Array.from(
      new Map(
        serverItems
          .filter((item) => item.ator?.id && item.ator?.nome)
          .map((item) => [item.ator.id, { value: item.ator.id!, label: item.ator.nome! }])
      ).values()
    );

    return actors;
  }, [serverItems]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterValues; label: string }> = [];

    if (!valueIsEmpty(filters.acao)) {
      chips.push({
        key: "acao",
        label: `Ação: ${filters.acao
          .map((value) => TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value)
          .join(", ")}`,
      });
    }

    if (!valueIsEmpty(filters.categoria)) {
      chips.push({
        key: "categoria",
        label: `Categoria: ${filters.categoria
          .map(
            (value) => CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value
          )
          .join(", ")}`,
      });
    }

    if (!valueIsEmpty(filters.alteradoPor)) {
      chips.push({
        key: "alteradoPor",
        label: `Alterado por: ${filters.alteradoPor
          .map(
            (value) => alteradoPorOptions.find((item) => item.value === value)?.label ?? value
          )
          .join(", ")}`,
      });
    }

    if (filters.periodo.from || filters.periodo.to) {
      const fromLabel = filters.periodo.from?.toLocaleDateString("pt-BR") || "...";
      const toLabel = filters.periodo.to?.toLocaleDateString("pt-BR") || "...";
      chips.push({
        key: "periodo",
        label: `Período: ${fromLabel} - ${toLabel}`,
      });
    }

    return chips;
  }, [filters, alteradoPorOptions]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const renderTableContent = () => {
    if (paginatedData.length === 0) {
      return (
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de histórico"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros de auditoria para este usuário com os filtros aplicados."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      );
    }

    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">Data</TableHead>
              <TableHead className="font-semibold text-gray-700">Alterado por</TableHead>
              <TableHead className="font-semibold text-gray-700">Ação</TableHead>
              <TableHead className="font-semibold text-gray-700">Campo/Contexto</TableHead>
              <TableHead className="font-semibold text-gray-700">Valor anterior</TableHead>
              <TableHead className="font-semibold text-gray-700">Valor novo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                className="border-gray-100 transition-colors hover:bg-gray-50/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Calendar className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatDate(item.dataHora)}</div>
                      <div className="text-xs text-gray-500">{formatRelativeTime(item.dataHora)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{getActorName(item)}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      {getRoleBadge(item) ?? <span>Sistema interno</span>}
                      {item.contexto?.ip ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Globe className="h-3 w-3" />
                          {item.contexto.ip}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">{renderAction(item.tipo)}</TableCell>
                <TableCell className="py-4 text-sm">
                  {renderValueWithTooltip(getContextFieldValue(item), 40)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {renderValueWithTooltip(item.dadosAnteriores, 60)}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {renderValueWithTooltip(item.dadosNovos, 60)}
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
      <div className="mt-6 flex items-center justify-between px-4 py-3">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Mostrando {Math.min(startIndex + 1, totalItems)} a {Math.min(endIndex, totalItems)} de {totalItems} registros
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
              {visiblePages[0] > 2 && <span className="text-gray-400">...</span>}
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
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-3"
          >
            Próxima
          </ButtonCustom>
        </div>
      </div>
    );
  };

  if (status === "pending") {
    return (
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                    <Skeleton className="h-4 w-16 rounded" />
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
      </div>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar o histórico deste usuário."}
        </AlertDescription>
      </Alert>
    );
  }

  if ((data?.data?.items?.length ?? 0) === 0 && !filters.alteradoPor.length) {
    return (
      <div className="space-y-6">
        <EmptyState
          illustration="companyDetails"
          illustrationAlt="Ilustração de histórico"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros de auditoria para este usuário."
          maxContentWidth="sm"
          className="rounded-2xl border border-gray-200/60 bg-white p-6"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Ação</Label>
            <MultiSelectFilter
              title="Ação"
              placeholder="Selecionar ações"
              options={TYPE_OPTIONS}
              selectedValues={filters.acao}
              onSelectionChange={(val) => handleFilterChange("acao", val)}
              showApplyButton
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Categoria</Label>
            <MultiSelectFilter
              title="Categoria"
              placeholder="Selecionar categorias"
              options={CATEGORY_OPTIONS}
              selectedValues={filters.categoria}
              onSelectionChange={(val) => handleFilterChange("categoria", val)}
              showApplyButton
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Alterado por</Label>
            <MultiSelectFilter
              title="Alterado por"
              placeholder="Selecionar usuários"
              options={alteradoPorOptions}
              selectedValues={filters.alteradoPor}
              onSelectionChange={(val) => handleFilterChange("alteradoPor", val)}
              showApplyButton
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Período</Label>
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

        {activeChips.length > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={`${chip.key}-${chip.label}`}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => {
                      if (chip.key === "periodo") {
                        handleFilterChange("periodo", { from: null, to: null });
                        return;
                      }
                      handleFilterChange(chip.key, []);
                    }}
                    className="ml-1 cursor-pointer rounded-full p-0.5 text-gray-500 hover:text-gray-700"
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
        ) : null}
      </div>

      {renderTableContent()}
      {renderPagination()}
    </div>
  );
}
