"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      formatters={{
        formatCaption: (month, options) => {
          const s = format(month, "LLLL yyyy", {
            locale: options?.locale ?? locale,
          });
          return s.charAt(0).toUpperCase() + s.slice(1);
        },
        formatWeekdayName: (day) => {
          const map = [
            "Dom",
            "Seg",
            "Ter",
            "Qua",
            "Qui",
            "Sex",
            "Sáb",
          ] as const;
          return map[day.getDay()];
        },
      }}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2 w-full",
        caption: "relative flex items-center justify-center w-full h-8",
        caption_label: "text-sm font-medium select-none",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "size-7 bg-transparent p-0 cursor-pointer rounded-md border border-gray-500/20 text-muted-foreground opacity-80 hover:opacity-100 hover:text-foreground transition-colors flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-1 top-1/2 -translate-y-1/2",
        nav_button_next: "absolute right-1 top-1/2 -translate-y-1/2",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell:
          "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1 text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0.5 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md flex-1",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "aspect-square w-full h-full p-0 font-normal aria-selected:opacity-100 cursor-pointer hover:bg-primary/10 hover:text-foreground flex items-center justify-center rounded-md"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-[var(--primary-color)] aria-selected:text-white",
        day_range_end:
          "day-range-end aria-selected:bg-[var(--primary-color)] aria-selected:text-white",
        day_selected:
          "bg-[var(--primary-color)] text-white hover:!bg-[var(--primary-color)] hover:!text-white focus:!bg-[var(--primary-color)] focus:!text-white",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
