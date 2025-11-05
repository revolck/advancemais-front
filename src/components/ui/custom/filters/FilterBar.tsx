"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/ui/custom/input";
import { Label } from "@/components/ui/label";
import { X, Info, AlertTriangle } from "lucide-react";
import { SelectCustom } from "@/components/ui/custom/select";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MultiSelectFilter } from "./MultiSelectFilter";
import type { FilterBarProps, FilterField } from "./types";
import type { DateRange } from "@/components/ui/custom/date-picker";

function valueIsEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.length === 0;
  if (typeof value === "object" && "from" in value && "to" in value) {
    const dateRange = value as DateRange;
    return !dateRange.from && !dateRange.to;
  }
  return false;
}

function findLabel(
  field: FilterField,
  value: string | DateRange | null
): string | null {
  if (!value) return null;
  if (typeof value === "object" && "from" in value && "to" in value) {
    const dateRange = value as DateRange;
    if (dateRange.from && dateRange.to) {
      const fromStr = dateRange.from.toLocaleDateString("pt-BR");
      const toStr = dateRange.to.toLocaleDateString("pt-BR");
      return `${fromStr} - ${toStr}`;
    } else if (dateRange.from) {
      return `Desde ${dateRange.from.toLocaleDateString("pt-BR")}`;
    } else if (dateRange.to) {
      return `Até ${dateRange.to.toLocaleDateString("pt-BR")}`;
    }
    return null;
  }
  const found = field.options?.find((o) => o.value === value);
  return found?.label ?? (value as string);
}

export function FilterBar({
  className,
  fields,
  values,
  onChange,
  search,
  rightActions,
}: FilterBarProps) {
  const searchHelperPlacement = search?.helperPlacement ?? "inline";
  const showTooltipHelper =
    !!search && searchHelperPlacement === "tooltip" && !!search.helperText;
  const showTooltipError =
    !!search && searchHelperPlacement === "tooltip" && !!search.error;

  const searchLabelContent = search ? (
    <span className="inline-flex items-center gap-1">
      <span>{search.label || ""}</span>
      {showTooltipHelper && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
              aria-label="Saiba mais sobre a busca"
            >
              <Info className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={6}
            align="start"
            className="max-w-xs text-xs leading-relaxed"
          >
            {search.helperText}
          </TooltipContent>
        </Tooltip>
      )}
      {showTooltipError && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center text-destructive transition-colors hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 focus-visible:ring-offset-1"
              aria-label={search.error ?? "Erro na busca"}
            >
              <AlertTriangle className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={6}
            align="start"
            className="max-w-xs bg-destructive text-xs font-medium leading-relaxed text-white shadow-lg"
            arrowClassName="bg-destructive fill-destructive"
          >
            {search.error}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  ) : undefined;

  const searchHelperTextProp =
    searchHelperPlacement === "inline"
      ? search?.helperText ?? undefined
      : undefined;

  const activeChips = useMemo(() => {
    return fields
      .map((f) => ({
        field: f,
        value: values[f.key] as
          | string
          | string[]
          | DateRange
          | null
          | undefined,
      }))
      .filter(({ value }) => !valueIsEmpty(value))
      .map(({ field, value }) => {
        const mode = field.mode ?? "single";
        if (mode === "multiple") {
          const arr = (value as string[]).map((v) => findLabel(field, v) ?? v);
          return { key: field.key, label: `${field.label}: ${arr.join(", ")}` };
        }
        const label = findLabel(field, (value as string | DateRange) ?? null);
        return { key: field.key, label: `${field.label}: ${label ?? "-"}` };
      });
  }, [fields, values]);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-4 md:p-5 space-y-4",
        className
      )}
    >
      <div className={cn(
        "grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] lg:items-end lg:gap-3 xl:gap-4",
        className?.includes("lg:grid-cols") ? (() => {
          const match = className.match(/lg:grid-cols-\[([^\]]+)\]/);
          if (match) {
            const gridCols = `lg:grid-cols-[${match[1]}]`;
            const rowRules = className.match(/\[&>div>\*:nth-child\(\d+\)\]:lg:row-start-\d+/g) || [];
            const colRules = className.match(/\[&>div>\*:nth-child\(\d+\)\]:lg:col-start-\d+/g) || [];
            const colEndRules = className.match(/\[&>div>\*:nth-child\(\d+\)\]:lg:col-end-\d+/g) || [];
            const colSpanRules = className.match(/\[&>div>\*:nth-child\(\d+\)\]:lg:col-span-\d+/g) || [];
            return [gridCols, ...rowRules, ...colRules, ...colEndRules, ...colSpanRules].join(" ");
          }
          return "";
        })() : ""
      )}>
        {search && (
          <div className="min-w-0">
            <div className="relative">
              <InputCustom
                label={searchLabelContent}
                placeholder={search.placeholder || "Buscar..."}
                value={search.value}
                onChange={(e) =>
                  search.onChange((e.target as HTMLInputElement).value)
                }
                onKeyDown={search.onKeyDown}
                helperText={searchHelperTextProp}
                error={search.error ?? undefined}
                forceError={Boolean(search.error)}
                showInlineError={searchHelperPlacement === "inline"}
              />
            </div>
          </div>
        )}

        {fields.map((field) => {
          const type = field.type ?? "select";
          const mode = field.mode ?? "single";

          if (type === "date-range") {
            return (
              <div key={field.key} className="min-w-0">
                {field.label && (
                  <Label className="text-sm font-medium mb-1 block">
                    {field.label}
                  </Label>
                )}
                <DatePickerRangeCustom
                  value={
                    (values[field.key] as DateRange) ?? { from: null, to: null }
                  }
                  onChange={(range) => onChange(field.key, range)}
                  placeholder={field.placeholder ?? "Selecionar período"}
                  size="md"
                  clearable
                  format="dd/MM/yyyy"
                  maxDate={new Date()}
                />
              </div>
            );
          }

          const commonProps = {
            options: field.options ?? [],
            placeholder:
              field.options && field.options.length === 0
                ? field.emptyPlaceholder ?? "Sem opções disponíveis"
                : field.placeholder ?? "Selecionar",
            className: "w-full",
          } as const;

          if (mode === "multiple") {
            const disabled =
              field.disabled || (field.options?.length ?? 0) === 0;
            return (
              <div key={field.key} className="min-w-0">
                {field.label && (
                  <Label className="text-sm font-medium mb-1 block">
                    {field.label}
                  </Label>
                )}
                <MultiSelectFilter
                  title={field.label}
                  placeholder={commonProps.placeholder}
                  options={field.options ?? []}
                  selectedValues={(values[field.key] as string[]) || []}
                  onSelectionChange={(val) => onChange(field.key, val)}
                  showApplyButton
                  className="w-full"
                  disabled={disabled}
                />
              </div>
            );
          }

          const disabled = field.disabled || (field.options?.length ?? 0) === 0;
          const fieldValue = (values[field.key] as string | null) ?? null;
          return (
            <div key={field.key} className="min-w-0">
              {field.label && (
                <Label className="text-sm font-medium mb-1 block">
                  {field.label}
                </Label>
              )}
              <SelectCustom
                {...commonProps}
                key={`${field.key}-${fieldValue ?? 'null'}`} // Força re-render quando valor muda
                value={fieldValue}
                onChange={(val) => onChange(field.key, val)}
                disabled={disabled}
              />
            </div>
          );
        })}
        {rightActions && (
          <div className="flex w-full flex-col items-stretch gap-3 md:col-span-2 md:flex-row md:justify-start xl:col-span-1 xl:flex-col xl:items-end xl:justify-end">
            {rightActions}
          </div>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => onChange(chip.key, null)}
                  className="ml-1 rounded-full p-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-label={`Limpar ${chip.key}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
