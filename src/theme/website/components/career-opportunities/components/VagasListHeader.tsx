"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SelectOption } from "@/components/ui/custom/select";
import { cn } from "@/lib/utils";

interface VagasListHeaderProps {
  totalCount: number;
  sortOrder: string;
  onSortChange: (value: string) => void;
  sortOptions: ReadonlyArray<SelectOption>;
}

export function VagasListHeader({
  totalCount,
  sortOrder,
  onSortChange,
  sortOptions,
}: VagasListHeaderProps) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    return (
      sortOptions.find((option) => option.value === sortOrder)?.label ??
      "Ordenar"
    );
  }, [sortOptions, sortOrder]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="!mb-0">Vagas disponíveis</h3>
        <p className="!text-sm ml-1 mt-1">
          {totalCount} oportunidades encontradas
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Ordenar por:</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex w-48 items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium transition hover:border-gray-300 focus-visible:outline-none cursor-pointer"
            >
              <span className="truncate text-left">{currentLabel}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  open && "rotate-180"
                )}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 rounded-2xl border border-gray-100 p-2 bg-white"
            align="end"
          >
            <div className="flex flex-col">
              {sortOptions.map((option) => {
                const isActive = option.value === sortOrder;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#1f8454]/10 text-[#1f8454]"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span>{option.label}</span>
                    {isActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
