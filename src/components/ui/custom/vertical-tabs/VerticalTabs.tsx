"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";
import type { VerticalTabsProps } from "./types";

/**
 * Componente de abas verticais responsivo.
 * Em telas menores é exibido um `<select>` para facilitar a navegação.
 */
export function VerticalTabs({
  items,
  defaultValue,
  className,
  listClassName,
  triggerClassName,
  selectClassName,
  contentClassName,
  onValueChange,
}: VerticalTabsProps) {
  const [value, setValue] = React.useState(
    defaultValue ?? items[0]?.value ?? ""
  );

  const handleChange = (val: string) => {
    setValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={handleChange}
      orientation="vertical"
      className={cn(
        "max-w-screen-xl mx-auto mt-4 px-4 md:px-8",
        className
      )}
    >
      <TabsPrimitive.List
        aria-label="Vertical tabs"
        className={cn(
          "hidden border-l flex-col justify-start items-start gap-y-3 text-sm sm:flex",
          listClassName
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "group outline-none px-1.5 border-l-2 border-background text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary",
              triggerClassName
            )}
          >
            <div className="py-1.5 px-3 rounded-lg duration-150 group-hover:text-primary group-hover:bg-muted font-medium">
              {item.label}
            </div>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      <div
        className={cn(
          "relative text-muted-foreground sm:hidden",
          selectClassName
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none w-5 h-5 absolute right-2 inset-y-0 my-auto"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="py-2 px-3 w-full bg-transparent appearance-none outline-none border rounded-lg shadow-sm focus:border-primary text-sm"
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.value}
          value={item.value}
          className={cn("py-6", contentClassName)}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
