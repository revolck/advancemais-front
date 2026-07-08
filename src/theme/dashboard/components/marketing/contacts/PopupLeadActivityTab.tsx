"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar, Globe, Link2, MailCheck, PenTool, Shield, Tag, User } from "lucide-react";

import type { PopupLeadActivityItem } from "@/api/websites/components/popups";
import { EmptyState } from "@/components/ui/custom";
import { DatePickerRangeCustom, type DateRange } from "@/components/ui/custom/date-picker";
import { MultiSelectFilter } from "@/components/ui/custom/filters/MultiSelectFilter";
import { Label } from "@/components/ui/label";
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

const UUID_REGEX =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

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
  return `Atualizado há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
}

function sanitizeStringValue(value: string) {
  return value.replace(UUID_REGEX, "[oculto]").trim();
}

function formatFieldName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    status: "Status",
    statusLabel: "Status",
    ownerUsuarioId: "Atendimento",
    ownerNome: "Atendimento",
    ownerEmail: "Responsável",
    conteudo: "Nota",
    popupNome: "Rotina",
    origemPath: "Página de captura",
    tag: "Tag",
    payload: "Dados enviados",
    email: "E-mail",
    telefone: "Telefone",
    whatsapp: "WhatsApp",
    userAgent: "Navegador",
    ipHash: "IP hash",
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
  const labels: Record<string, string> = {
    LEAD_CAPTURADO: "Lead inscrito",
    LEAD_STATUS_ALTERADO: "Status alterado",
    LEAD_RESPONSAVEL_ALTERADO: "Atendimento alterado",
    LEAD_NOTA_CRIADA: "Nota criada",
    LEAD_NOTA_EDITADA: "Nota editada",
    LEAD_NOTA_EXCLUIDA: "Nota excluída",
  };

  return (
    labels[action] ||
    action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  );
}

function getActionIcon(acao: string) {
  const normalized = acao.toUpperCase();

  if (normalized.includes("CAPTURADO")) return <MailCheck className="h-3 w-3" />;
  if (normalized.includes("STATUS")) return <Tag className="h-3 w-3" />;
  if (normalized.includes("RESPONSAVEL")) return <User className="h-3 w-3" />;
  if (normalized.includes("NOTA")) return <PenTool className="h-3 w-3" />;
  return <Shield className="h-3 w-3" />;
}

function getActionBadgeColors(acao: string) {
  const normalized = acao.toUpperCase();

  if (normalized.includes("CAPTURADO")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (normalized.includes("STATUS")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (normalized.includes("RESPONSAVEL")) {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }
  if (normalized.includes("NOTA")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function renderAction(acao: string) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        getActionBadgeColors(acao),
      )}
    >
      {getActionIcon(acao)}
      <span>{formatActionName(acao)}</span>
    </span>
  );
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
  if (typeof value === "string") return sanitizeStringValue(value);
  if (typeof value === "number" || typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)).filter((item) => !valueIsEmpty(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entryValue]) => [key, sanitizeValue(entryValue)] as const)
        .filter(([, entryValue]) => !valueIsEmpty(entryValue)),
    );
  }

  return String(value);
}

function formatValueForUser(value: unknown): string {
  const sanitized = sanitizeValue(value);

  if (sanitized === null || sanitized === undefined || sanitized === "") {
    return "Não informado";
  }

  if (typeof sanitized === "boolean") return sanitized ? "Sim" : "Não";
  if (typeof sanitized === "number") return String(sanitized);
  if (typeof sanitized === "string") return sanitized;

  if (Array.isArray(sanitized)) {
    if (sanitized.length === 0) return "Vazio";
    return sanitized.map((item) => formatValueForUser(item)).join(", ");
  }

  if (typeof sanitized === "object") {
    const entries = Object.entries(sanitized as Record<string, unknown>);
    if (entries.length === 0) return "Sem detalhes públicos";

    return entries
      .slice(0, 4)
      .map(([key, entryValue]) => `${formatFieldName(key)}: ${formatValueForUser(entryValue)}`)
      .join(" • ");
  }

  return String(sanitized);
}

function renderValueWithTooltip(value: unknown, maxLength = 64) {
  const userFriendlyValue = formatValueForUser(value);
  const isPlaceholder =
    userFriendlyValue === "Não informado" ||
    userFriendlyValue === "Vazio" ||
    userFriendlyValue === "Sem detalhes públicos";

  if (isPlaceholder) {
    return <span className="text-gray-400">{userFriendlyValue}</span>;
  }

  const isTruncated = userFriendlyValue.length > maxLength;
  const displayValue = isTruncated
    ? `${userFriendlyValue.slice(0, maxLength)}...`
    : userFriendlyValue;

  if (!isTruncated) {
    return <span className="text-gray-600">{displayValue}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-gray-600 transition-colors hover:text-gray-800">
          {displayValue}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="z-50 max-w-md rounded-lg bg-gray-900 p-3 text-xs text-white shadow-xl"
      >
        <div className="break-words whitespace-pre-wrap">{userFriendlyValue}</div>
      </TooltipContent>
    </Tooltip>
  );
}

function getContextFieldValue(item: PopupLeadActivityItem) {
  if (item.tipo === "LEAD_CAPTURADO") {
    return "Inscrição do lead";
  }

  const previousKeys = Object.keys(item.dadosAnteriores ?? {});
  const nextKeys = Object.keys(item.dadosNovos ?? {});
  const diffKeys = [...new Set([...previousKeys, ...nextKeys])].filter(Boolean);

  if (diffKeys.length === 1) return formatFieldName(diffKeys[0]);
  if (diffKeys.length > 1) {
    return diffKeys.slice(0, 3).map(formatFieldName).join(", ");
  }

  if (item.meta?.field) {
    return formatFieldName(String(item.meta.field));
  }

  return item.titulo || formatActionName(item.tipo);
}

function renderActor(item: PopupLeadActivityItem) {
  const actorName = item.ator?.nome || item.ator?.email || "Sistema";
  const actorRole = item.ator?.roleLabel || "Sistema interno";
  const ipHash =
    typeof item.meta?.ipHash === "string"
      ? item.meta.ipHash
      : typeof item.contexto?.ipHash === "string"
        ? item.contexto.ipHash
        : null;

  return (
    <div className="text-sm">
      <div className="font-medium text-gray-900">{actorName}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <span>{actorRole}</span>
        {ipHash ? (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Globe className="h-3 w-3" />
            {ipHash}
          </span>
        ) : null}
      </div>
    </div>
  );
}

interface FilterValues {
  acao: string[];
  categoria: string[];
  alteradoPor: string[];
  periodo: DateRange;
}

export function PopupLeadActivityTab({
  activity,
  isLoading,
}: {
  activity: PopupLeadActivityItem[];
  isLoading: boolean;
}) {
  const [filters, setFilters] = useState<FilterValues>({
    acao: [],
    categoria: [],
    alteradoPor: [],
    periodo: { from: null, to: null },
  });

  const actionOptions = useMemo(
    () =>
      Array.from(new Set(activity.map((item) => item.tipo)))
        .filter(Boolean)
        .map((value) => ({
          value,
          label: formatActionName(value),
        })),
    [activity],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(activity.map((item) => String(item.categoria || ""))))
        .filter(Boolean)
        .map((value) => ({
          value,
          label:
            value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        })),
    [activity],
  );

  const actorOptions = useMemo(
    () =>
      Array.from(
        new Map(
          activity
            .map((item) => {
              const actorName = item.ator?.nome || item.ator?.email || "Sistema";
              const actorId = item.ator?.id || `system:${actorName}`;
              return [actorId, { value: actorId, label: actorName }] as const;
            }),
        ).values(),
      ),
    [activity],
  );

  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      if (filters.acao.length > 0 && !filters.acao.includes(item.tipo)) {
        return false;
      }

      const categoria = String(item.categoria || "");
      if (filters.categoria.length > 0 && !filters.categoria.includes(categoria)) {
        return false;
      }

      const actorName = item.ator?.nome || item.ator?.email || "Sistema";
      const actorId = item.ator?.id || `system:${actorName}`;
      if (filters.alteradoPor.length > 0 && !filters.alteradoPor.includes(actorId)) {
        return false;
      }

      if (filters.periodo.from || filters.periodo.to) {
        const eventDate = new Date(item.dataHora);

        if (filters.periodo.from) {
          const from = new Date(filters.periodo.from);
          from.setHours(0, 0, 0, 0);
          if (eventDate < from) return false;
        }

        if (filters.periodo.to) {
          const to = new Date(filters.periodo.to);
          to.setHours(23, 59, 59, 999);
          if (eventDate > to) return false;
        }
      }

      return true;
    });
  }, [activity, filters]);

  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string[] | DateRange) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setFilters({
      acao: [],
      categoria: [],
      alteradoPor: [],
      periodo: { from: null, to: null },
    });
  }, []);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterValues; label: string }> = [];

    if (filters.acao.length > 0) {
      chips.push({
        key: "acao",
        label: `Ação: ${filters.acao
          .map((value) => actionOptions.find((item) => item.value === value)?.label ?? value)
          .join(", ")}`,
      });
    }

    if (filters.categoria.length > 0) {
      chips.push({
        key: "categoria",
        label: `Categoria: ${filters.categoria
          .map((value) => categoryOptions.find((item) => item.value === value)?.label ?? value)
          .join(", ")}`,
      });
    }

    if (filters.alteradoPor.length > 0) {
      chips.push({
        key: "alteradoPor",
        label: `Alterado por: ${filters.alteradoPor
          .map((value) => actorOptions.find((item) => item.value === value)?.label ?? value)
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
  }, [actionOptions, actorOptions, categoryOptions, filters]);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="space-y-3 p-4">
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <EmptyState
        illustration="fileNotFound"
        title="Sem histórico disponível"
        description="As mudanças e inscrições deste contato aparecerão aqui."
      />
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
              options={actionOptions}
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
              options={categoryOptions}
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
              options={actorOptions}
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
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="cursor-pointer text-sm font-medium text-[var(--secondary-color)] hover:text-[var(--secondary-color)]/90"
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
      </div>

      {filteredActivity.length === 0 ? (
        <EmptyState
          illustration="fileNotFound"
          title="Nenhum histórico encontrado"
          description="Não encontramos registros com os filtros aplicados."
        />
      ) : (
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
              {filteredActivity.map((item) => (
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
                        <div className="font-medium text-gray-900">
                          {formatDate(item.dataHora)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatRelativeTime(item.dataHora)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">{renderActor(item)}</TableCell>
                  <TableCell className="py-4">{renderAction(item.tipo)}</TableCell>
                  <TableCell className="py-4 text-sm">
                    <div className="flex items-start gap-2">
                      {item.tipo === "LEAD_CAPTURADO" ? (
                        <Link2 className="mt-0.5 h-3.5 w-3.5 text-gray-400" />
                      ) : null}
                      {renderValueWithTooltip(getContextFieldValue(item), 40)}
                    </div>
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
      )}
    </div>
  );
}
