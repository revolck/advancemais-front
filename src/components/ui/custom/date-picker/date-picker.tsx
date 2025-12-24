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
import { CalendarCaptionCustom } from "./calendar-caption";
import { ButtonCustom } from "@/components/ui/custom/button";

export interface DatePickerCustomProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  /** Controla se o calendário exibe dias de outros meses. */
  showOutsideDays?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /**
   * Controle de faixa de anos no seletor (dropdown).
   * - `old`: prioriza anos anteriores (até o ano atual, por padrão)
   * - `new`: prioriza anos posteriores (a partir do ano atual, por padrão)
   * - `default`: permite ambos (1900 → ano atual + 10, por padrão)
   */
  years?: "old" | "new" | "default";
  error?: string;
  helperText?: string;
  className?: string;
  clearable?: boolean;
  format?: string; // date-fns format string for display
  locale?: Locale;
}

function resolveYearBounds(params: {
  years: "old" | "new" | "default";
  minDate?: Date;
  maxDate?: Date;
}): { fromYear: number; toYear: number } {
  const { years, minDate, maxDate } = params;
  const nowYear = new Date().getFullYear();

  const minYear = minDate ? minDate.getFullYear() : undefined;
  const maxYear = maxDate ? maxDate.getFullYear() : undefined;

  let fromYear = minYear ?? 1900;
  let toYear = maxYear ?? nowYear + 10;

  if (years === "old") {
    if (!maxYear) toYear = nowYear;
  }
  if (years === "new") {
    if (!minYear) fromYear = nowYear;
  }

  return {
    fromYear: Math.min(fromYear, toYear),
    toYear: Math.max(fromYear, toYear),
  };
}

export function DatePickerCustom({
  label,
  value,
  onChange,
  placeholder = "Selecionar data",
  disabled,
  required,
  size = "md",
  showOutsideDays = false,
  minDate,
  maxDate,
  years = "default",
  error,
  helperText,
  className,
  clearable = true,
  format = "d 'de' MMMM 'de' yyyy",
  locale = ptBR,
}: DatePickerCustomProps) {
  const [open, setOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const yearBounds = useMemo(
    () => resolveYearBounds({ years, minDate, maxDate }),
    [maxDate, minDate, years]
  );

  const displayValue = useMemo(() => {
    if (!value) return "";
    try {
      const formatted = formatDate(value, format, { locale });
      // Capitalize first letter (pt-BR months default to lowercase)
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return value.toLocaleDateString();
    }
  }, [value, format, locale]);

  const canSetToday = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (minDate) {
      const minStart = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (todayStart < minStart) return false;
    }
    if (maxDate) {
      const maxStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (todayStart > maxStart) return false;
    }
    return true;
  }, [maxDate, minDate]);

  // Update trigger width when component mounts or when open state changes
  React.useEffect(() => {
    if (triggerRef.current && open) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

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
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 items-center rounded-md border bg-transparent px-3 py-0 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
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
            {value && clearable && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                    className={cn(
                      "mr-1 flex items-center justify-center rounded-md border border-transparent text-foreground/90 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70 cursor-pointer",
                      size === "sm"
                        ? "w-5 h-5"
                        : size === "lg"
                        ? "w-7 h-7"
                        : "w-6 h-6"
                    )}
                    aria-label="Limpar data"
                  >
                    <X
                      width={10}
                      height={10}
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Limpar</TooltipContent>
              </Tooltip>
            )}
            <CalendarIcon className="ml-1 size-4 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[120] rounded-lg border border-gray-200 bg-white p-0 shadow-xl"
          style={{
            width:
              triggerWidth > 0 ? `${Math.max(triggerWidth, 400)}px` : "400px",
            maxWidth: "520px",
          }}
          align="start"
        >
          <Calendar
            mode="single"
            selected={value ?? undefined}
            defaultMonth={value || minDate || new Date()}
            onSelect={(date) => {
              onChange(date ?? null);
              setOpen(false);
            }}
            initialFocus
            showOutsideDays={showOutsideDays}
            numberOfMonths={1}
            captionLayout="buttons"
            fromYear={yearBounds.fromYear}
            toYear={yearBounds.toYear}
            fromDate={minDate}
            toDate={maxDate}
            components={{ Caption: CalendarCaptionCustom }}
            // Desabilita seleção fora do intervalo permitido
            disabled={[
              ...(minDate
                ? [
                    {
                      before: new Date(
                        new Date(minDate).setHours(0, 0, 0, 0)
                      ),
                    } as any,
                  ]
                : []),
              ...(maxDate
                ? [
                    {
                      after: new Date(
                        new Date(maxDate).setHours(23, 59, 59, 999)
                      ),
                    } as any,
                  ]
                : []),
            ]}
            locale={locale}
            classNames={{
              caption: "px-2 pt-2",
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-3 py-2">
            <ButtonCustom
              variant="outline"
              size="sm"
              withAnimation={false}
              disabled={!canSetToday || disabled}
              onClick={() => {
                if (!canSetToday) return;
                const t = new Date();
                const todayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate());
                onChange(todayStart);
                setOpen(false);
              }}
            >
              Hoje
            </ButtonCustom>
            {clearable && value && (
              <ButtonCustom
                variant="outline"
                size="sm"
                withAnimation={false}
                onClick={() => onChange(null)}
              >
                Limpar
              </ButtonCustom>
            )}
          </div>
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

export default DatePickerCustom;
