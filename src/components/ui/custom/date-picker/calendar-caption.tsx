"use client";

import React, { useMemo } from "react";
import {
  useDayPicker,
  useNavigation,
  type CaptionProps,
} from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";
import { SelectCustom } from "@/components/ui/custom/select";
import type { SelectOption } from "@/components/ui/custom/select/types";

function formatMonthLabel(params: { year: number; month: number; locale: any }) {
  const { year, month, locale } = params;
  const s = format(new Date(year, month, 1), "LLLL", { locale });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCaptionLabel(params: { displayMonth: Date; locale: any }) {
  const { displayMonth, locale } = params;
  const s = format(displayMonth, "LLLL yyyy", { locale });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function resolveBoundaryDate(params: {
  fromDate?: Date;
  toDate?: Date;
  fromMonth?: Date;
  toMonth?: Date;
  fromYear?: number;
  toYear?: number;
}) {
  const { fromDate, toDate, fromMonth, toMonth, fromYear, toYear } = params;

  const nowYear = new Date().getFullYear();
  const start =
    fromDate ??
    fromMonth ??
    (typeof fromYear === "number" ? new Date(fromYear, 0, 1) : new Date(1900, 0, 1));
  const end =
    toDate ??
    toMonth ??
    (typeof toYear === "number"
      ? new Date(toYear, 11, 31)
      : new Date(nowYear + 10, 11, 31));

  return { start, end };
}

export function CalendarCaptionCustom({ displayMonth, id }: CaptionProps) {
  const { locale, classNames, styles, labels, disableNavigation, fromDate, toDate, fromMonth, toMonth, fromYear, toYear } =
    useDayPicker();
  const { goToMonth, previousMonth, nextMonth } = useNavigation();

  const { start, end } = useMemo(
    () => resolveBoundaryDate({ fromDate, toDate, fromMonth, toMonth, fromYear, toYear }),
    [fromDate, fromMonth, fromYear, toDate, toMonth, toYear]
  );

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  const yearRange = useMemo(() => {
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const from = Math.min(startYear, endYear);
    const to = Math.max(startYear, endYear);
    const out: number[] = [];
    for (let y = from; y <= to; y += 1) out.push(y);
    return out;
  }, [end, start]);

  const monthBoundsForYear = useMemo(() => {
    const minMonth = start.getFullYear() === currentYear ? start.getMonth() : 0;
    const maxMonth = end.getFullYear() === currentYear ? end.getMonth() : 11;
    return { minMonth, maxMonth };
  }, [currentYear, end, start]);

  const monthOptions = useMemo(() => {
    const { minMonth, maxMonth } = monthBoundsForYear;
    const opts: SelectOption[] = [];
    for (let m = minMonth; m <= maxMonth; m += 1) {
      opts.push({
        value: String(m),
        label: formatMonthLabel({ year: currentYear, month: m, locale }),
      });
    }
    return opts;
  }, [currentYear, locale, monthBoundsForYear]);

  const yearOptions = useMemo<SelectOption[]>(
    () => yearRange.map((y) => ({ value: String(y), label: String(y) })),
    [yearRange]
  );

  const captionLabel = useMemo(
    () => formatCaptionLabel({ displayMonth, locale }),
    [displayMonth, locale]
  );

  const handleGoToMonth = (year: number, month: number) => {
    const minMonth = start.getFullYear() === year ? start.getMonth() : 0;
    const maxMonth = end.getFullYear() === year ? end.getMonth() : 11;
    const clampedMonth = Math.min(Math.max(month, minMonth), maxMonth);
    goToMonth(new Date(year, clampedMonth, 1));
  };

  const prevAriaLabel = labels.labelPrevious(previousMonth, { locale });
  const nextAriaLabel = labels.labelNext(nextMonth, { locale });

  return (
    <div className={cn(classNames.caption)} style={styles.caption}>
      {/* a11y label for the month table */}
      <span id={id} className="sr-only">
        {captionLabel}
      </span>

      <div className="flex w-full items-center justify-between gap-2">
        <ButtonCustom
          variant="outline"
          size="icon"
          withAnimation={false}
          icon="ChevronLeft"
          className="size-10 p-0 shrink-0"
          disabled={disableNavigation || !previousMonth}
          aria-label={prevAriaLabel}
          onClick={() => {
            if (!previousMonth) return;
            goToMonth(previousMonth);
          }}
        >
          <span className="sr-only">{prevAriaLabel}</span>
        </ButtonCustom>

        <div className="flex flex-1 min-w-0 items-center justify-center gap-2">
          <div className="flex-1 min-w-0 max-w-[160px]">
            <SelectCustom
              mode="single"
              searchable={false}
              value={String(currentMonth)}
              onChange={(v) => {
                if (disableNavigation) return;
                const m = Number(v);
                if (!Number.isFinite(m)) return;
                handleGoToMonth(currentYear, m);
              }}
              options={monthOptions}
              placeholder="Mês"
              size="sm"
              fullWidth
              className="w-full"
              disabled={disableNavigation}
            />
          </div>

          <div className="w-[104px] shrink-0">
            <SelectCustom
              mode="single"
              searchable
              value={String(currentYear)}
              onChange={(v) => {
                if (disableNavigation) return;
                const y = Number(v);
                if (!Number.isFinite(y)) return;
                handleGoToMonth(y, currentMonth);
              }}
              options={yearOptions}
              placeholder="Ano"
              size="sm"
              fullWidth
              className="w-full"
              disabled={disableNavigation}
            />
          </div>
        </div>

        <ButtonCustom
          variant="outline"
          size="icon"
          withAnimation={false}
          icon="ChevronRight"
          className="size-10 p-0 shrink-0"
          disabled={disableNavigation || !nextMonth}
          aria-label={nextAriaLabel}
          onClick={() => {
            if (!nextMonth) return;
            goToMonth(nextMonth);
          }}
        >
          <span className="sr-only">{nextAriaLabel}</span>
        </ButtonCustom>
      </div>
    </div>
  );
}
