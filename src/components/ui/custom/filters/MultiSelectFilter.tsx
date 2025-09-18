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
  onApply?: () => void;
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
  // Largura fixa via classes para evitar medir e causar loops do Popper

  React.useEffect(() => {
    if (!isOpen) return;
    // Sincroniza seleção TEMPORÁRIA apenas quando o menu abre
    setTemp((prev) => {
      const sameLen = prev.length === selectedValues.length;
      const sameAll = sameLen && prev.every((v, i) => v === selectedValues[i]);
      return sameAll ? prev : selectedValues;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const apply = () => {
    if (showApplyButton) onSelectionChange(temp);
    onApply?.();
    setIsOpen(false);
  };

  const checkboxId = (v: string) =>
    `${title.replace(/\s+/g, "-").toLowerCase()}-${v}`;

  return (
    <div className={cn("w-full md:max-w-xs", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between h-12 px-4 py-2.5",
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input",
              "bg-transparent rounded-md border",
              "text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-12 focus:border-blue-400 focus:ring-1 focus:ring-blue-300",
              "text-foreground font-medium text-sm",
              "shadow-none hover:shadow-sm",
              selectedValues.length > 0 && "border-blue-600/30"
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
            "p-0 w-full md:w-[360px] lg:w-[400px]",
            "bg-popover border-border/60 rounded-[10px] shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          align="start"
          sideOffset={8}
        >
          <div className="p-4">
            <div className="text-sm font-semibold text-foreground mb-3 px-1">
              {title}
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
                      "hover:bg-accent/50 rounded-lg transition-all duration-200",
                      "cursor-pointer group",
                      checked && "bg-blue-50/50"
                    )}
                    onClick={() => toggle(opt.value)}
                  >
                    <CheckboxCustom
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
