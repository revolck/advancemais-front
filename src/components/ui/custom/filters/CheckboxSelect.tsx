"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/radix-checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SelectOption } from "@/components/ui/custom/select";

export interface CheckboxSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (next: string[]) => void; // fired on Apply
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CheckboxSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecionar",
  className,
  size = "md",
}: CheckboxSelectProps) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<string[]>(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [contentW, setContentW] = useState<number | undefined>(undefined);

  const updateContentWidth = useCallback(() => {
    if (triggerRef.current) {
      setContentW(triggerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setTemp(value);
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open) return;
    updateContentWidth();
    const triggerEl = triggerRef.current;
    if (!triggerEl || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateContentWidth);
    observer.observe(triggerEl);

    return () => {
      observer.disconnect();
    };
  }, [open, updateContentWidth]);

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label] as const));
    return temp.map((v) => map.get(v) ?? v);
  }, [options, temp]);

  const sizeAttr = size === "sm" ? "sm" : "default";

  const apply = () => {
    onChange(temp);
    setOpen(false);
  };

  const clear = () => setTemp([]);

  const toggle = (v: string) =>
    setTemp((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              // mirror SelectTrigger visuals
              "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
            )}
            data-size={sizeAttr}
          >
            <span className="truncate text-left">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selectedLabels.length <= 2 ? (
                selectedLabels.join(", ")
              ) : (
                `${selectedLabels.length} selecionados`
              )}
            </span>
            <ChevronsUpDownIcon className="size-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] border-gray-500/20 rounded-md shadow-lg"
          style={{ width: contentW ? `${contentW}px` : undefined }}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground sticky top-0 z-10 bg-popover/80 backdrop-blur supports-[backdrop-filter]:bg-popover/60 border-b">
            {label ? `Filtrar por ${label.toLowerCase()}` : "Filtros"}
          </div>
          <div className="max-h-64 overflow-y-auto px-1 pb-2 scroll-my-1 scrollbar-thin scrollbar-thumb-gray-400/60 hover:scrollbar-thumb-gray-400/80 scrollbar-track-transparent">
            {options.map((opt) => {
              const checked = temp.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "focus:bg-accent focus:text-accent-foreground hover:bg-muted/50 relative flex w-full cursor-default items-center gap-2 rounded-md py-2 pr-3 pl-3 text-sm outline-hidden select-none mb-1 last:mb-2",
                    checked && "bg-accent/40",
                  )}
                >
                  <span className="pointer-events-none">
                    <Checkbox checked={checked} className="size-4 rounded-[6px]" />
                  </span>
                  <span className="text-sm text-foreground">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-t bg-white px-3 py-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
              Limpar
            </Button>
            <Button type="button" size="sm" onClick={apply} className="ml-auto" disabled={temp.length === 0}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CheckboxSelect;
