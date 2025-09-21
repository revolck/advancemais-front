"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Icon } from "../Icons";
import type { HorizontalTabsProps } from "./types";

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export function HorizontalTabs({
  items,
  defaultValue,
  value: controlledValue,
  onValueChange,
  headline,
  adornment,
  className,
  listClassName,
  contentClassName,
}: HorizontalTabsProps) {
  const fallbackValue = items[0]?.value ?? "";
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? controlledValue ?? fallbackValue
  );
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange]
  );

  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const activeTab = items.find((tab) => tab.value === value);

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={handleChange}
      className={cn("flex flex-col gap-8", className)}
    >
      <div className="flex flex-col gap-6">
        {(headline?.title || headline?.description || adornment) && (
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/70 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {headline?.title && (
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {headline.title}
                </h2>
              )}
              {headline?.description && (
                <p className="text-sm text-slate-600 sm:max-w-2xl">
                  {headline.description}
                </p>
              )}
            </div>
            {adornment && <div className="shrink-0">{adornment}</div>}
          </div>
        )}

        <div className="overflow-x-auto pb-1">
          <TabsPrimitive.List
            className={cn(
              "relative flex min-w-full items-center gap-2 bg-white rounded-2xl p-5 backdrop-blur-sm",
              listClassName
            )}
          >
            {items.map((item) => {
              const isActive = item.value === value;
              return (
                <TabsPrimitive.Trigger
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={cn(
                    "group relative flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "text-gray-500 hover:text-gray-900",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]/30 focus-visible:ring-offset-2",
                    isActive && "text-[var(--primary-color)]",
                    item.disabled && "pointer-events-none opacity-40"
                  )}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      className={cn(
                        "h-4 w-4 text-gray-500 hover:text-gray-900 transition-colors",
                        "group-data-[state=active]:text-[var(--primary-color)]"
                      )}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-semibold text-slate-600 group-data-[state=active]:bg-[var(--secondary-color)] group-data-[state=active]:text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="horizontal-tab-indicator"
                      className="absolute inset-0 -z-10 rounded-full border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/10 shadow-sm shadow-[var(--primary-color)]/20"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 30,
                      }}
                    />
                  )}
                </TabsPrimitive.Trigger>
              );
            })}
          </TabsPrimitive.List>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {items.map((item) => (
            <TabsPrimitive.Content
              key={item.value}
              value={item.value}
              forceMount
            >
              {value === item.value ? (
                <motion.div
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    "rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7",
                    contentClassName
                  )}
                >
                  {item.content}
                </motion.div>
              ) : null}
            </TabsPrimitive.Content>
          ))}
        </AnimatePresence>
      </div>
    </TabsPrimitive.Root>
  );
}
