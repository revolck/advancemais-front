"use client";

import { Button } from "@/components/ui/button";
import { SelectCustom } from "@/components/ui/custom/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getDay, getDaysInMonth, isToday, isWithinInterval } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type ReactNode, createContext, useContext } from "react";
import { create } from "zustand";

export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
  setMonth: (month: CalendarState["month"]) => void;
  setYear: (year: CalendarState["year"]) => void;
};

export const useCalendar = create<CalendarState>((set) => ({
  month: new Date().getMonth() as CalendarState["month"],
  year: new Date().getFullYear(),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
}));

type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
  locale: "pt-BR",
  startDay: 0,
});

export type CalendarStatus = {
  id: string;
  name: string;
  color: string;
};

export type CalendarFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: CalendarStatus;
};

export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions["month"] = "long",
) => {
  const formatter = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...new Array(12).keys()].map((month) => formatter(new Date(Date.UTC(2021, month % 12))));
};

export const daysForLocale = (locale: Intl.LocalesArgument, startDay: number) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < 7; i++) {
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: "short" }).format(baseDate));
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

type OutOfBoundsDayProps = {
  day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="grid h-full w-full grid-rows-[auto,1fr,auto] gap-2 px-3 py-2 text-xs text-muted-foreground/50">
    <div className="flex justify-end">
      <span className="flex size-7 items-center justify-center text-sm font-medium text-muted-foreground/60">{day}</span>
    </div>
    <div />
    <span />
  </div>
);

export type CalendarBodyProps = {
  features: CalendarFeature[];
  children: (props: { feature: CalendarFeature }) => ReactNode;
};

export const CalendarBody = ({ features, children }: CalendarBodyProps) => {
  const { month, year } = useCalendar();
  const { startDay } = useContext(CalendarContext);
  const daysInMonth = getDaysInMonth(new Date(year, month, 1));
  const firstDay = (getDay(new Date(year, month, 1)) - startDay + 7) % 7;
  const days: ReactNode[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
  const prevMonthDaysArray = Array.from({ length: prevMonthDays }, (_, index) => index + 1);

  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDaysArray[prevMonthDays - firstDay + i];
    if (day) {
      days.push(<OutOfBoundsDay key={`prev-${i}`} day={day} />);
    }
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const featuresForDay = features.filter((feature) =>
      isWithinInterval(date, { start: feature.startAt, end: feature.endAt }),
    );

    days.push(
      <div
        key={day}
        className="grid h-full w-full grid-rows-[auto,1fr,auto] gap-2 px-3 py-2 text-xs text-gray-500"
      >
        <div className="flex justify-end">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-sm font-medium text-gray-600",
              isToday(date) && "bg-[var(--secondary-color)] text-white",
            )}
          >
            {day}
          </span>
        </div>
        <div className="space-y-2 overflow-hidden text-muted-foreground">
          {featuresForDay.slice(0, 4).map((feature) => children({ feature }))}
        </div>
        {featuresForDay.length > 4 && (
          <span className="block text-[11px] text-muted-foreground/80">+{featuresForDay.length - 4} mais</span>
        )}
      </div>,
    );
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
  const nextMonthDaysArray = Array.from({ length: nextMonthDays }, (_, index) => index + 1);
  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);

  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthDaysArray[i];
      if (day) {
        days.push(<OutOfBoundsDay key={`next-${i}`} day={day} />);
      }
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 auto-rows-[148px] overflow-hidden border border-gray-200 border-t-0 bg-white">
        {days.map((day, index) => (
          <div
            key={index}
            className={cn(
              "border-b border-r border-gray-200 bg-white",
              index % 7 === 6 && "border-r-0",
            )}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};

export const CalendarDatePicker = ({ className, children }: CalendarDatePickerProps) => (
  <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
  className?: string;
  labels?: {
    placeholder?: string;
  };
};

export const CalendarMonthPicker = ({ className, labels }: CalendarMonthPickerProps) => {
  const { month, setMonth } = useCalendar();
  const { locale } = useContext(CalendarContext);

  return (
    <SelectCustom
      size="sm"
      fullWidth={false}
      className={cn("w-[170px]", className)}
      placeholder={labels?.placeholder ?? "Selecionar mês"}
      options={monthsForLocale(locale, "long").map((monthName, index) => ({
        value: index.toString(),
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      }))}
      value={month.toString()}
      onChange={(value) => {
        if (!value) return;
        setMonth(Number.parseInt(value, 10) as CalendarState["month"]);
      }}
    />
  );
};

export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
  labels?: {
    placeholder?: string;
  };
};

export const CalendarYearPicker = ({ className, start, end, labels }: CalendarYearPickerProps) => {
  const { year, setYear } = useCalendar();

  return (
    <SelectCustom
      size="sm"
      fullWidth={false}
      className={cn("w-[130px]", className)}
      placeholder={labels?.placeholder ?? "Selecionar ano"}
      options={Array.from({ length: end - start + 1 }, (_, index) => ({
        value: (start + index).toString(),
        label: (start + index).toString(),
      }))}
      value={year.toString()}
      onChange={(value) => {
        if (!value) return;
        setYear(Number.parseInt(value, 10));
      }}
    />
  );
};

export type CalendarDatePaginationProps = {
  className?: string;
};

export const CalendarDatePagination = ({ className }: CalendarDatePaginationProps) => {
  const { month, year, setMonth, setYear } = useCalendar();

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState["month"]);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState["month"]);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button onClick={handlePreviousMonth} variant="outline" size="icon" aria-label="Mês anterior">
        <ChevronLeftIcon size={16} />
      </Button>
      <Button onClick={handleNextMonth} variant="outline" size="icon" aria-label="Próximo mês">
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};

export type CalendarDateProps = {
  children: ReactNode;
  className?: string;
};

export const CalendarDate = ({ children, className }: CalendarDateProps) => (
  <div className={cn("flex flex-col gap-4 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between", className)}>
    {children}
  </div>
);

export type CalendarHeaderProps = {
  className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);

  return (
    <div className={cn(className)}>
      <div className="grid grid-cols-7 border border-gray-200 border-b-0 bg-gray-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        {daysForLocale(locale, startDay).map((day, index) => (
          <div
            key={day}
            className={cn(
              "border-r border-gray-200 px-3 py-4 text-center",
              index === 6 && "border-r-0",
            )}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export type CalendarItemProps = {
  feature: CalendarFeature;
  className?: string;
};

function hexToRgba(hex: string, alpha = 0.2) {
  const parsed = hex.replace("#", "");
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CalendarItem = ({ feature, className }: CalendarItemProps) => (
  <div
    className={cn(
      "flex items-center gap-2 rounded-[6px] border border-transparent px-3 py-1.5 text-xs font-medium text-gray-700",
      className,
    )}
    style={{
      background: hexToRgba(feature.status.color, 0.12),
      borderColor: hexToRgba(feature.status.color, 0.35),
    }}
  >
    <span className="truncate leading-tight text-[12px] text-gray-800">{feature.name}</span>
  </div>
);

export type CalendarLegendProps = {
  statuses: CalendarStatus[];
  className?: string;
};

export const CalendarLegend = ({ statuses, className }: CalendarLegendProps) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-3 text-[11px] font-medium text-gray-600",
      className,
    )}
  >
    {statuses.map((status) => (
      <span key={status.id} className="inline-flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
        <span className="text-[12px] font-medium text-gray-500">{status.name}</span>
      </span>
    ))}
  </div>
);

export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
};

export const CalendarProvider = ({
  locale = "pt-BR",
  startDay = 0,
  children,
  className,
}: CalendarProviderProps) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn("relative flex min-h-[520px] flex-col bg-white", className)}>{children}</div>
  </CalendarContext.Provider>
);
