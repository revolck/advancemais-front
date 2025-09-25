"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InputCustom } from "@/components/ui/custom/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconGrid } from "./icon-grid";
import { POPULAR_ICONS } from "../constants";
import type { IconSelectorProps, IconItem } from "../types";

export function IconSelector({
  value,
  onValueChange,
  placeholder = "Selecione um ícone",
  className,
  disabled = false,
  label,
  required = false,
}: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  // Validar se o ícone existe na lista
  const selectedIconName = useMemo(() => {
    if (!value) return null;
    const iconExists = POPULAR_ICONS.includes(value as any);
    return iconExists ? value : null;
  }, [value]);

  // Obter o componente do ícone selecionado
  const SelectedIcon = selectedIconName
    ? ((LucideIcons as any)[selectedIconName] as LucideIcon)
    : null;

  // Capturar largura do trigger dinamicamente
  useEffect(() => {
    if (!triggerRef.current) return;

    const updateWidth = () => {
      setTriggerWidth(triggerRef.current?.offsetWidth);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Filtrar ícones baseado na busca
  const filteredIcons = useMemo((): IconItem[] => {
    const searchLower = searchTerm.toLowerCase().trim();

    const iconsToShow = searchLower
      ? POPULAR_ICONS.filter((iconName) =>
          iconName.toLowerCase().includes(searchLower)
        )
      : POPULAR_ICONS;

    return iconsToShow
      .map((iconName) => {
        const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;
        return {
          name: iconName,
          component: IconComponent,
        };
      })
      .filter((icon) => icon.component);
  }, [searchTerm]);

  // Handler para seleção de ícone
  const handleSelect = useCallback(
    (iconName: string) => {
      onValueChange(iconName);
      setOpen(false);
      setSearchTerm("");
    },
    [onValueChange]
  );

  // Handler para limpar busca
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Handler para mudança de estado do popover
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  }, []);

  // Limpar busca quando fechar
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <div className="w-full">
      {/* Label posicionado acima do selector */}
      {label && (
        <Label
          className={cn(
            "block text-sm font-medium text-gray-700 mb-2",
            required && "required"
          )}
        >
          {label}
        </Label>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={
              selectedIconName
                ? `Ícone selecionado: ${selectedIconName}`
                : placeholder
            }
            disabled={disabled}
            className={cn(
              "w-full justify-between h-11 px-3 text-left font-normal",
              "border-gray-200 hover:border-gray-300 bg-transparent",
              "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-200",
              className
            )}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {SelectedIcon ? (
                <>
                  <SelectedIcon className="h-4 w-4 text-gray-600 shrink-0" />
                  <span className="text-gray-900 truncate">
                    {selectedIconName}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 truncate">{placeholder}</span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 rounded-lg border border-gray-200 shadow-lg z-[9999]"
          style={{ width: triggerWidth || "auto" }}
          align="start"
          sideOffset={5}
        >
          {/* Header com busca */}
          <div className="p-2 border-b border-gray-100">
            <InputCustom
              label=""
              placeholder="Buscar ícones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
              rightIcon={searchTerm ? "X" : undefined}
              onRightIconClick={searchTerm ? handleClearSearch : undefined}
              size="sm"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Grid de ícones */}
          <div
            className="h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onWheel={(e) => {
              e.stopPropagation();
              const target = e.currentTarget;
              target.scrollTop += e.deltaY;
            }}
          >
            <div className="p-2">
              {filteredIcons.length > 0 ? (
                <IconGrid
                  icons={filteredIcons}
                  selectedIcon={selectedIconName || ""}
                  onSelect={handleSelect}
                />
              ) : (
                <EmptyState searchTerm={searchTerm} />
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Componente para estado vazio
function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
      {searchTerm && (
        <p className="text-xs mt-1 text-gray-500 text-center">
          Não encontramos ícones para "{searchTerm}"
        </p>
      )}
    </div>
  );
}
