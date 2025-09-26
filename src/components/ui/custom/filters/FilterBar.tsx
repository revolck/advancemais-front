"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { InputCustom } from "@/components/ui/custom/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { SelectCustom } from "@/components/ui/custom/select";
import { MultiSelectFilter } from "./MultiSelectFilter";
import type { FilterBarProps, FilterField } from "./types";

function valueIsEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.length === 0;
  return false;
}

function findLabel(field: FilterField, value: string | null): string | null {
  if (!value) return null;
  const found = field.options.find((o) => o.value === value);
  return found?.label ?? value;
}

export function FilterBar({
  className,
  fields,
  values,
  onChange,
  search,
  rightActions,
}: FilterBarProps) {
  const activeChips = useMemo(() => {
    return fields
      .map((f) => ({
        field: f,
        value: values[f.key] as string | string[] | null | undefined,
      }))
      .filter(({ value }) => !valueIsEmpty(value))
      .map(({ field, value }) => {
        const mode = field.mode ?? "single";
        if (mode === "multiple") {
          const arr = (value as string[]).map((v) => findLabel(field, v) ?? v);
          return { key: field.key, label: `${field.label}: ${arr.join(", ")}` };
        }
        const label = findLabel(field, (value as string) ?? null);
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_auto] lg:items-end lg:gap-3 xl:gap-4">
        {search && (
          <div className="min-w-0">
            <div className="relative">
              <InputCustom
                label={search.label || ""}
                placeholder={search.placeholder || "Buscar..."}
                value={search.value}
                onChange={(e) =>
                  search.onChange((e.target as HTMLInputElement).value)
                }
                onKeyDown={search.onKeyDown}
              />
            </div>
          </div>
        )}

        {fields.map((field) => {
          const mode = field.mode ?? "single";
          const commonProps = {
            key: field.key,
            label: field.label,
            options: field.options,
            placeholder: field.placeholder ?? "Selecionar",
            className: "w-full",
          } as const;

          if (mode === "multiple") {
            return (
              <div key={field.key} className="min-w-0">
                {field.label && (
                  <Label className="text-sm font-medium mb-1 block">
                    {field.label}
                  </Label>
                )}
                <MultiSelectFilter
                  title={field.label}
                  placeholder={field.placeholder ?? "Selecionar..."}
                  options={field.options}
                  selectedValues={(values[field.key] as string[]) || []}
                  onSelectionChange={(val) => onChange(field.key, val)}
                  showApplyButton
                  className="w-full"
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="min-w-0">
              {field.label && (
                <Label className="text-sm font-medium mb-1 block">
                  {field.label}
                </Label>
              )}
              <SelectCustom
                {...commonProps}
                value={(values[field.key] as string | null) ?? null}
                onChange={(val) => onChange(field.key, val)}
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
