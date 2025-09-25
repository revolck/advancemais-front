"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Checkbox as CheckboxCustom } from "@/components/ui/custom/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  title: string;
  placeholder?: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  showApplyButton?: boolean;
  onApply?: () => Promise<void> | void;
  className?: string;
}

export function MultiSelectFilter({
  title,
  placeholder = "Selecionar...",
  options,
  selectedValues,
  onSelectionChange,
  showApplyButton = false,
  onApply,
  className,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [temp, setTemp] = React.useState<string[]>(selectedValues);
  const [isApplying, setIsApplying] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setTemp((prev) => {
      const sameLen = prev.length === selectedValues.length;
      const sameAll = sameLen && prev.every((v, i) => v === selectedValues[i]);
      return sameAll ? prev : selectedValues;
    });
  }, [isOpen, selectedValues]);

  React.useEffect(() => {
    if (isOpen) return;
    setTemp(selectedValues);
    setIsApplying(false);
  }, [isOpen, selectedValues]);

  const toggle = (value: string) => {
    if (!showApplyButton) {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onSelectionChange(next);
      return;
    }

    setTemp((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const displayText = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const opt = options.find((o) => o.value === selectedValues[0]);
      return opt?.label ?? selectedValues[0];
    }
    return `${selectedValues.length} selecionados`;
  }, [options, placeholder, selectedValues]);

  const apply = async () => {
    if (!showApplyButton || temp.length === 0) return;

    setIsApplying(true);
    try {
      onSelectionChange(temp);
      await Promise.resolve(onApply?.());
      setIsOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClear = () => {
    if (showApplyButton) {
      if (temp.length === 0 && selectedValues.length === 0) return;
      setTemp([]);
      onSelectionChange([]);
    } else {
      if (selectedValues.length === 0) return;
      onSelectionChange([]);
    }
  };

  const checkedCount = showApplyButton ? temp.length : selectedValues.length;

  const checkboxId = (v: string) =>
    `${title.replace(/\s+/g, "-").toLowerCase()}-${v}`;

  return (
    <div className={cn("w-full", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between h-12 px-4 py-2.5",
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input",
              "bg-transparent hover:bg-gray-300/10 rounded-md border",
              "text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring/20 focus-visible:ring-ring/50 focus-visible:ring-[1px] h-12",
              "text-foreground font-medium text-sm",
              "shadow-none cursor-pointer"
            )}
          >
            <span
              className={cn(
                "truncate text-left",
                selectedValues.length === 0
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {displayText}
            </span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen && "rotate-180",
                "text-muted-foreground"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(
            "p-0 z-[9999]",
            "bg-popover border-border/60 rounded-[10px] shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          style={{
            width: "var(--radix-dropdown-menu-trigger-width)",
            minWidth: "var(--radix-dropdown-menu-trigger-width)",
          }}
          align="start"
          sideOffset={8}
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <span className="text-sm font-semibold text-foreground">
                {title}
              </span>
              <button
                type="button"
                onClick={handleClear}
                disabled={checkedCount === 0}
                className={cn(
                  "text-sm font-medium transition-colors",
                  checkedCount > 0
                    ? "text-[var(--secondary-color)] hover:text-[var(--secondary-color)]/90 cursor-pointer"
                    : "text-muted-foreground",
                  "disabled:text-muted-foreground disabled:cursor-not-allowed"
                )}
              >
                Limpar
              </button>
            </div>

            <div className="h-48 overflow-y-auto overflow-x-hidden space-y-0.5">
              {options.map((opt) => {
                const checked = (
                  showApplyButton ? temp : selectedValues
                ).includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    className={cn(
                      "flex items-center space-x-2.5 p-2 -mx-1",
                      "hover:bg-gray-200/10 rounded-lg transition-all duration-200",
                      "group"
                    )}
                  >
                    <CheckboxCustom
                      id={checkboxId(opt.value)}
                      checked={checked}
                      onCheckedChange={() => toggle(opt.value)}
                      className="size-4 rounded-[6px]"
                    />
                    <label
                      htmlFor={checkboxId(opt.value)}
                      className={cn(
                        "text-sm leading-none cursor-pointer flex-1 truncate",
                        "text-foreground group-hover:text-foreground/90",
                        "transition-colors duration-150"
                      )}
                    >
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>

            {showApplyButton && (
              <div className="mt-3 pt-3 border-t border-border/50 sticky bottom-0 bg-popover">
                <ButtonCustom
                  onClick={apply}
                  variant="primary"
                  size="md"
                  className="w-full h-10 rounded-[10px]"
                  disabled={temp.length === 0 || isApplying}
                  isLoading={isApplying}
                  loadingText="Aplicando..."
                >
                  Aplicar
                </ButtonCustom>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default MultiSelectFilter;
