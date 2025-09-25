"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { IconGridProps } from "../types";

export const IconGrid = memo(function IconGrid({
  icons,
  selectedIcon,
  onSelect,
}: IconGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1 p-2">
      {icons.map(({ name, component: IconComponent }) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={cn(
            "relative flex items-center justify-center p-2 rounded-md transition-all duration-150",
            "hover:scale-105 aspect-square cursor-pointer",
            selectedIcon === name
              ? "bg-gray-900 text-white shadow-sm ring-1 ring-gray-900"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          )}
          title={name}
          aria-label={`Select ${name} icon`}
          type="button"
        >
          <IconComponent className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
});
