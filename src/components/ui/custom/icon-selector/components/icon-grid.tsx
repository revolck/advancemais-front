"use client";

import React, { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { IconGridProps } from "../types";

// Componente individual de ícone memoizado
const IconButton = memo(function IconButton({
  name,
  IconComponent,
  isSelected,
  onSelect,
}: {
  name: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  onSelect: (name: string) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(name);
  }, [name, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-center p-2 rounded-md transition-all duration-150",
        "hover:scale-105 aspect-square cursor-pointer",
        isSelected
          ? "bg-gray-900 text-white shadow-sm ring-1 ring-gray-900"
          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
      )}
      title={name}
      aria-label={`Select ${name} icon`}
      type="button"
    >
      <IconComponent className="h-4 w-4" />
    </button>
  );
});

export const IconGrid = memo(function IconGrid({
  icons,
  selectedIcon,
  onSelect,
}: IconGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1 p-2">
      {icons.map(({ name, component: IconComponent }) => (
        <IconButton
          key={name}
          name={name}
          IconComponent={IconComponent}
          isSelected={selectedIcon === name}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renderizações desnecessárias
  if (prevProps.icons.length !== nextProps.icons.length) return false;
  if (prevProps.selectedIcon !== nextProps.selectedIcon) return false;
  if (prevProps.onSelect !== nextProps.onSelect) return false;
  
  // Verificar se os ícones são os mesmos
  const prevNames = prevProps.icons.map(i => i.name).join(',');
  const nextNames = nextProps.icons.map(i => i.name).join(',');
  return prevNames === nextNames;
});
