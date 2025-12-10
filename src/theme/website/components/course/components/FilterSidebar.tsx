"use client";

import React from "react";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseFilters } from "../types";

interface FilterSidebarProps {
  filters: CourseFilters;
  filterCounts: {
    categorias: { nome: string; count: number }[];
  };
  onToggleFilter: (filterKey: "categorias", value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isDisabled?: boolean;
}

export function FilterSidebar({
  filters,
  filterCounts,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  isDisabled = false,
}: FilterSidebarProps) {
  const renderCategoriaGroup = () => (
    <div className="space-y-4">
      <p className="!text-[10px] !font-semibold !uppercase !text-gray-500 tracking-wide !mb-0">
        Categoria
      </p>
      <div className="space-y-1">
        {filterCounts.categorias.map((item) => {
          const isActive = filters.categorias.includes(item.nome);
          const isOptionDisabled =
            (!isActive && item.count === 0) || (isDisabled && !isActive);
          return (
            <label
              key={item.nome}
              htmlFor={`categoria-${item.nome}`}
              className={cn(
                "flex items-center rounded-2xl py-1 transition gap-3",
                isOptionDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer",
              )}
            >
              <Checkbox
                id={`categoria-${item.nome}`}
                checked={isActive}
                disabled={isOptionDisabled}
                onCheckedChange={() => {
                  if (isOptionDisabled) return;
                  onToggleFilter("categorias", item.nome);
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
        "bg-white rounded-2xl p-6 border border-gray-100 space-y-1 lg:w-[320px]",
        isDisabled && "opacity-70",
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

      {renderCategoriaGroup()}
    </div>
  );
}
