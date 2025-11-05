import { useState } from "react";

export interface BuilderState {
  dragId: string | null;
  hoverModuleId: string | null;
  isDragging: boolean;
  activeDragKind: "module" | "item" | null;
  activeDragId: string | null;
  showModuleDates: Record<string, boolean>;
  showItemDates: Record<string, boolean>;
  insertIndex: number | null;
  selected:
    | { kind: "module"; id: string }
    | { kind: "item"; id: string }
    | null;
  isPanelOpen: boolean;
  lastModuleId: string | null;
  confirmDelete:
    | { type: "module"; id: string }
    | { type: "item"; id: string }
    | null;
  collapsedModules: Record<string, boolean>;
}

/**
 * Hook customizado para gerenciar todo o estado do BuilderManager
 * Facilita testes e reutilização da lógica
 */
export function useBuilderState() {
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverModuleId, setHoverModuleId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragKind, setActiveDragKind] = useState<
    "module" | "item" | null
  >(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showModuleDates, setShowModuleDates] = useState<
    Record<string, boolean>
  >({});
  const [showItemDates, setShowItemDates] = useState<Record<string, boolean>>(
    {}
  );
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<
    { kind: "module"; id: string } | { kind: "item"; id: string } | null
  >(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [lastModuleId, setLastModuleId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<
    { type: "module"; id: string } | { type: "item"; id: string } | null
  >(null);
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});

  const toggleModuleCollapsed = (modId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  return {
    // Estado
    dragId,
    hoverModuleId,
    isDragging,
    activeDragKind,
    activeDragId,
    showModuleDates,
    showItemDates,
    insertIndex,
    selected,
    isPanelOpen,
    lastModuleId,
    confirmDelete,
    collapsedModules,
    // Setters
    setDragId,
    setHoverModuleId,
    setIsDragging,
    setActiveDragKind,
    setActiveDragId,
    setShowModuleDates,
    setShowItemDates,
    setInsertIndex,
    setSelected,
    setIsPanelOpen,
    setLastModuleId,
    setConfirmDelete,
    setCollapsedModules,
    // Actions
    toggleModuleCollapsed,
  };
}
