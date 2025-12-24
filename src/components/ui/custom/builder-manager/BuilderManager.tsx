"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonCustom } from "@/components/ui/custom/button";
import { InputCustom } from "@/components/ui/custom/input";
import { MultiSelectCustom } from "@/components/ui/custom/multiselect";
import { Icon } from "@/components/ui/custom/Icons";
import type {
  BuilderData,
  BuilderItem,
  BuilderModule,
  BuilderTemplate,
} from "./types";
import { getDefaultBuilder } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toastCustom } from "@/components/ui/custom";
import {
  LocalInput,
  SortableItem,
  SortableModule,
  StandaloneDroppable,
  EmptyState,
  Palette,
} from "./components";
import {
  ModuleEditorModal,
  ItemEditorModal,
  DeleteConfirmModal,
  MoveToModuleModal,
  RestoreTemplateModal,
} from "./modals";
import {
  TYPE_META,
  TYPE_ICON_CLS,
  getIconForType,
  ITEM_TYPE_STYLES,
  DRAG_OVERLAY_STYLES,
} from "./config";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface BuilderManagerProps {
  value: BuilderData;
  onChange: (val: BuilderData) => void;
  allowStandaloneItems?: boolean;
  template?: BuilderTemplate;
  instructorOptions?: Array<{ value: string; label: string }>;
  modalidade?: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
  periodMinDate?: Date;
  periodMaxDate?: Date;
}

export function BuilderManager({
  value,
  onChange,
  allowStandaloneItems = false,
  template,
  instructorOptions,
  modalidade = null,
  periodMinDate,
  periodMaxDate,
}: BuilderManagerProps) {
  const [dragId, setDragId] = useState<string | null>(null); // arraste nativo da paleta
  const [hoverModuleId, setHoverModuleId] = useState<string | null>(null); // destaque do alvo
  const [isDragging, setIsDragging] = useState(false); // arraste via dnd-kit
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
  const [insertIndex, setInsertIndex] = useState<number | null>(null); // posição para inserir módulo via paleta
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

  // Modal para selecionar módulo destino ao mover item standalone
  const [moveToModuleModal, setMoveToModuleModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemTitle: string;
  }>({ isOpen: false, itemId: null, itemTitle: "" });

  // Modal de confirmação para restaurar template
  const [confirmRestoreModal, setConfirmRestoreModal] = useState(false);

  const toggleModuleCollapsed = (modId: string) => {
    setCollapsedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Util simples de id
  function uid(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Mínimo para datetime-local: agora em horário local (YYYY-MM-DDTHH:mm)
  const nowLocal = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }, []);

  // Atalho de teclado para salvar (Cmd/Ctrl + S ou Cmd/Ctrl + Enter)
  React.useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && (e.key.toLowerCase() === "s" || e.key === "Enter")) {
        e.preventDefault();
        toastCustom.success({ description: "Alterações salvas." });
        setIsPanelOpen(false);
      }
      if (e.key === "Escape") {
        setIsPanelOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPanelOpen]);

  const rawModules = value.modules || [];
  const rawStandaloneItems = value.standaloneItems || [];
  const allowedItemTypes = React.useMemo(
    () => ["AULA", "ATIVIDADE", "PROVA"] as const,
    []
  );

  const modules = React.useMemo(
    () =>
      rawModules.map((m) => ({
        ...m,
        items: m.items.filter((it) =>
          allowedItemTypes.includes(it.type as (typeof allowedItemTypes)[number])
        ),
      })),
    [rawModules, allowedItemTypes]
  );

  const standaloneItems = React.useMemo(
    () =>
      rawStandaloneItems.filter((it) =>
        allowedItemTypes.includes(it.type as (typeof allowedItemTypes)[number])
      ),
    [rawStandaloneItems, allowedItemTypes]
  );

  // Agrupa standaloneItems por posição (afterModuleIndex)
  const groupedStandalone = React.useMemo(() => {
    const groups: Record<number, BuilderItem[]> = {};
    const ungrouped: BuilderItem[] = [];

    standaloneItems.forEach((item) => {
      if (typeof item.afterModuleIndex === "number") {
        if (!groups[item.afterModuleIndex]) {
          groups[item.afterModuleIndex] = [];
        }
        groups[item.afterModuleIndex].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    return { groups, ungrouped };
  }, [standaloneItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const handleDropModule = (targetModId: string) => {
    if (!dragId) return;
    // reorder modules by id
    const fromIndex = modules.findIndex((m) => m.id === dragId);
    const toIndex = modules.findIndex((m) => m.id === targetModId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const updated = [...modules];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange({ ...value, modules: updated });
    setDragId(null);
  };

  const handleDropItemInModule = (
    e: React.DragEvent,
    targetModId: string,
    targetIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId) return;
    // Se o usuário tentar soltar um MÓDULO dentro do conteúdo do módulo,
    // interpretamos como criar um novo módulo logo abaixo deste módulo.
    if (dragId === "palette-MODULO" || dragId.startsWith("palette-MODULO")) {
      const idx = modules.findIndex((m) => m.id === targetModId);
      const insertAt = idx >= 0 ? idx + 1 : modules.length;
      addModuleAt(insertAt);
      setDragId(null);
      setInsertIndex(null);
      return;
    }
    // Palette new item
    if (dragId.startsWith("palette-")) {
      const raw = dragId.replace("palette-", "");
      if (!["AULA", "ATIVIDADE", "PROVA"].includes(raw)) return;
      const type = raw as BuilderItem["type"];
      const newItem: BuilderItem = {
        id: uid("item"),
        title:
          type === "PROVA"
            ? "Prova"
            : type === "ATIVIDADE"
            ? "Atividade"
            : "Nova aula",
        type,
      };
      const targetModIndex = modules.findIndex((m) => m.id === targetModId);
      if (targetModIndex === -1) return;
      const tItems = [...modules[targetModIndex].items];
      const insertAt = targetIndex !== undefined ? targetIndex : tItems.length;
      tItems.splice(insertAt, 0, newItem);
      const nextModules = modules.map((m, i) =>
        i === targetModIndex ? { ...m, items: tItems } : m
      );
      onChange({ ...value, modules: nextModules });
      setDragId(null);
      return;
    }
    // item could be from a module or standalone
    let dragged: BuilderItem | null = null;
    const nextModules = modules.map((m) => {
      const idx = m.items.findIndex((i) => i.id === dragId);
      if (idx >= 0) {
        const clone = { ...m, items: [...m.items] };
        dragged = clone.items.splice(idx, 1)[0];
        return clone;
      }
      return m;
    });
    let nextStandalone = [...standaloneItems];
    if (!dragged) {
      const sIdx = nextStandalone.findIndex((i) => i.id === dragId);
      if (sIdx >= 0) dragged = nextStandalone.splice(sIdx, 1)[0];
    }
    if (!dragged) return;
    const targetModIndex = nextModules.findIndex((m) => m.id === targetModId);
    if (targetModIndex === -1) return;
    const tItems = [...nextModules[targetModIndex].items];
    const insertAt = targetIndex !== undefined ? targetIndex : tItems.length;
    tItems.splice(insertAt, 0, dragged);
    nextModules[targetModIndex] = {
      ...nextModules[targetModIndex],
      items: tItems,
    };
    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });
    setDragId(null);
  };

  const handleDropItemStandalone = (
    e: React.DragEvent,
    targetIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId) return;
    // Ignorar drops quando a origem é módulo (paleta de módulo ou arraste de módulo)
    if (dragId === "palette-MODULO" || activeDragKind === "module") {
      return;
    }
    if (dragId.startsWith("palette-")) {
      const raw = dragId.replace("palette-", "");
      if (!["AULA", "ATIVIDADE", "PROVA"].includes(raw)) return;
      const type = raw as BuilderItem["type"];
      const newItem: BuilderItem = {
        id: uid("item"),
        title:
          type === "PROVA"
            ? "Prova"
            : type === "ATIVIDADE"
            ? "Atividade"
            : "Nova aula",
        type,
        startDate: null,
        endDate: null,
        instructorId: null,
      };
      const nextStandalone = [...(standaloneItems || [])];
      const insertAt =
        targetIndex !== undefined ? targetIndex : nextStandalone.length;
      nextStandalone.splice(insertAt, 0, newItem);
      onChange({ ...value, standaloneItems: nextStandalone });
      setSelected({ kind: "item", id: newItem.id });
      setIsPanelOpen(true);
      setDragId(null);
      return;
    }
    // move from module/standalone to standalone
    let dragged: BuilderItem | null = null;
    const nextModules = modules.map((m) => {
      const idx = m.items.findIndex((i) => i.id === dragId);
      if (idx >= 0) {
        const clone = { ...m, items: [...m.items] };
        dragged = clone.items.splice(idx, 1)[0];
        return clone;
      }
      return m;
    });
    let nextStandalone = [...(standaloneItems || [])];
    const sIdx = nextStandalone.findIndex((i) => i.id === dragId);
    if (sIdx >= 0) {
      dragged = nextStandalone.splice(sIdx, 1)[0];
    }
    if (!dragged) return;
    const insertAt =
      targetIndex !== undefined ? targetIndex : nextStandalone.length;
    nextStandalone.splice(insertAt, 0, dragged);
    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });
    setDragId(null);
  };

  const addModule = () => {
    const newModule: BuilderModule = {
      id: uid("mod"),
      title: `Novo módulo`,
      items: [],
      instructorIds: [],
    };
    onChange({ ...value, modules: [...modules, newModule] });
  };
  const addModuleAt = (index: number) => {
    const newModule: BuilderModule = {
      id: uid("mod"),
      title: `Novo módulo`,
      items: [],
      instructorIds: [],
    };
    const next = [...modules];
    const i = Math.max(0, Math.min(index, next.length));
    next.splice(i, 0, newModule);
    onChange({ ...value, modules: next });
  };
  const addItemToModule = (modId: string, type: BuilderItem["type"]) => {
    const updated = modules.map((m) =>
      m.id === modId
        ? {
            ...m,
            items: [
              ...m.items,
              {
                id: uid("item"),
                title:
                  type === "PROVA"
                    ? "Prova"
                    : type === "ATIVIDADE"
                    ? "Atividade"
                    : "Nova aula",
                type,
                startDate: null,
                endDate: null,
                instructorId: null,
              },
            ],
          }
        : m
    );
    onChange({ ...value, modules: updated });
  };
  const addStandaloneItem = (type: BuilderItem["type"]) => {
    const updated = [
      ...standaloneItems,
      {
        id: uid("item"),
        title:
          type === "PROVA"
            ? "Prova"
            : type === "ATIVIDADE"
            ? "Atividade"
            : "Nova aula",
        type,
        startDate: null,
        endDate: null,
        instructorId: null,
      },
    ];
    onChange({ ...value, standaloneItems: updated });
  };

  // Ação de clique na paleta: adicionar ao último módulo usado e abrir painel
  const addToLastModuleAndEdit = (type: BuilderItem["type"]) => {
    const targetModuleId =
      lastModuleId || modules[modules.length - 1]?.id || null;
    // Se não houver módulo selecionado/existente
    if (!targetModuleId) {
      if (allowStandaloneItems) {
        // adicionar como item avulso e abrir painel
        const newItemId = uid("item");
        const nextStandalone = [
          ...standaloneItems,
          {
            id: newItemId,
            title:
              type === "PROVA"
                ? "Prova"
                : type === "ATIVIDADE"
                ? "Atividade"
                : "Nova aula",
            type,
            startDate: null,
            endDate: null,
            instructorId: null,
          },
        ];
        onChange({ ...value, standaloneItems: nextStandalone });
        // Não abre painel automaticamente — usuário pode clicar no item recém-criado
      } else {
        // não abrir painel, apenas orientar o usuário
        toastCustom.info({
          description:
            "Crie um módulo ou arraste o item para a área de estrutura.",
        });
      }
      return;
    }
    // adicionar no último módulo utilizado
    const newItemId = uid("item");
    const updated = modules.map((m) =>
      m.id === targetModuleId
        ? {
            ...m,
            items: [
              ...m.items,
              {
                id: newItemId,
                title:
                  type === "PROVA"
                    ? "Prova"
                    : type === "ATIVIDADE"
                    ? "Atividade"
                    : "Nova aula",
                type,
                startDate: null,
                endDate: null,
                instructorId: null,
              },
            ],
          }
        : m
    );
    onChange({ ...value, modules: updated });
    // Não abre painel automaticamente — usuário pode clicar no item recém-criado
  };

  const duplicateModule = (modId: string) => {
    const idx = modules.findIndex((m) => m.id === modId);
    if (idx === -1) return;
    const source = modules[idx];
    const cloned: BuilderModule = {
      id: uid("mod"),
      title: `${source.title} (cópia)`,
      items: source.items.map((it) => ({ ...it, id: uid("item") })),
    };
    const next = [...modules];
    next.splice(idx + 1, 0, cloned);
    onChange({ ...value, modules: next });
  };

  const setModuleTitle = (modId: string, title: string) => {
    onChange({
      ...value,
      modules: modules.map((m) => (m.id === modId ? { ...m, title } : m)),
    });
  };
  const setModuleDates = (
    modId: string,
    startDate: string | null,
    endDate: string | null
  ) => {
    onChange({
      ...value,
      modules: modules.map((m) =>
        m.id === modId ? { ...m, startDate, endDate } : m
      ),
    });
  };
  const setItemTitle = (itemId: string, title: string) => {
    const nextModules = modules.map((m) => ({
      ...m,
      items: m.items.map((it) => (it.id === itemId ? { ...it, title } : it)),
    }));
    const nextStandalone = standaloneItems.map((it) =>
      it.id === itemId ? { ...it, title } : it
    );
    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });
  };
  const setItemDates = (
    itemId: string,
    startDate: string | null,
    endDate: string | null
  ) => {
    const nextModules = modules.map((m) => ({
      ...m,
      items: m.items.map((it) =>
        it.id === itemId ? { ...it, startDate, endDate } : it
      ),
    }));
    const nextStandalone = standaloneItems.map((it) =>
      it.id === itemId ? { ...it, startDate, endDate } : it
    );
    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });
  };

  const removeModule = (modId: string) => {
    const idx = modules.findIndex((m) => m.id === modId);
    const prev = idx > 0 ? modules[idx - 1] : null;
    const next = idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null;

    const nextModules = modules.filter((m) => m.id !== modId);

    // Se o painel lateral estava apontando para o módulo removido ou
    // para um item que estava dentro dele, ajusta a seleção para o vizinho
    if (selected) {
      if (selected.kind === "module" && selected.id === modId) {
        const neighbor = prev ?? next;
        setSelected(neighbor ? { kind: "module", id: neighbor.id } : null);
        if (!neighbor) setIsPanelOpen(false); // fecha apenas se não houver outro módulo
      } else if (selected.kind === "item") {
        const belongedToRemoved = modules.some(
          (m) => m.id === modId && m.items.some((it) => it.id === selected.id)
        );
        if (belongedToRemoved) {
          const neighbor = prev ?? next;
          setSelected(neighbor ? { kind: "module", id: neighbor.id } : null);
          if (!neighbor) setIsPanelOpen(false);
        }
      }
    }

    onChange({ ...value, modules: nextModules });
  };
  const removeItem = (itemId: string) => {
    const nextModules = modules.map((m) => ({
      ...m,
      items: m.items.filter((it) => it.id !== itemId),
    }));
    const nextStandalone = standaloneItems.filter((it) => it.id !== itemId);

    if (selected?.kind === "item" && selected.id === itemId) {
      setSelected(null);
      setIsPanelOpen(false);
    }

    onChange({
      ...value,
      modules: nextModules,
      standaloneItems: nextStandalone,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "module") removeModule(confirmDelete.id);
    else removeItem(confirmDelete.id);
    setConfirmDelete(null);
  };

  const findItemLocation = (
    itemId: string
  ): { modIndex: number; itemIndex: number } | null => {
    for (let mi = 0; mi < modules.length; mi++) {
      const ii = modules[mi].items.findIndex((x) => x.id === itemId);
      if (ii >= 0) return { modIndex: mi, itemIndex: ii };
    }
    return null;
  };

  const duplicateItem = (itemId: string) => {
    const loc = findItemLocation(itemId);
    if (loc) {
      const { modIndex, itemIndex } = loc;
      const source = modules[modIndex].items[itemIndex];
      const copy: BuilderItem = {
        ...source,
        id: uid("item"),
        title: `${source.title} (cópia)`,
      };
      const nextModules = modules.map((m, i) =>
        i === modIndex
          ? {
              ...m,
              items: [
                ...m.items.slice(0, itemIndex + 1),
                copy,
                ...m.items.slice(itemIndex + 1),
              ],
            }
          : m
      );
      onChange({ ...value, modules: nextModules });
      setSelected({ kind: "item", id: copy.id });
      setIsPanelOpen(true);
      return;
    }
    const sIdx = standaloneItems.findIndex((i) => i.id === itemId);
    if (sIdx >= 0) {
      const source = standaloneItems[sIdx];
      const copy: BuilderItem = {
        ...source,
        id: uid("item"),
        title: `${source.title} (cópia)`,
      };
      const nextStandalone = [
        ...standaloneItems.slice(0, sIdx + 1),
        copy,
        ...standaloneItems.slice(sIdx + 1),
      ];
      onChange({ ...value, standaloneItems: nextStandalone });
      setSelected({ kind: "item", id: copy.id });
      setIsPanelOpen(true);
    }
  };

  const moveStandaloneItem = (itemId: string, direction: "up" | "down") => {
    const idx = standaloneItems.findIndex((i) => i.id === itemId);
    if (idx < 0) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= standaloneItems.length) return;
    onChange({
      ...value,
      standaloneItems: arrayMove(standaloneItems, idx, target),
    });
  };

  const moveModule = (modId: string, direction: "up" | "down") => {
    const idx = modules.findIndex((m) => m.id === modId);
    if (idx < 0) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= modules.length) return;
    const reordered = arrayMove(modules, idx, target);
    onChange({ ...value, modules: reordered });
  };

  const moveItemToModule = (itemId: string, targetModuleId: string) => {
    const loc = findItemLocation(itemId);
    if (!loc) return;
    const { modIndex, itemIndex } = loc;
    const item = modules[modIndex].items[itemIndex];
    if (modules[modIndex].id === targetModuleId) return; // nothing to do
    const nextModules = modules.map((m, i) => {
      if (i === modIndex) {
        const nextItems = [...m.items];
        nextItems.splice(itemIndex, 1);
        return { ...m, items: nextItems };
      }
      if (m.id === targetModuleId) {
        return { ...m, items: [...m.items, item] };
      }
      return m;
    });
    onChange({ ...value, modules: nextModules });
    setLastModuleId(targetModuleId);
  };

  const resetToTemplate = () => {
    if (!template) return;
    onChange(getDefaultBuilder(template));
  };

  // Contador de itens totais
  const totalItems =
    modules.reduce((acc, m) => acc + m.items.length, 0) +
    standaloneItems.length;

  return (
    <div className="space-y-4">
      {/* Contador de módulos/itens - só aparece quando há conteúdo */}
      {(modules.length > 0 || standaloneItems.length > 0) && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon name="Boxes" className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-gray-600">
                <strong className="text-gray-900">{modules.length}</strong>{" "}
                módulo{modules.length !== 1 && "s"}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="FileText" className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-gray-600">
                <strong className="text-gray-900">{totalItems}</strong> item
                {totalItems !== 1 && "s"}
              </span>
            </div>
          </div>
          {template && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setConfirmRestoreModal(true)}
                  className="text-xs cursor-pointer text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Icon name="RotateCcw" className="h-3 w-3" />
                  Restaurar template
                </button>
              </TooltipTrigger>
              <TooltipContent>Voltar ao template original</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 space-y-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId && dragId.startsWith("palette-MODULO")) {
              if (insertIndex !== null) {
                addModuleAt(insertIndex);
              } else {
                addModule();
              }
              setInsertIndex(null);
              setDragId(null);
            }
          }}
        >
          {/* gap antes do primeiro módulo */}
          {dragId?.startsWith("palette-MODULO") && modules.length > 0 && (
            <div
              className="rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs text-center"
              style={{
                borderColor:
                  insertIndex === 0
                    ? "color-mix(in srgb, var(--primary-color) 35%, white)"
                    : "color-mix(in srgb, var(--primary-color) 18%, white)",
                backgroundColor:
                  insertIndex === 0
                    ? "color-mix(in srgb, var(--primary-color) 6%, transparent)"
                    : "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                color: "color-mix(in srgb, var(--primary-color) 80%, black)",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setInsertIndex(0);
              }}
              onDrop={(e) => {
                e.preventDefault();
                addModuleAt(0);
                setInsertIndex(null);
                setDragId(null);
              }}
            >
              Solte aqui para criar um novo módulo
            </div>
          )}
          {/* DnD global para módulos e itens */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragMove={(e: any) => {
              // Auto-scroll sutil ao se aproximar do topo/rodapé da viewport
              const ev: any = e?.sensorEvent?.event;
              const y: number | undefined =
                ev?.clientY ?? ev?.touches?.[0]?.clientY;
              if (typeof y !== "number") return;
              const margin = 80; // px
              const speed = 12; // px por tick
              const h = window.innerHeight;
              if (y < margin)
                window.scrollBy({ top: -speed, behavior: "smooth" });
              else if (y > h - margin)
                window.scrollBy({ top: speed, behavior: "smooth" });
            }}
            onDragStart={({ active }) => {
              setIsDragging(true);
              const a = String(active.id);
              setActiveDragId(a);
              if (modules.some((m) => m.id === a)) {
                setActiveDragKind("module");
              } else if (
                modules.some((m) => m.items.some((it) => it.id === a)) ||
                standaloneItems.some((it) => it.id === a)
              ) {
                setActiveDragKind("item");
              } else {
                setActiveDragKind(null);
              }
            }}
            onDragCancel={() => {
              setIsDragging(false);
              setActiveDragKind(null);
              setActiveDragId(null);
            }}
            onDragEnd={({ active, over }) => {
              setIsDragging(false);
              setActiveDragId(null);

              if (!over) {
                setActiveDragKind(null);
                return;
              }
              const activeId = String(active.id);
              const overId = String(over.id);
              if (activeId === overId) return;

              // Detectar drop em zona verde (before-all-modules ou after-module-X)
              if (
                overId === "before-all-modules" &&
                activeDragKind === "item"
              ) {
                const item =
                  modules
                    .flatMap((m) => m.items)
                    .find((i) => i.id === activeId) ||
                  standaloneItems.find((i) => i.id === activeId);

                if (item) {
                  const nextModules = modules.map((m) => ({
                    ...m,
                    items: m.items.filter((i) => i.id !== activeId),
                  }));
                  const nextStandalone = standaloneItems.filter(
                    (i) => i.id !== activeId
                  );

                  onChange({
                    ...value,
                    modules: nextModules,
                    standaloneItems: [
                      ...nextStandalone,
                      { ...item, afterModuleIndex: -1 },
                    ],
                  });
                  toastCustom.success({
                    description: "Item posicionado antes de todos os módulos",
                  });
                }
                // RESET DOS ESTADOS DE DRAG
                setActiveDragKind(null);
                return;
              }

              if (
                overId.startsWith("after-module-") &&
                activeDragKind === "item"
              ) {
                const modIndex = parseInt(overId.replace("after-module-", ""));
                const item =
                  modules
                    .flatMap((m) => m.items)
                    .find((i) => i.id === activeId) ||
                  standaloneItems.find((i) => i.id === activeId);

                if (item) {
                  const nextModules = modules.map((m) => ({
                    ...m,
                    items: m.items.filter((i) => i.id !== activeId),
                  }));
                  const nextStandalone = standaloneItems.filter(
                    (i) => i.id !== activeId
                  );

                  onChange({
                    ...value,
                    modules: nextModules,
                    standaloneItems: [
                      ...nextStandalone,
                      { ...item, afterModuleIndex: modIndex },
                    ],
                  });
                  const targetMod = modules[modIndex];
                  toastCustom.success({
                    description: `Item posicionado após "${
                      targetMod?.title || `Módulo ${modIndex + 1}`
                    }"`,
                  });
                }
                // RESET DOS ESTADOS DE DRAG
                setActiveDragKind(null);
                return;
              }

              // Reordenar módulos
              if (activeDragKind === "module") {
                const ids = modules.map((m) => m.id);
                const oldIndex = ids.indexOf(activeId);
                const newIndex = ids.indexOf(overId);
                if (oldIndex >= 0 && newIndex >= 0) {
                  onChange({
                    ...value,
                    modules: arrayMove(modules, oldIndex, newIndex),
                  });
                }
                setActiveDragKind(null);
                return;
              }

              // Mover itens (entre módulos ou no mesmo)
              if (activeDragKind === "item") {
                // Se alvo é o cabeçalho de um módulo colapsado (id de módulo), inserimos no fim
                const standaloneIds = standaloneItems.map((s) => s.id);
                // Se soltou na zona "fora de módulos"
                if (overId === "standalone-dropzone") {
                  if (!allowStandaloneItems) return;
                  const from = findItemLocation(activeId);
                  if (!from) return;
                  const item = modules[from.modIndex].items[from.itemIndex];
                  const nextModules = modules.map((m, i) => {
                    if (i !== from.modIndex) return m;
                    const nextItems = [...m.items];
                    nextItems.splice(from.itemIndex, 1);
                    return { ...m, items: nextItems };
                  });
                  const nextStandalone = [...standaloneItems, item];
                  onChange({
                    ...value,
                    modules: nextModules,
                    standaloneItems: nextStandalone,
                  });
                  setActiveDragKind(null);
                  setDragId(null);
                  return;
                }
                // Reordenar/mover para lista avulsa sobre item avulso
                if (standaloneIds.includes(overId)) {
                  let dragged: BuilderItem | null = null;
                  const from = findItemLocation(activeId);
                  let nextModulesLocal = modules;
                  if (from) {
                    nextModulesLocal = modules.map((m, i) => {
                      if (i !== from.modIndex) return m;
                      const ni = [...m.items];
                      dragged = ni.splice(from.itemIndex, 1)[0];
                      return { ...m, items: ni };
                    });
                  } else {
                    const sIdx = standaloneItems.findIndex(
                      (i) => i.id === activeId
                    );
                    if (sIdx >= 0) {
                      dragged = standaloneItems[sIdx];
                    }
                  }
                  if (!dragged) return;

                  let nextStandalone = [...standaloneItems];
                  // remover caso origem seja a própria lista
                  const currentIndex = nextStandalone.findIndex(
                    (i) => i.id === activeId
                  );
                  if (currentIndex >= 0) nextStandalone.splice(currentIndex, 1);
                  const targetIndex = nextStandalone.findIndex(
                    (i) => i.id === overId
                  );
                  const insertAt =
                    targetIndex >= 0 ? targetIndex : nextStandalone.length;
                  nextStandalone.splice(insertAt, 0, dragged);

                  onChange({
                    ...value,
                    modules: nextModulesLocal,
                    standaloneItems: nextStandalone,
                  });
                  setActiveDragKind(null);
                  setDragId(null);
                  return;
                }
                // mover de módulo -> módulo OU de solto -> módulo
                let from = findItemLocation(activeId);
                let movingItem: BuilderItem | null = null;
                let nextStandaloneLocal = [...standaloneItems];
                let nextModulesLocal = modules.map((m) => ({
                  ...m,
                  items: [...m.items],
                }));

                if (from) {
                  movingItem =
                    nextModulesLocal[from.modIndex].items[from.itemIndex];
                  nextModulesLocal[from.modIndex].items.splice(
                    from.itemIndex,
                    1
                  );
                } else {
                  const sIdx = nextStandaloneLocal.findIndex(
                    (i) => i.id === activeId
                  );
                  if (sIdx >= 0) {
                    movingItem = nextStandaloneLocal.splice(sIdx, 1)[0];
                  }
                }

                if (!movingItem) return;

                let toModIndex = -1;
                let toIndex = -1;

                const overItemLoc = findItemLocation(overId);
                if (overItemLoc) {
                  toModIndex = overItemLoc.modIndex;
                  toIndex = overItemLoc.itemIndex;
                } else {
                  toModIndex = modules.findIndex((m) => m.id === overId);
                  if (toModIndex >= 0) {
                    toIndex = modules[toModIndex].items.length; // soltar no fim do módulo (inclui caso colapsado)
                  }
                }

                if (toModIndex < 0 || toIndex < 0) return;

                // ajuste quando origem e destino são o mesmo módulo e queda após índice removido
                if (
                  from &&
                  from.modIndex === toModIndex &&
                  toIndex > from.itemIndex
                ) {
                  toIndex -= 1;
                }

                nextModulesLocal[toModIndex].items.splice(
                  toIndex,
                  0,
                  movingItem
                );

                onChange({
                  ...value,
                  modules: nextModulesLocal,
                  standaloneItems: nextStandaloneLocal,
                });
                setActiveDragKind(null);
                return;
              }
            }}
          >
            <SortableContext
              items={[
                ...modules.map((m) => m.id),
                ...(groupedStandalone.groups[-1]?.map((i) => i.id) || []),
                ...Object.keys(groupedStandalone.groups)
                  .filter((key) => parseInt(key) >= 0)
                  .flatMap((key) => groupedStandalone.groups[parseInt(key)])
                  .map((i) => i.id),
              ]}
              strategy={verticalListSortingStrategy}
            >
              {/* Renderizar itens standalone que devem aparecer ANTES de todos os módulos */}
              {allowStandaloneItems &&
                groupedStandalone.groups[-1]?.map((standaloneIt) => (
                  <SortableItem id={standaloneIt.id} key={standaloneIt.id}>
                    {({ attributes, listeners, setNodeRef, style }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 mb-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              {...attributes}
                              {...listeners}
                              className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
                              aria-label="Arrastar"
                            >
                              <Icon
                                name="GripVertical"
                                className="h-4 w-4 text-emerald-500"
                              />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                              <Icon
                                name={getIconForType(standaloneIt.type) as any}
                                className="h-4 w-4 text-emerald-600"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0">
                              <LocalInput
                                className="w-full bg-transparent outline-none text-sm! font-medium text-gray-900 leading-tight! mb-0!"
                                value={standaloneIt.title}
                                onChange={(newTitle) =>
                                  setItemTitle(standaloneIt.id, newTitle)
                                }
                              />
                              <span className="text-[10px]! text-emerald-600 font-medium leading-tight! mb-0!">
                                📍 Antes de todos os módulos
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <ButtonCustom
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    icon="FolderInput"
                                    className="h-7 w-7 p-0"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setMoveToModuleModal({
                                        isOpen: true,
                                        itemId: standaloneIt.id,
                                        itemTitle: standaloneIt.title || "Item",
                                      });
                                    }}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                Mover para módulo
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <ButtonCustom
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    icon="X"
                                    className="h-7 w-7 p-0"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      onChange({
                                        ...value,
                                        standaloneItems: standaloneItems.map(
                                          (i) =>
                                            i.id === standaloneIt.id
                                              ? {
                                                  ...i,
                                                  afterModuleIndex: undefined,
                                                }
                                              : i
                                        ),
                                      });
                                      toastCustom.info({
                                        description: "Movido para área avulsa",
                                      });
                                    }}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                Mover para área avulsa
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <ButtonCustom
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    icon="Trash2"
                                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setConfirmDelete({
                                        type: "item",
                                        id: standaloneIt.id,
                                      });
                                    }}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                Excluir
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                ))}

              {/* Zona de drop ANTES do primeiro módulo - usando useDroppable */}
              {modules.length > 0 &&
                allowStandaloneItems &&
                isDragging &&
                activeDragKind === "item" && (
                  <StandaloneDroppable id="before-all-modules">
                    {({ setNodeRef, isOver }) => (
                      <div
                        ref={setNodeRef}
                        className={cn(
                          "rounded-xl border-2 py-4 px-4 text-xs text-center transition-all mb-3",
                          isOver
                            ? "border-emerald-500 bg-emerald-100"
                            : "border-emerald-400 bg-emerald-50"
                        )}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon
                            name="Download"
                            className={cn(
                              "h-4 w-4",
                              isOver
                                ? "text-emerald-700 animate-bounce"
                                : "text-emerald-600"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium",
                              isOver ? "text-emerald-800" : "text-emerald-700"
                            )}
                          >
                            Solte para posicionar antes de todos os módulos
                          </span>
                        </div>
                      </div>
                    )}
                  </StandaloneDroppable>
                )}

              {modules.map((mod, modIndex) => (
                <React.Fragment key={mod.id}>
                  <SortableModule id={mod.id}>
                    {({ attributes, listeners, setNodeRef, style }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        onDragOver={(e) => {
                          // aceita drop de itens quando módulo estiver colapsado
                          if (
                            collapsedModules[mod.id] &&
                            isDragging &&
                            activeDragKind === "item"
                          )
                            e.preventDefault();
                          else e.preventDefault();
                        }}
                        onDragEnter={() =>
                          dragId?.startsWith("palette-") &&
                          setHoverModuleId(mod.id)
                        }
                        onDragLeave={() =>
                          dragId?.startsWith("palette-") &&
                          setHoverModuleId((prev) =>
                            prev === mod.id ? null : prev
                          )
                        }
                        onDrop={(e) => {
                          // Não prevenir default se o target tem a classe das zonas verdes
                          const target = e.target as HTMLElement;
                          if (
                            target.closest('[data-dropzone="between-modules"]')
                          ) {
                            // Deixa a zona verde lidar com o drop
                            return;
                          }

                          e.preventDefault();
                          // Drop de MÓDULO na casca do módulo atual => cria novo ao lado
                          if (dragId && dragId.startsWith("palette-MODULO")) {
                            addModuleAt(modIndex);
                            setDragId(null);
                            setInsertIndex(null);
                            setHoverModuleId(null);
                            return;
                          }
                          // Se módulo estiver minimizado, permitir soltar itens aqui (vai para o fim)
                          if (
                            collapsedModules[mod.id] &&
                            (activeDragKind === "item" ||
                              (dragId && dragId.startsWith("palette-")))
                          ) {
                            handleDropItemInModule(
                              e as any,
                              mod.id,
                              mod.items.length
                            );
                            return;
                          }
                        }}
                        className={cn(
                          "rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 cursor-pointer",
                          hoverModuleId === mod.id &&
                            dragId?.startsWith("palette-") &&
                            "ring-1 ring-blue-300/60",
                          collapsedModules[mod.id] &&
                            isDragging &&
                            activeDragKind === "item" &&
                            "ring-1 ring-[var(--primary-color)]/50"
                        )}
                        onClick={() => {
                          setSelected({ kind: "module", id: mod.id });
                          setIsPanelOpen(true);
                          setLastModuleId(mod.id);
                        }}
                      >
                        {/* Header do Módulo - Design moderno */}
                        <div className="p-4 bg-indigo-50/50 rounded-t-xl">
                          <div className="flex items-center gap-4">
                            {/* Navegação do módulo */}
                            <div className="flex items-center gap-1">
                              <button
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                aria-label="Arrastar módulo"
                              >
                                <Icon
                                  name="GripVertical"
                                  className="h-5 w-5 text-indigo-400"
                                />
                              </button>
                              <div className="flex flex-col gap-0.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="h-4 w-5 flex items-center justify-center hover:bg-indigo-100 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      disabled={modIndex === 0}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        moveModule(mod.id, "up");
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <Icon
                                        name="ChevronUp"
                                        className="h-3 w-3 text-indigo-500 group-hover:text-indigo-700"
                                      />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" sideOffset={6}>
                                    Subir
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="h-4 w-5 flex items-center justify-center hover:bg-indigo-100 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      disabled={modIndex === modules.length - 1}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        moveModule(mod.id, "down");
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <Icon
                                        name="ChevronDown"
                                        className="h-3 w-3 text-indigo-500 group-hover:text-indigo-700"
                                      />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" sideOffset={6}>
                                    Descer
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>

                            {/* Ícone do módulo */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 shrink-0">
                              <Icon
                                name="Boxes"
                                className="h-5 w-5 text-indigo-600"
                              />
                            </div>

                            {/* Título e contador */}
                            <div className="flex-1 min-w-0 flex flex-col gap-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px]! font-semibold uppercase tracking-wide text-indigo-600 leading-tight!">
                                  Módulo {modIndex + 1}
                                </span>
                                <span className="text-[10px]! px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 leading-tight!">
                                  {mod.items.length}{" "}
                                  {mod.items.length === 1 ? "item" : "itens"}
                                </span>
                              </div>
                              <LocalInput
                                className="w-full bg-transparent outline-none text-base! font-semibold text-gray-900 placeholder:text-gray-400 leading-tight! -mt-0.5"
                                value={mod.title}
                                placeholder="Nome do módulo"
                                onChange={(newTitle) =>
                                  setModuleTitle(mod.id, newTitle)
                                }
                              />
                            </div>

                            {/* Ações do módulo */}
                            <div className="flex items-center gap-1">
                              {mod.items.length >= 3 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        icon={
                                          collapsedModules[mod.id]
                                            ? "ChevronRight"
                                            : "ChevronDown"
                                        }
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          toggleModuleCollapsed(mod.id);
                                        }}
                                        onPointerDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        onMouseDown={(e) => e.stopPropagation()}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    {collapsedModules[mod.id]
                                      ? "Expandir"
                                      : "Minimizar"}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ButtonCustom
                                      type="button"
                                      variant="ghost"
                                      size="xs"
                                      icon="Copy"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        duplicateModule(mod.id);
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Duplicar
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ButtonCustom
                                      type="button"
                                      variant="ghost"
                                      size="xs"
                                      icon="Trash2"
                                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setConfirmDelete({
                                          type: "module",
                                          id: mod.id,
                                        });
                                      }}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Excluir
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          {/* Instrutores do módulo */}
                          {instructorOptions &&
                            instructorOptions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-indigo-100/50">
                                <MultiSelectCustom
                                  label=""
                                  placeholder="👤 Adicionar instrutores ao módulo..."
                                  value={(mod.instructorIds || []).map((id) => {
                                    const opt = instructorOptions.find(
                                      (o) => String(o.value) === String(id)
                                    );
                                    return {
                                      value: String(id),
                                      label: opt?.label || String(id),
                                    };
                                  })}
                                  onChange={(opts) => {
                                    const ids = (opts || []).map((o: any) =>
                                      String(o.value)
                                    );
                                    onChange({
                                      ...value,
                                      modules: modules.map((m) =>
                                        m.id === mod.id
                                          ? { ...m, instructorIds: ids }
                                          : m
                                      ),
                                    });
                                  }}
                                  options={instructorOptions.map((o) => ({
                                    value: String(o.value),
                                    label: o.label,
                                  }))}
                                  onSearchSync={(term) =>
                                    instructorOptions
                                      .filter((o) =>
                                        !term
                                          ? true
                                          : o.label
                                              .toLowerCase()
                                              .includes(term.toLowerCase()) ||
                                            String(o.value)
                                              .toLowerCase()
                                              .includes(term.toLowerCase())
                                      )
                                      .map((o) => ({
                                        value: String(o.value),
                                        label: o.label,
                                      }))
                                  }
                                  maxVisibleTags={4}
                                />
                              </div>
                            )}
                        </div>
                        {!collapsedModules[mod.id] &&
                          showModuleDates[mod.id] && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 pb-3">
                              <InputCustom
                                label="Início do módulo"
                                type="datetime-local"
                                value={mod.startDate || ""}
                                min={nowLocal}
                                onChange={(e) =>
                                  setModuleDates(
                                    mod.id,
                                    e.target.value || null,
                                    mod.endDate || null
                                  )
                                }
                              />
                              <InputCustom
                                label="Fim do módulo"
                                type="datetime-local"
                                value={mod.endDate || ""}
                                min={nowLocal}
                                onChange={(e) =>
                                  setModuleDates(
                                    mod.id,
                                    mod.startDate || null,
                                    e.target.value || null
                                  )
                                }
                              />
                            </div>
                          )}
                        {!collapsedModules[mod.id] && (
                          <div
                            className="p-3 space-y-2"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropItemInModule(e, mod.id)}
                          >
                            {(() => {
                              const droppingActive = Boolean(
                                dragId ||
                                  (isDragging && activeDragKind === "item")
                              );
                              const isEmpty = mod.items.length === 0;
                              if (isEmpty) {
                                if (droppingActive) {
                                  return (
                                    <div
                                      className="relative rounded-xl border-2 border-[var(--primary-color)]/40 bg-[var(--primary-color)]/5 py-10 px-4 text-center transition-all duration-300"
                                      style={{
                                        borderColor: "var(--primary-color)",
                                        backgroundColor:
                                          "color-mix(in srgb, var(--primary-color) 8%, transparent)",
                                      }}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(e, mod.id, 0)
                                      }
                                    >
                                      <div className="absolute inset-0 bg-[var(--primary-color)]/5 rounded-xl animate-pulse" />
                                      <div className="relative flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center">
                                          <Icon
                                            name="Download"
                                            className="h-5 w-5 text-[var(--primary-color)] animate-bounce"
                                          />
                                        </div>
                                        <span
                                          className="text-sm font-medium"
                                          style={{
                                            color: "var(--primary-color)",
                                          }}
                                        >
                                          Solte aqui para adicionar
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 px-4 text-center group hover:border-gray-300 transition-all">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        <Icon
                                          name="Plus"
                                          className="h-4 w-4 text-gray-400"
                                        />
                                      </div>
                                      <p className="text-sm! text-gray-500! mb-0!">
                                        Arraste{" "}
                                        <span className="font-medium text-blue-600">
                                          Aula
                                        </span>
                                        ,{" "}
                                        <span className="font-medium text-amber-600">
                                          Atividade
                                        </span>{" "}
                                        ou{" "}
                                        <span className="font-medium text-rose-600">
                                          Prova
                                        </span>
                                      </p>
                                      <p className="text-xs! text-gray-400! mb-0! mt-[-10px]!">
                                        para dentro deste módulo
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <>
                                  {droppingActive && (
                                    <div
                                      className="flex items-center gap-2 py-2 px-3 rounded-lg border border-[var(--primary-color)]/40 bg-[var(--primary-color)]/5 transition-all"
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(e, mod.id, 0)
                                      }
                                    >
                                      <div className="w-6 h-6 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center">
                                        <Icon
                                          name="ArrowDown"
                                          className="h-3 w-3 text-[var(--primary-color)] animate-bounce"
                                        />
                                      </div>
                                      <span className="text-xs font-medium text-[var(--primary-color)]">
                                        Adicionar no início
                                      </span>
                                    </div>
                                  )}

                                  <SortableContext
                                    items={mod.items.map((x) => x.id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    {mod.items.map((it, idx) => (
                                      <React.Fragment key={it.id}>
                                        {droppingActive && (
                                          <div
                                            className="mx-2 my-1 h-1.5 rounded-full bg-gradient-to-r from-transparent via-[var(--primary-color)]/40 to-transparent transition-all hover:via-[var(--primary-color)]/60"
                                            onDragOver={(e) =>
                                              e.preventDefault()
                                            }
                                            onDrop={(e) =>
                                              handleDropItemInModule(
                                                e,
                                                mod.id,
                                                idx
                                              )
                                            }
                                            aria-hidden
                                          />
                                        )}
                                        <SortableItem id={it.id}>
                                          {({
                                            attributes,
                                            listeners,
                                            setNodeRef,
                                            style,
                                          }) => {
                                            // Estilos por tipo de item (importados de config/)
                                            const itemStyle =
                                              ITEM_TYPE_STYLES[it.type] ||
                                              ITEM_TYPE_STYLES.AULA;
                                            const isSelected =
                                              selected?.kind === "item" &&
                                              selected?.id === it.id;

                                            return (
                                              <div
                                                ref={setNodeRef}
                                                style={style}
                                                className={cn(
                                                  "group relative rounded-xl border-2 transition-all duration-200 cursor-pointer",
                                                  itemStyle.border,
                                                  itemStyle.bg,
                                                  itemStyle.hoverBg,
                                                  "hover:border-opacity-100",
                                                  isSelected &&
                                                    cn(
                                                      "ring-2",
                                                      itemStyle.selectedRing
                                                    )
                                                )}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelected({
                                                    kind: "item",
                                                    id: it.id,
                                                  });
                                                  setIsPanelOpen(true);
                                                  setLastModuleId(mod.id);
                                                }}
                                              >
                                                <div
                                                  className="flex items-center justify-between gap-3 p-3"
                                                  {...attributes}
                                                >
                                                  <div className="flex items-center gap-3 flex-1">
                                                    {/* Navegação do item */}
                                                    <div className="flex items-center gap-0.5">
                                                      <button
                                                        {...listeners}
                                                        className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Reordenar"
                                                        aria-grabbed={
                                                          isDragging
                                                        }
                                                      >
                                                        <Icon
                                                          name="GripVertical"
                                                          className="h-4 w-4 text-gray-400"
                                                        />
                                                      </button>
                                                      <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Tooltip>
                                                          <TooltipTrigger
                                                            asChild
                                                          >
                                                            <button
                                                              type="button"
                                                              className="h-3 w-4 flex items-center justify-center hover:bg-gray-200 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                              disabled={
                                                                idx === 0
                                                              }
                                                              onPointerDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onMouseDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                const to =
                                                                  Math.max(
                                                                    0,
                                                                    idx - 1
                                                                  );
                                                                const targetModIndex =
                                                                  modules.findIndex(
                                                                    (m) =>
                                                                      m.id ===
                                                                      mod.id
                                                                  );
                                                                if (
                                                                  targetModIndex <
                                                                  0
                                                                )
                                                                  return;
                                                                const mcopy = {
                                                                  ...mod,
                                                                  items: [
                                                                    ...mod.items,
                                                                  ],
                                                                };
                                                                const [moved] =
                                                                  mcopy.items.splice(
                                                                    idx,
                                                                    1
                                                                  );
                                                                mcopy.items.splice(
                                                                  to,
                                                                  0,
                                                                  moved
                                                                );
                                                                onChange({
                                                                  ...value,
                                                                  modules:
                                                                    modules.map(
                                                                      (mm, i) =>
                                                                        i ===
                                                                        targetModIndex
                                                                          ? mcopy
                                                                          : mm
                                                                    ),
                                                                });
                                                              }}
                                                            >
                                                              <Icon
                                                                name="ChevronUp"
                                                                className="h-2.5 w-2.5 text-gray-500 hover:text-gray-700"
                                                              />
                                                            </button>
                                                          </TooltipTrigger>
                                                          <TooltipContent
                                                            side="left"
                                                            sideOffset={6}
                                                          >
                                                            Subir
                                                          </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                          <TooltipTrigger
                                                            asChild
                                                          >
                                                            <button
                                                              type="button"
                                                              className="h-3 w-4 flex items-center justify-center hover:bg-gray-200 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                                              disabled={
                                                                idx ===
                                                                mod.items
                                                                  .length -
                                                                  1
                                                              }
                                                              onPointerDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onMouseDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                const to =
                                                                  Math.min(
                                                                    mod.items
                                                                      .length -
                                                                      1,
                                                                    idx + 1
                                                                  );
                                                                const targetModIndex =
                                                                  modules.findIndex(
                                                                    (m) =>
                                                                      m.id ===
                                                                      mod.id
                                                                  );
                                                                if (
                                                                  targetModIndex <
                                                                  0
                                                                )
                                                                  return;
                                                                const mcopy = {
                                                                  ...mod,
                                                                  items: [
                                                                    ...mod.items,
                                                                  ],
                                                                };
                                                                const [moved] =
                                                                  mcopy.items.splice(
                                                                    idx,
                                                                    1
                                                                  );
                                                                mcopy.items.splice(
                                                                  to,
                                                                  0,
                                                                  moved
                                                                );
                                                                onChange({
                                                                  ...value,
                                                                  modules:
                                                                    modules.map(
                                                                      (mm, i) =>
                                                                        i ===
                                                                        targetModIndex
                                                                          ? mcopy
                                                                          : mm
                                                                    ),
                                                                });
                                                              }}
                                                            >
                                                              <Icon
                                                                name="ChevronDown"
                                                                className="h-2.5 w-2.5 text-gray-500 hover:text-gray-700"
                                                              />
                                                            </button>
                                                          </TooltipTrigger>
                                                          <TooltipContent
                                                            side="left"
                                                            sideOffset={6}
                                                          >
                                                            Descer
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </div>
                                                    </div>
                                                    {/* Ícone do tipo */}
                                                    <div
                                                      className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                                                        itemStyle.iconBg
                                                      )}
                                                    >
                                                      <Icon
                                                        name={
                                                          getIconForType(
                                                            it.type
                                                          ) as any
                                                        }
                                                        className={cn(
                                                          "h-4 w-4",
                                                          itemStyle.iconColor
                                                        )}
                                                      />
                                                    </div>
                                                    {/* Título editável */}
                                                    <div className="flex-1 min-w-0 flex flex-col gap-0">
                                                      <LocalInput
                                                        className="w-full bg-transparent outline-none text-sm! font-medium text-gray-900 truncate leading-tight!"
                                                        value={it.title}
                                                        placeholder={
                                                          TYPE_META[it.type]
                                                            ?.label || "Aula"
                                                        }
                                                        onChange={(newTitle) =>
                                                          setItemTitle(
                                                            it.id,
                                                            newTitle
                                                          )
                                                        }
                                                      />
                                                      <span
                                                        className={cn(
                                                          "text-[10px]! font-medium leading-tight! -mt-0.5",
                                                          itemStyle.iconColor
                                                        )}
                                                      >
                                                        {TYPE_META[it.type]
                                                          ?.label || "Aula"}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  {/* Ações - aparecem no hover */}
                                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {allowStandaloneItems && (
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <span>
                                                            <ButtonCustom
                                                              type="button"
                                                              variant="ghost"
                                                              size="xs"
                                                              icon="MoveUpRight"
                                                              className="h-7 w-7 p-0"
                                                              onPointerDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onMouseDown={(
                                                                e
                                                              ) =>
                                                                e.stopPropagation()
                                                              }
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                // Extrair item do módulo
                                                                const nextModules =
                                                                  modules.map(
                                                                    (m) =>
                                                                      m.id ===
                                                                      mod.id
                                                                        ? {
                                                                            ...m,
                                                                            items:
                                                                              m.items.filter(
                                                                                (
                                                                                  i
                                                                                ) =>
                                                                                  i.id !==
                                                                                  it.id
                                                                              ),
                                                                          }
                                                                        : m
                                                                  );
                                                                onChange({
                                                                  ...value,
                                                                  modules:
                                                                    nextModules,
                                                                  standaloneItems:
                                                                    [
                                                                      ...standaloneItems,
                                                                      it,
                                                                    ],
                                                                });
                                                                toastCustom.success(
                                                                  {
                                                                    description:
                                                                      "Item movido para fora do módulo",
                                                                  }
                                                                );
                                                              }}
                                                            />
                                                          </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                          sideOffset={6}
                                                        >
                                                          Mover para fora
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    )}
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <span>
                                                          <ButtonCustom
                                                            type="button"
                                                            variant="ghost"
                                                            size="xs"
                                                            icon="Copy"
                                                            className="h-7 w-7 p-0"
                                                            onPointerDown={(
                                                              e
                                                            ) =>
                                                              e.stopPropagation()
                                                            }
                                                            onMouseDown={(e) =>
                                                              e.stopPropagation()
                                                            }
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              e.preventDefault();
                                                              duplicateItem(
                                                                it.id
                                                              );
                                                            }}
                                                          />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent
                                                        sideOffset={6}
                                                      >
                                                        Duplicar
                                                      </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <span>
                                                          <ButtonCustom
                                                            type="button"
                                                            variant="ghost"
                                                            size="xs"
                                                            icon="Trash2"
                                                            className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                                                            onPointerDown={(
                                                              e
                                                            ) =>
                                                              e.stopPropagation()
                                                            }
                                                            onMouseDown={(e) =>
                                                              e.stopPropagation()
                                                            }
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              e.preventDefault();
                                                              setConfirmDelete({
                                                                type: "item",
                                                                id: it.id,
                                                              });
                                                            }}
                                                          />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent
                                                        sideOffset={6}
                                                      >
                                                        Excluir
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }}
                                        </SortableItem>
                                      </React.Fragment>
                                    ))}
                                  </SortableContext>
                                  {droppingActive && (
                                    <div
                                      className="flex items-center gap-2 py-2 px-3 rounded-lg border border-[var(--primary-color)]/40 bg-[var(--primary-color)]/5 transition-all"
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(
                                          e,
                                          mod.id,
                                          mod.items.length
                                        )
                                      }
                                    >
                                      <div className="w-6 h-6 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center">
                                        <Icon
                                          name="Plus"
                                          className="h-3 w-3 text-[var(--primary-color)]"
                                        />
                                      </div>
                                      <span className="text-xs font-medium text-[var(--primary-color)]">
                                        Adicionar no fim
                                      </span>
                                    </div>
                                  )}
                                  {/* barra de atalhos removida para evitar redundância */}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </SortableModule>

                  {/* Renderizar standaloneItems que devem aparecer após este módulo */}
                  {allowStandaloneItems &&
                    groupedStandalone.groups[modIndex]?.map((standaloneIt) => (
                      <SortableItem id={standaloneIt.id} key={standaloneIt.id}>
                        {({ attributes, listeners, setNodeRef, style }) => (
                          <div
                            ref={setNodeRef}
                            style={style}
                            className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 my-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <button
                                  {...attributes}
                                  {...listeners}
                                  className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
                                  aria-label="Arrastar"
                                >
                                  <Icon
                                    name="GripVertical"
                                    className="h-4 w-4 text-emerald-500"
                                  />
                                </button>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                  <Icon
                                    name={
                                      getIconForType(standaloneIt.type) as any
                                    }
                                    className="h-4 w-4 text-emerald-600"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col gap-0">
                                  <LocalInput
                                    className="w-full bg-transparent outline-none text-sm! font-medium text-gray-900 leading-tight! mb-0!"
                                    value={standaloneIt.title}
                                    onChange={(newTitle) =>
                                      setItemTitle(standaloneIt.id, newTitle)
                                    }
                                  />
                                  <span className="text-[10px]! text-emerald-600 font-medium leading-tight! mb-0!">
                                    📍 Após{" "}
                                    {mod.title || `Módulo ${modIndex + 1}`}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        icon="FolderInput"
                                        className="h-7 w-7 p-0"
                                        onPointerDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setMoveToModuleModal({
                                            isOpen: true,
                                            itemId: standaloneIt.id,
                                            itemTitle:
                                              standaloneIt.title || "Item",
                                          });
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    Mover para módulo
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        icon="X"
                                        className="h-7 w-7 p-0"
                                        onPointerDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          onChange({
                                            ...value,
                                            standaloneItems:
                                              standaloneItems.map((i) =>
                                                i.id === standaloneIt.id
                                                  ? {
                                                      ...i,
                                                      afterModuleIndex:
                                                        undefined,
                                                    }
                                                  : i
                                              ),
                                          });
                                          toastCustom.info({
                                            description:
                                              "Movido para área avulsa",
                                          });
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    Mover para área avulsa
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        icon="Trash2"
                                        className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                                        onPointerDown={(e) =>
                                          e.stopPropagation()
                                        }
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setConfirmDelete({
                                            type: "item",
                                            id: standaloneIt.id,
                                          });
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    Excluir
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        )}
                      </SortableItem>
                    ))}

                  {/* gap imediatamente após este módulo - usando useDroppable */}
                  {(dragId?.startsWith("palette-MODULO") ||
                    (allowStandaloneItems &&
                      isDragging &&
                      activeDragKind === "item")) && (
                    <StandaloneDroppable id={`after-module-${modIndex}`}>
                      {({ setNodeRef, isOver }) => (
                        <div
                          ref={setNodeRef}
                          className={cn(
                            "rounded-xl border-2 py-4 px-4 text-xs text-center transition-all my-2",
                            dragId?.startsWith("palette-MODULO")
                              ? isOver
                                ? "border-indigo-500 bg-indigo-100"
                                : "border-indigo-400 bg-indigo-50"
                              : isOver
                              ? "border-emerald-500 bg-emerald-100"
                              : "border-emerald-400 bg-emerald-50"
                          )}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragId?.startsWith("palette-MODULO")) {
                              setInsertIndex(modIndex + 1);
                            }
                          }}
                          onDrop={(e) => {
                            if (dragId?.startsWith("palette-MODULO")) {
                              e.preventDefault();
                              addModuleAt(modIndex + 1);
                              setInsertIndex(null);
                              setDragId(null);
                            }
                          }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Icon
                              name={
                                dragId?.startsWith("palette-MODULO")
                                  ? "Plus"
                                  : "Download"
                              }
                              className={cn(
                                "h-4 w-4",
                                dragId?.startsWith("palette-MODULO")
                                  ? isOver
                                    ? "text-indigo-700 animate-bounce"
                                    : "text-indigo-600"
                                  : isOver
                                  ? "text-emerald-700 animate-bounce"
                                  : "text-emerald-600"
                              )}
                            />
                            <span
                              className={cn(
                                "font-medium",
                                dragId?.startsWith("palette-MODULO")
                                  ? isOver
                                    ? "text-indigo-800"
                                    : "text-indigo-700"
                                  : isOver
                                  ? "text-emerald-800"
                                  : "text-emerald-700"
                              )}
                            >
                              {dragId?.startsWith("palette-MODULO")
                                ? "Solte para criar módulo aqui"
                                : `Solte para posicionar após "${
                                    mod.title || `Módulo ${modIndex + 1}`
                                  }"`}
                            </span>
                          </div>
                        </div>
                      )}
                    </StandaloneDroppable>
                  )}
                </React.Fragment>
              ))}
            </SortableContext>

            {/* Zona de drop para manter fora de módulos (dnd-kit + drag nativo) */}
            {allowStandaloneItems &&
              (dragId?.startsWith("palette-AULA") ||
                dragId?.startsWith("palette-ATIVIDADE") ||
                dragId?.startsWith("palette-PROVA") ||
                (isDragging && activeDragKind === "item")) && (
                <StandaloneDroppable id="standalone-dropzone">
                  {({ setNodeRef, isOver }) => (
                    <div
                      ref={setNodeRef}
                      className={cn(
                        "mt-3 rounded-xl border py-4 px-4 transition-all duration-200",
                        isOver
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropItemStandalone(e)}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isOver ? "bg-emerald-100" : "bg-gray-100"
                          )}
                        >
                          <Icon
                            name={isOver ? "Download" : "FolderOpen"}
                            className={cn(
                              "h-4 w-4",
                              isOver
                                ? "text-emerald-600 animate-bounce"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isOver ? "text-emerald-700" : "text-gray-500"
                          )}
                        >
                          {isOver
                            ? "Solte para adicionar"
                            : "Área para itens avulsos"}
                        </span>
                      </div>
                    </div>
                  )}
                </StandaloneDroppable>
              )}

            {modules.length > 0 && groupedStandalone.ungrouped.length > 0 && (
              <>
                {/* Divider com instrução */}
                <div className="my-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 px-2">
                      Itens avulsos (fora de módulos)
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                    <Icon name="Info" className="h-3.5 w-3.5 text-blue-600" />
                    <p className="text-xs! text-blue-700 mb-0!">
                      <strong>Dica:</strong> Itens avulsos aparecem após os
                      módulos. Para organizá-los entre módulos, use o botão
                      <Icon
                        name="FolderInput"
                        className="h-3 w-3 inline mx-0.5"
                      />
                      para movê-los para dentro de um módulo específico.
                    </p>
                  </div>
                </div>

                {/* Lista de itens soltos (reordenável) abaixo dos módulos - usa o DnDContext global */}
                <div className="space-y-2">
                  <SortableContext
                    items={groupedStandalone.ungrouped.map((x) => x.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {groupedStandalone.ungrouped.map((it, idx) => (
                      <SortableItem id={it.id} key={it.id}>
                        {({ attributes, listeners, setNodeRef, style }) => (
                          <div
                            ref={setNodeRef}
                            style={style}
                            className={cn(
                              "relative rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 cursor-pointer",
                              selected?.kind === "item" &&
                                selected?.id === it.id &&
                                "ring-1 ring-[var(--primary-color)]/30 bg-[var(--primary-color)]/3"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected({ kind: "item", id: it.id });
                              setIsPanelOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-3 p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  {...attributes}
                                  {...listeners}
                                  className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
                                  aria-label="Reordenar"
                                  aria-grabbed={isDragging}
                                >
                                  <Icon
                                    name="GripVertical"
                                    className="h-4 w-4 text-gray-400"
                                  />
                                </button>
                                {/* Navegação vertical compacta */}
                                <div className="flex flex-col gap-0 opacity-0 hover:opacity-100 transition-opacity">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-200 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        disabled={idx === 0}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveStandaloneItem(it.id, "up");
                                        }}
                                      >
                                        <Icon
                                          name="ChevronUp"
                                          className="h-2.5 w-2.5 text-gray-500 hover:text-gray-700"
                                        />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" sideOffset={6}>
                                      Subir
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-200 rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        disabled={
                                          idx === standaloneItems.length - 1
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveStandaloneItem(it.id, "down");
                                        }}
                                      >
                                        <Icon
                                          name="ChevronDown"
                                          className="h-2.5 w-2.5 text-gray-500 hover:text-gray-700"
                                        />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" sideOffset={6}>
                                      Descer
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                              {(() => {
                                const meta =
                                  TYPE_META[
                                    (it as any).type as keyof typeof TYPE_META
                                  ] || TYPE_META.AULA;
                                const iconName = getIconForType(it.type);
                                return (
                                  <span
                                    className={cn(
                                      "hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border",
                                      meta.cls
                                    )}
                                  >
                                    <Icon
                                      name={iconName as any}
                                      className="h-3.5 w-3.5"
                                    />
                                    {meta.label}
                                  </span>
                                );
                              })()}
                              <LocalInput
                                className="flex-1 bg-transparent outline-none text-sm cursor-text"
                                value={it.title}
                                onChange={(newTitle) =>
                                  setItemTitle(it.id, newTitle)
                                }
                              />
                              <div className="flex items-center gap-1">
                                {modules.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <ButtonCustom
                                          type="button"
                                          variant="ghost"
                                          size="xs"
                                          icon="FolderInput"
                                          className="h-7 w-7 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setMoveToModuleModal({
                                              isOpen: true,
                                              itemId: it.id,
                                              itemTitle: it.title || "Item",
                                            });
                                          }}
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={6}>
                                      Mover para módulo
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="Copy"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicateItem(it.id);
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    Duplicar item
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon="Trash2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDelete({
                                            type: "item",
                                            id: it.id,
                                          });
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    Excluir item
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        )}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>
                {/* Gap adicional para criar módulo ao final, se estiver arrastando um módulo */}
                {dragId?.startsWith("palette-MODULO") && (
                  <div
                    className="rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs text-center"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--primary-color) 18%, white)",
                      backgroundColor:
                        "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                      color:
                        "color-mix(in srgb, var(--primary-color) 80%, black)",
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addModuleAt(modules.length);
                      setInsertIndex(null);
                      setDragId(null);
                    }}
                  >
                    Solte aqui para criar um novo módulo
                  </div>
                )}
              </>
            )}
            {modules.length === 0 &&
              (standaloneItems.length === 0 ? (
                <div
                  className={cn(
                    "relative rounded-2xl border transition-all duration-300",
                    "flex flex-col items-center justify-center py-16 px-6 text-center",
                    dragId
                      ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                      : "border-gray-200 bg-gray-50"
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!dragId) return;

                    const nextStructure = { ...value };

                    if (dragId.startsWith("palette-MODULO")) {
                      nextStructure.modules = [
                        ...(value.modules || []),
                        { id: uid("mod"), title: "Novo módulo", items: [] },
                      ];
                      setLastModuleId(
                        nextStructure.modules[nextStructure.modules.length - 1]
                          .id
                      );
                    } else {
                      const type = dragId.replace(
                        "palette-",
                        ""
                      ) as BuilderItem["type"];
                      const newItem: BuilderItem = {
                        id: uid("item"),
                        title:
                          type === "PROVA"
                            ? "Prova"
                            : type === "ATIVIDADE"
                            ? "Atividade"
                            : "Nova aula",
                        type,
                        startDate: null,
                        endDate: null,
                        instructorId: null,
                      };
                      if (allowStandaloneItems) {
                        nextStructure.standaloneItems = [
                          ...(value.standaloneItems || []),
                          newItem,
                        ];
                      } else {
                        // Se itens avulsos estão desativados, cria um módulo automaticamente
                        const newModId = uid("mod");
                        nextStructure.modules = [
                          {
                            id: newModId,
                            title: "Novo módulo",
                            items: [newItem],
                          },
                        ];
                        setLastModuleId(newModId);
                      }
                      setSelected({ kind: "item", id: newItem.id });
                      setIsPanelOpen(true);
                    }

                    setDragId(null);
                    onChange(nextStructure);
                  }}
                >
                  {/* Componente de estado vazio */}
                  <EmptyState isDragging={!!dragId} onAddModule={addModule} />
                </div>
              ) : (
                <>
                  {/* Lista solta quando não há módulos */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => {
                      setIsDragging(true);
                      setActiveDragKind("item");
                      setActiveDragId(String(active.id));
                    }}
                    onDragCancel={() => {
                      setIsDragging(false);
                      setActiveDragKind(null);
                      setActiveDragId(null);
                    }}
                    onDragEnd={({ active, over }) => {
                      setIsDragging(false);
                      setActiveDragId(null);
                      if (!over) return;
                      const activeId = String(active.id);
                      const overId = String(over.id);
                      if (activeId === overId) return;
                      const ids = standaloneItems.map((i) => i.id);
                      const oldIndex = ids.indexOf(activeId);
                      const newIndex = ids.indexOf(overId);
                      if (oldIndex >= 0 && newIndex >= 0) {
                        onChange({
                          ...value,
                          standaloneItems: arrayMove(
                            standaloneItems,
                            oldIndex,
                            newIndex
                          ),
                        });
                      }
                      setActiveDragKind(null);
                    }}
                  >
                    {dragId?.startsWith("palette-MODULO") && (
                      <div
                        className="rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs text-center"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--primary-color) 18%, white)",
                          backgroundColor:
                            "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                          color:
                            "color-mix(in srgb, var(--primary-color) 80%, black)",
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          addModuleAt(0);
                          setDragId(null);
                        }}
                      >
                        Solte aqui para criar um novo módulo
                      </div>
                    )}
                    <div className="space-y-2">
                      <SortableContext
                        items={standaloneItems.map((x) => x.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {standaloneItems.map((it, idx) => (
                          <SortableItem id={it.id} key={it.id}>
                            {({ attributes, listeners, setNodeRef, style }) => (
                              <div
                                ref={setNodeRef}
                                style={style}
                                className={cn(
                                  "relative rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-px cursor-pointer",
                                  selected?.kind === "item" &&
                                    selected?.id === it.id &&
                                    "ring-1 ring-[var(--primary-color)]/30 bg-[var(--primary-color)]/3"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected({ kind: "item", id: it.id });
                                  setIsPanelOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-3 p-2">
                                  <button
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab active:cursor-grabbing"
                                    aria-label="Reordenar"
                                    aria-grabbed={isDragging}
                                  >
                                    <Icon
                                      name="GripVertical"
                                      className="h-4 w-4 text-gray-400"
                                    />
                                  </button>
                                  {/* setas de mover item (esquerda) */}
                                  <div className="flex items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <ButtonCustom
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            icon="ArrowUp"
                                            disabled={idx === 0}
                                            onPointerDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onMouseDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              moveStandaloneItem(it.id, "up");
                                            }}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>
                                        Subir item
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <ButtonCustom
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            icon="ArrowDown"
                                            disabled={
                                              idx === standaloneItems.length - 1
                                            }
                                            onPointerDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onMouseDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              moveStandaloneItem(it.id, "down");
                                            }}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>
                                        Descer item
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Icon
                                    name={getIconForType(it.type) as any}
                                    className="h-4 w-4 text-gray-500"
                                  />
                                  {(() => {
                                    const meta =
                                      TYPE_META[
                                        (it as any)
                                          .type as keyof typeof TYPE_META
                                      ] || TYPE_META.AULA;
                                    return (
                                      <span
                                        className={cn(
                                          "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border",
                                          meta.cls
                                        )}
                                      >
                                        {meta.label}
                                      </span>
                                    );
                                  })()}
                                  <LocalInput
                                    className="flex-1 bg-transparent outline-none text-sm cursor-text"
                                    value={it.title}
                                    onChange={(newTitle) =>
                                      setItemTitle(it.id, newTitle)
                                    }
                                  />
                                  <div className="flex items-center gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <ButtonCustom
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            icon="Copy"
                                            onPointerDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onMouseDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              duplicateItem(it.id);
                                            }}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>
                                        Duplicar item
                                      </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <ButtonCustom
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            icon="Trash2"
                                            onPointerDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onMouseDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              setConfirmDelete({
                                                type: "item",
                                                id: it.id,
                                              });
                                            }}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>
                                        Excluir item
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            )}
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </div>
                    {dragId?.startsWith("palette-MODULO") && (
                      <div
                        className="rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-xs text-center"
                        style={{
                          borderColor:
                            "color-mix(in srgb, var(--primary-color) 18%, white)",
                          backgroundColor:
                            "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                          color:
                            "color-mix(in srgb, var(--primary-color) 80%, black)",
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          addModuleAt(modules.length);
                          setDragId(null);
                        }}
                      >
                        Solte aqui para criar um novo módulo
                      </div>
                    )}
                    <DragOverlay
                      dropAnimation={{
                        duration: 200,
                        easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                      }}
                    >
                      {(() => {
                        if (!activeDragId || activeDragKind !== "item")
                          return null;
                        const it = standaloneItems.find(
                          (i) => i.id === activeDragId
                        );
                        if (!it) return null;

                        const style =
                          DRAG_OVERLAY_STYLES[it.type] ||
                          DRAG_OVERLAY_STYLES.AULA;

                        return (
                          <div
                            className={cn(
                              "pointer-events-none rounded-xl border bg-white px-4 py-3 text-sm min-w-[180px]",
                              style.border
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-lg",
                                  style.bg
                                )}
                              >
                                <Icon
                                  name={style.icon as any}
                                  className={cn("h-4.5 w-4.5", style.text)}
                                />
                              </div>
                              <div>
                                <div
                                  className={cn(
                                    "text-[10px] font-medium uppercase tracking-wide",
                                    style.text
                                  )}
                                >
                                  {it.type === "PROVA"
                                    ? "Prova"
                                    : it.type === "ATIVIDADE"
                                    ? "Atividade"
                                    : "Aula"}
                                </div>
                                <div className="text-gray-900 font-medium truncate max-w-[130px]">
                                  {it.title ||
                                    (it.type === "PROVA"
                                      ? "Prova"
                                      : it.type === "ATIVIDADE"
                                      ? "Atividade"
                                      : "Aula")}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </DragOverlay>
                  </DndContext>
                </>
              ))}

            {/* Fecha o DnDContext global após módulos e itens soltos */}
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {(() => {
                if (!activeDragId || !activeDragKind) return null;
                if (activeDragKind === "module") {
                  const mod = modules.find((m) => m.id === activeDragId);
                  if (!mod) return null;
                  return (
                    <div className="pointer-events-none rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                          <Icon
                            name="Boxes"
                            className="h-5 w-5 text-indigo-600"
                          />
                        </div>
                        <div>
                          <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
                            Módulo
                          </div>
                          <div className="text-gray-900 font-semibold truncate max-w-[150px]">
                            {mod.title || "Sem título"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                const it =
                  modules
                    .flatMap((m) => m.items)
                    .find((i) => i.id === activeDragId) ||
                  standaloneItems.find((i) => i.id === activeDragId);
                if (!it) return null;

                // Cores por tipo (importadas de config/)
                const style =
                  DRAG_OVERLAY_STYLES[it.type] || DRAG_OVERLAY_STYLES.AULA;

                return (
                  <div
                    className={cn(
                      "pointer-events-none rounded-xl border bg-white px-4 py-3 text-sm min-w-[180px]",
                      style.border
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          style.bg
                        )}
                      >
                        <Icon
                          name={style.icon as any}
                          className={cn("h-4.5 w-4.5", style.text)}
                        />
                      </div>
                      <div>
                        <div
                          className={cn(
                            "text-[10px] font-medium uppercase tracking-wide",
                            style.text
                          )}
                        >
                          {it.type === "PROVA"
                            ? "Prova"
                            : it.type === "ATIVIDADE"
                            ? "Atividade"
                            : "Aula"}
                        </div>
                        <div className="text-gray-900 font-medium truncate max-w-[130px]">
                          {it.title ||
                            (it.type === "PROVA"
                              ? "Prova"
                              : it.type === "ATIVIDADE"
                              ? "Atividade"
                              : "Aula")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="space-y-4">
          {/* Paleta de componentes (lateral) - Design minimalista e futurista */}
          <Palette
            onAddModule={addModule}
            onAddItem={addToLastModuleAndEdit}
            onDragStart={setDragId}
            onDragEnd={() => {
              setDragId(null);
              setHoverModuleId(null);
              setInsertIndex(null);
            }}
          />
          <ModuleEditorModal
            isOpen={isPanelOpen && selected?.kind === "module"}
            module={
              selected?.kind === "module"
                ? modules.find((m) => m.id === selected.id) || null
                : null
            }
            instructorOptions={instructorOptions}
            minDate={periodMinDate}
            maxDate={periodMaxDate}
            existingModules={modules}
            onSave={(updates) => {
              if (selected?.kind === "module") {
                onChange({
                  ...value,
                  modules: modules.map((m) =>
                    m.id === selected.id ? { ...m, ...updates } : m
                  ),
                });
                toastCustom.success({
                  description: "Alterações salvas com sucesso!",
                });
              }
            }}
            onClose={() => setIsPanelOpen(false)}
          />

          <ItemEditorModal
            isOpen={isPanelOpen && selected?.kind === "item"}
            item={
              selected?.kind === "item"
                ? modules
                    .flatMap((m) => m.items)
                    .find((i) => i.id === selected.id) ||
                  standaloneItems.find((i) => i.id === selected.id) ||
                  null
                : null
            }
            modules={modules}
            standaloneItems={standaloneItems}
            modalidade={modalidade}
            instructorOptions={instructorOptions}
            minDate={
              selected?.kind === "item"
                ? (() => {
                    const parentModule = modules.find((m) =>
                      m.items.some((i) => i.id === selected.id)
                    );
                    return parentModule?.startDate
                      ? new Date(parentModule.startDate)
                      : periodMinDate;
                  })()
                : periodMinDate
            }
            maxDate={
              selected?.kind === "item"
                ? (() => {
                    const parentModule = modules.find((m) =>
                      m.items.some((i) => i.id === selected.id)
                    );
                    return parentModule?.endDate
                      ? new Date(parentModule.endDate)
                      : periodMaxDate;
                  })()
                : periodMaxDate
            }
            onSave={(updates) => {
              if (selected?.kind === "item") {
                // Verificar se o item está em um módulo ou é standalone
                const isStandalone = standaloneItems.some(
                  (i) => i.id === selected.id
                );

                if (isStandalone) {
                  // Atualizar standaloneItems
                  onChange({
                    ...value,
                    standaloneItems: standaloneItems.map((x) =>
                      x.id === selected.id ? { ...x, ...updates } : x
                    ),
                  });
                } else {
                  // Atualizar item dentro de módulo
                  onChange({
                    ...value,
                    modules: modules.map((m) => ({
                      ...m,
                      items: m.items.map((x) =>
                        x.id === selected.id ? { ...x, ...updates } : x
                      ),
                    })),
                  });
                }
                toastCustom.success({
                  description: "Alterações salvas com sucesso!",
                });
              }
            }}
            onClose={() => setIsPanelOpen(false)}
          />

          {/* Modal de confirmação de exclusão - Componentizada */}
          <DeleteConfirmModal
            isOpen={!!confirmDelete}
            deleteTarget={confirmDelete}
            modules={modules}
            standaloneItems={standaloneItems}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />

          {/* Modal para selecionar módulo destino */}
          <MoveToModuleModal
            isOpen={moveToModuleModal.isOpen}
            itemId={moveToModuleModal.itemId}
            itemTitle={moveToModuleModal.itemTitle}
            modules={modules}
            standaloneItems={standaloneItems}
            value={value}
            onChange={onChange}
            onClose={() =>
              setMoveToModuleModal({
                isOpen: false,
                itemId: null,
                itemTitle: "",
              })
            }
          />

          {/* Modal de confirmação para restaurar template */}
          <RestoreTemplateModal
            isOpen={confirmRestoreModal}
            onClose={() => setConfirmRestoreModal(false)}
            onConfirm={resetToTemplate}
          />
        </div>
      </div>
    </div>
  );
}

export default BuilderManager;
