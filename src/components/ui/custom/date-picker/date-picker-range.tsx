"use client";

import React, { useMemo, useState, useRef } from "react";
import { format as formatDate } from "date-fns";
import type { Locale } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, Calendar as CalendarIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DatePickerRangeCustomProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  helperText?: string;
  className?: string;
  clearable?: boolean;
  format?: string; // date-fns format string for display
  locale?: Locale;
}

export function DatePickerRangeCustom({
  label,
  value,
  onChange,
  placeholder = "Selecionar período",
  disabled,
  required,
  size = "md",
  minDate,
  maxDate,
  error,
  helperText,
  className,
  clearable = true,
  format = "dd/MM/yyyy",
  locale = ptBR,
}: DatePickerRangeCustomProps) {
  const [open, setOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const displayValue = useMemo(() => {
    if (!value.from && !value.to) return "";

    try {
      if (value.from && value.to) {
        const fromFormatted = formatDate(value.from, format, { locale });
        const toFormatted = formatDate(value.to, format, { locale });
        return `${fromFormatted} - ${toFormatted}`;
      } else if (value.from) {
        const fromFormatted = formatDate(value.from, format, { locale });
        return `${fromFormatted} - ...`;
      } else if (value.to) {
        const toFormatted = formatDate(value.to, format, { locale });
        return `... - ${toFormatted}`;
      }
      return "";
    } catch {
      if (value.from && value.to) {
        return `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`;
      } else if (value.from) {
        return `${value.from.toLocaleDateString()} - ...`;
      } else if (value.to) {
        return `... - ${value.to.toLocaleDateString()}`;
      }
      return "";
    }
  }, [value, format, locale]);

  // Update trigger width when component mounts or when open state changes
  React.useEffect(() => {
    if (triggerRef.current && open) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Se não há data inicial, define como data inicial
    if (!value.from) {
      onChange({ from: date, to: null });
    }
    // Se há data inicial mas não há data final, define como data final
    else if (!value.to) {
      // Se a data selecionada é anterior à data inicial, troca as posições
      if (date < value.from) {
        onChange({ from: date, to: value.from });
      } else {
        onChange({ from: value.from, to: date });
      }
      setOpen(false); // Fecha o popover após selecionar o período completo
    }
    // Se há ambas as datas, redefine a data inicial
    else {
      onChange({ from: date, to: null });
    }
  };

  const handleClear = () => {
    onChange({ from: null, to: null });
  };

  const container = cn("space-y-2", className);

  return (
    <div className={container}>
      {label && (
        <Label
          className={cn(
            "text-sm font-medium",
            required && "required",
            error && "text-destructive"
          )}
        >
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 items-center rounded-md border bg-transparent px-3 py-0 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
              size === "sm" && "h-10",
              size === "md" && "h-12",
              size === "lg" && "h-14",
              error && "border-destructive"
            )}
          >
            <span
              className={cn(
                "truncate text-left flex-1",
                !displayValue && "text-muted-foreground"
              )}
            >
              {displayValue || placeholder}
            </span>
            {displayValue && clearable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className={cn(
                      "mr-1 flex items-center justify-center rounded-md border border-transparent text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 cursor-pointer",
                      size === "sm"
                        ? "w-5 h-5"
                        : size === "lg"
                        ? "w-7 h-7"
                        : "w-6 h-6"
                    )}
                    aria-label="Limpar período"
                  >
                    <X
                      width={10}
                      height={10}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Limpar período</TooltipContent>
              </Tooltip>
            )}
            <CalendarIcon className="ml-1 size-4 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[120] rounded-lg border border-gray-200 bg-white p-0 shadow-xl"
          style={{
            width: triggerWidth > 0 ? `${triggerWidth}px` : undefined,
          }}
          align="start"
        >
          <Calendar
            mode="range"
            selected={{
              from: value.from || undefined,
              to: value.to || undefined,
            }}
            onSelect={(range) => {
              if (range?.from) {
                if (range?.to) {
                  // Range completo selecionado
                  onChange({ from: range.from, to: range.to });
                  setOpen(false);
                } else {
                  // Apenas data inicial selecionada
                  handleDateSelect(range.from);
                }
              }
            }}
            fromDate={minDate}
            toDate={maxDate}
            disabled={disabled}
            locale={locale}
            className="w-full"
          />
        </PopoverContent>
      </Popover>

      {error ? (
        <p className="text-[11px] leading-4 text-destructive/90">{error}</p>
      ) : helperText ? (
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gray-500/10 bg-muted/40 px-2 py-1 text-[11px] leading-4 text-muted-foreground/85">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="opacity-70"
          >
            <path fill="currentColor" d="M11 7h2v2h-2zM11 11h2v6h-2z" />
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16"
            />
          </svg>
          <span className="truncate">{helperText}</span>
        </span>
      ) : null}
    </div>
  );
}

export default DatePickerRangeCustom;
