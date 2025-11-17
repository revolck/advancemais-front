"use client";

import React from "react";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobFilters } from "../types";

export type FilterListKey =
  | "niveis"
  | "modalidades"
  | "tiposContrato"
  | "categorias";

interface FilterSidebarProps {
  filters: JobFilters;
  filterCounts: {
    niveis: { nome: string; count: number }[];
    modalidades: { nome: string; count: number }[];
    tiposContrato: { nome: string; count: number }[];
    categorias: { nome: string; count: number }[];
  };
  onToggleFilter: (filterKey: FilterListKey, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isDisabled?: boolean;
}

const GROUPS: { title: string; key: FilterListKey }[] = [
  { title: "Nível de experiência", key: "niveis" },
  { title: "Modalidade", key: "modalidades" },
  { title: "Tipo de contrato", key: "tiposContrato" },
  { title: "Categoria", key: "categorias" },
];

export function FilterSidebar({
  filters,
  filterCounts,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  isDisabled = false,
}: FilterSidebarProps) {
  const renderGroup = ({ title, key }: (typeof GROUPS)[number]) => (
    <div key={key} className="space-y-4">
      <p className="!text-[10px] !font-semibold !uppercase !text-gray-500 tracking-wide !mb-0">
        {title}
      </p>
      <div className="space-y-1">
        {filterCounts[key].map((item) => {
          const isActive = (filters[key] as string[]).includes(item.nome);
          // Regra: bloquear sempre as opções sem resultado (count === 0),
          // exceto quando a própria opção está ativa (para permitir desmarcar).
          const isOptionDisabled =
            (!isActive && item.count === 0) || (isDisabled && !isActive);
          return (
            <label
              key={item.nome}
              htmlFor={`${key}-${item.nome}`}
              className={cn(
                "flex items-center rounded-2xl py-1 transition gap-3",
                isOptionDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              )}
            >
                <Checkbox
                  id={`${key}-${item.nome}`}
                  checked={isActive}
                disabled={isOptionDisabled}
                onCheckedChange={() => {
                  if (isOptionDisabled) return;
                  onToggleFilter(key, item.nome);
                }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.nome}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 border border-gray-100 space-y-6 lg:w-[320px]",
        isDisabled && "opacity-70"
      )}
      aria-disabled={isDisabled}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="!text-base !font-semibold !text-gray-900 !mb-0">
            Filtros
          </h3>
          <p className="!text-xs !text-gray-500">
            {activeFilterCount > 0
              ? `${activeFilterCount} filtros ativos`
              : "Selecione as opções desejadas"}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-color)] px-4 py-1 text-xs font-semibold uppercase text-[var(--primary-color)] tracking-[0.2em] hover:bg-[var(--primary-color)] cursor-pointer hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      {GROUPS.map(renderGroup)}
    </div>
  );
}
