"use client";

import { cn } from "@/lib/utils";

interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface ChartLegendProps {
  items: LegendItem[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ChartLegend = ({
  items,
  className,
  orientation = "horizontal",
}: ChartLegendProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        orientation === "vertical" ? "flex-col items-start" : "flex-wrap",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-600">{item.label}</span>
          {item.value && (
            <span className="text-sm font-medium text-gray-900">
              {typeof item.value === "number"
                ? `R$ ${item.value.toLocaleString("pt-BR")}`
                : item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
