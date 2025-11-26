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
import { DeleteConfirmModal } from "./components";
import { ModuleEditorModal, ItemEditorModal } from "./modals";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BuilderManagerProps {
  value: BuilderData;
  onChange: (val: BuilderData) => void;
  allowStandaloneItems?: boolean;
  template?: BuilderTemplate;
  instructorOptions?: Array<{ value: string; label: string }>;
  modalidade?: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL" | null;
}

export function BuilderManager({
  value,
  onChange,
  allowStandaloneItems = false,
  template,
  instructorOptions,
  modalidade = null,
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

  const modules = value.modules || [];
  const standaloneItems = value.standaloneItems || [];

  const sensors = useSensors(
    // Press-and-hold para iniciar o arrasto (ajuda a separar clique vs. arrastar)
    useSensor(PointerSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );

  // Estilos e rótulos por tipo de conteúdo (para badges e realces sutis)
  const TYPE_META: Record<BuilderItem["type"], { label: string; cls: string }> =
    {
      AULA: { label: "Aula", cls: "bg-blue-50 text-blue-700 border-blue-200" },
      ATIVIDADE: {
        label: "Atividade",
        cls: "bg-amber-50 text-amber-700 border-amber-200",
      },
      PROVA: {
        label: "Prova",
        cls: "bg-rose-50 text-rose-700 border-rose-200",
      },
    };

  // Cor do ícone por tipo (para combinar com o badge)
  const TYPE_ICON_CLS: Record<BuilderItem["type"], string> = {
    AULA: "text-blue-700",
    ATIVIDADE: "text-amber-700",
    PROVA: "text-rose-700",
  };

  function SortableItem({
    id,
    children,
  }: {
    id: string;
    children: (opts: {
      attributes: any;
      listeners: any;
      setNodeRef: any;
      style: React.CSSProperties;
    }) => React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return <>{children({ attributes, listeners, setNodeRef, style })}</>;
  }

  // Sortable para módulos (reordena com dnd-kit em vez de drag nativo)
  function SortableModule({
    id,
    children,
  }: {
    id: string;
    children: (opts: {
      attributes: any;
      listeners: any;
      setNodeRef: any;
      style: React.CSSProperties;
    }) => React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return <>{children({ attributes, listeners, setNodeRef, style })}</>;
  }

  // Droppable para "fora de módulos" (usado com dnd-kit)
  function StandaloneDroppable({
    id,
    children,
  }: {
    id: string;
    children: (opts: { setNodeRef: any; isOver: boolean }) => React.ReactNode;
  }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return <>{children({ setNodeRef, isOver })}</>;
  }

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
        title: type === "PROVA" ? "Prova" : "Nova aula",
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

  return (
    <div className="space-y-4">
      {/* Botão 'Recarregar template' ocultado para simplificar a UI */}

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
              className="rounded-md border-2 border-dashed py-2 px-3 text-xs text-center"
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
              if (!over) return;
              const activeId = String(active.id);
              const overId = String(over.id);
              if (activeId === overId) return;

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
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
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
                          "rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-px shadow-xs hover:shadow-sm cursor-pointer",
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
                        <div className="p-3 border-b border-gray-100 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-sm font-medium text-gray-700">
                            <span>Módulo {modIndex + 1}</span>
                            <span className="text-xs font-normal text-gray-500">
                              {mod.items.length} item
                              {mod.items.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            {/* Esquerda: mover módulo */}
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ButtonCustom
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      icon="ArrowUp"
                                      disabled={
                                        modIndex === 0 || modules.length <= 1
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveModule(mod.id, "up");
                                      }}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Subir módulo
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
                                        modIndex === modules.length - 1 ||
                                        modules.length <= 1
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveModule(mod.id, "down");
                                      }}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Descer módulo
                                </TooltipContent>
                              </Tooltip>
                            </div>

                            {/* Centro: título compacto */}
                            <div className="flex-1">
                              <InputCustom
                                value={mod.title}
                                onChange={(e) =>
                                  setModuleTitle(mod.id, e.target.value)
                                }
                                placeholder="Título do módulo"
                                size="sm"
                              />
                            </div>

                            {/* Direita: colapsar/duplicar/excluir */}
                            <div className="flex items-center gap-1 h-12">
                              {mod.items.length >= 5 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <ButtonCustom
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        icon={
                                          collapsedModules[mod.id]
                                            ? "ChevronRight"
                                            : "ChevronDown"
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleModuleCollapsed(mod.id);
                                        }}
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>
                                    {collapsedModules[mod.id]
                                      ? "Expandir módulo"
                                      : "Minimizar módulo"}
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
                                        duplicateModule(mod.id);
                                      }}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Duplicar módulo
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
                                          type: "module",
                                          id: mod.id,
                                        });
                                      }}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  Excluir módulo
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          {instructorOptions &&
                            instructorOptions.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                  Instrutores
                                </div>
                                <MultiSelectCustom
                                  label="Adicionar instrutores (opcional)"
                                  placeholder="Buscar por nome ou código"
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
                                      className="rounded-md border-2 border-dashed py-8 px-3 text-sm text-center animate-pulse"
                                      style={{
                                        borderColor:
                                          "color-mix(in srgb, var(--primary-color) 25%, white)",
                                        backgroundColor:
                                          "color-mix(in srgb, var(--primary-color) 4%, transparent)",
                                        color:
                                          "color-mix(in srgb, var(--primary-color) 80%, black)",
                                      }}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(e, mod.id, 0)
                                      }
                                    >
                                      Solte aqui para adicionar itens ao módulo
                                    </div>
                                  );
                                }
                                return (
                                  <div className="rounded-md border border-dashed border-gray-200 py-6 px-3 text-sm text-gray-500 text-center">
                                    Arraste itens da paleta (Aula, Atividade,
                                    Prova) para este módulo.
                                  </div>
                                );
                              }

                              return (
                                <>
                                  {droppingActive && (
                                    <div
                                      className="rounded-md border-2 border-dashed animate-pulse py-2 px-3 text-xs"
                                      style={{
                                        borderColor:
                                          "color-mix(in srgb, var(--primary-color) 25%, white)",
                                        backgroundColor:
                                          "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                                        color:
                                          "color-mix(in srgb, var(--primary-color) 80%, black)",
                                      }}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(e, mod.id, 0)
                                      }
                                    >
                                      Solte aqui para adicionar no início
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
                                            className="mx-1 my-1 h-2 rounded-full border-2 border-dashed"
                                            style={{
                                              borderColor:
                                                "color-mix(in srgb, var(--primary-color) 20%, white)",
                                              backgroundColor:
                                                "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                                            }}
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
                                          }) => (
                                            <div
                                              ref={setNodeRef}
                                              style={style}
                                              className={cn(
                                                "relative rounded-lg border border-gray-200 bg-gray-50 hover:bg-white transition-all hover:-translate-y-px hover:shadow-xs cursor-pointer",
                                                selected?.kind === "item" &&
                                                  selected?.id === it.id &&
                                                  "ring-1 ring-[var(--primary-color)]/30 bg-[var(--primary-color)]/5"
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
                                                className="flex items-center justify-between gap-3 p-2"
                                                {...attributes}
                                              >
                                                <div className="flex items-center gap-3 flex-1">
                                                  <button
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
                                                            size="xs"
                                                            className="bg-transparent hover:bg-gray-100"
                                                            icon="ArrowUp"
                                                            disabled={idx === 0}
                                                            onClick={(e) => {
                                                              e.stopPropagation();
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
                                                          />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent
                                                        sideOffset={6}
                                                      >
                                                        Subir item
                                                      </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <span>
                                                          <ButtonCustom
                                                            type="button"
                                                            variant="ghost"
                                                            size="xs"
                                                            className="bg-transparent hover:bg-gray-100"
                                                            icon="ArrowDown"
                                                            disabled={
                                                              idx ===
                                                              mod.items.length -
                                                                1
                                                            }
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              const to =
                                                                Math.min(
                                                                  mod.items
                                                                    .length - 1,
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
                                                          />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent
                                                        sideOffset={6}
                                                      >
                                                        Descer item
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  </div>
                                                  {(() => {
                                                    const meta =
                                                      TYPE_META[
                                                        (it as any)
                                                          .type as keyof typeof TYPE_META
                                                      ] || TYPE_META.AULA;
                                                    const iconName =
                                                      it.type === "PROVA"
                                                        ? "FileText"
                                                        : it.type ===
                                                          "ATIVIDADE"
                                                        ? "Paperclip"
                                                        : "GraduationCap";
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
                                                  <input
                                                    className="flex-1 bg-transparent outline-none text-sm cursor-text"
                                                    value={it.title}
                                                    onChange={(e) =>
                                                      setItemTitle(
                                                        it.id,
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div className="flex items-center gap-1">
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
                                                    <TooltipContent
                                                      sideOffset={6}
                                                    >
                                                      Excluir item
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </SortableItem>
                                      </React.Fragment>
                                    ))}
                                  </SortableContext>
                                  {droppingActive && (
                                    <div
                                      className="rounded-md border-2 border-dashed animate-pulse py-2 px-3 text-xs"
                                      style={{
                                        borderColor:
                                          "color-mix(in srgb, var(--primary-color) 25%, white)",
                                        backgroundColor:
                                          "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                                        color:
                                          "color-mix(in srgb, var(--primary-color) 80%, black)",
                                      }}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) =>
                                        handleDropItemInModule(
                                          e,
                                          mod.id,
                                          mod.items.length
                                        )
                                      }
                                    >
                                      Solte aqui para adicionar no fim
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
                  {/* gap imediatamente após este módulo */}
                  {dragId?.startsWith("palette-MODULO") && (
                    <div
                      className="rounded-md border-2 border-dashed py-2 px-3 text-xs text-center"
                      style={{
                        borderColor:
                          insertIndex === modIndex + 1
                            ? "color-mix(in srgb, var(--primary-color) 35%, white)"
                            : "color-mix(in srgb, var(--primary-color) 18%, white)",
                        backgroundColor:
                          insertIndex === modIndex + 1
                            ? "color-mix(in srgb, var(--primary-color) 6%, transparent)"
                            : "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                        color:
                          "color-mix(in srgb, var(--primary-color) 80%, black)",
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setInsertIndex(modIndex + 1);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        addModuleAt(modIndex + 1);
                        setInsertIndex(null);
                        setDragId(null);
                      }}
                    >
                      Solte aqui para criar um novo módulo
                    </div>
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
                        "mt-2 rounded-md border-2 border-dashed py-3 px-3 text-xs text-center"
                      )}
                      style={{
                        borderColor: isOver
                          ? "color-mix(in srgb, var(--primary-color) 35%, white)"
                          : "color-mix(in srgb, var(--primary-color) 15%, white)",
                        backgroundColor: isOver
                          ? "color-mix(in srgb, var(--primary-color) 6%, transparent)"
                          : "color-mix(in srgb, var(--primary-color) 3%, transparent)",
                        color:
                          "color-mix(in srgb, var(--primary-color) 80%, black)",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropItemStandalone(e)}
                    >
                      Solte aqui para manter fora de módulos
                    </div>
                  )}
                </StandaloneDroppable>
              )}

            {modules.length > 0 && standaloneItems.length > 0 && (
              <>
                {/* Lista de itens soltos (reordenável) abaixo dos módulos - usa o DnDContext global */}
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
                              "relative rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-px hover:shadow-xs cursor-pointer",
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
                                        size="xs"
                                        className="bg-transparent hover:bg-gray-100"
                                        icon="ArrowUp"
                                        disabled={idx === 0}
                                        onClick={(e) => {
                                          e.stopPropagation();
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
                                        size="xs"
                                        className="bg-transparent hover:bg-gray-100"
                                        icon="ArrowDown"
                                        disabled={
                                          idx === standaloneItems.length - 1
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
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
                              {(() => {
                                const meta =
                                  TYPE_META[
                                    (it as any).type as keyof typeof TYPE_META
                                  ] || TYPE_META.AULA;
                                const iconName =
                                  it.type === "PROVA"
                                    ? "FileText"
                                    : it.type === "ATIVIDADE"
                                    ? "Paperclip"
                                    : "GraduationCap";
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
                              <input
                                className="flex-1 bg-transparent outline-none text-sm cursor-text"
                                value={it.title}
                                onChange={(e) =>
                                  setItemTitle(it.id, e.target.value)
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
                    className="rounded-md border-2 border-dashed py-2 px-3 text-xs text-center"
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
                  className="rounded-lg border border-dashed p-6 text-sm text-gray-500"
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
                  Nenhum conteúdo adicionado. Arraste "Aula", "Prova",
                  "Atividade" ou "Módulo" da paleta para começar.
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
                        className="rounded-md border-2 border-dashed py-2 px-3 text-xs text-center"
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
                                            onClick={(e) => {
                                              e.stopPropagation();
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
                                            onClick={(e) => {
                                              e.stopPropagation();
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
                                    name={
                                      it.type === "PROVA"
                                        ? "FileText"
                                        : it.type === "ATIVIDADE"
                                        ? "Paperclip"
                                        : "GraduationCap"
                                    }
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
                                  <input
                                    className="flex-1 bg-transparent outline-none text-sm cursor-text"
                                    value={it.title}
                                    onChange={(e) =>
                                      setItemTitle(it.id, e.target.value)
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
                    {dragId?.startsWith("palette-MODULO") && (
                      <div
                        className="rounded-md border-2 border-dashed py-2 px-3 text-xs text-center"
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
                    <DragOverlay dropAnimation={{ duration: 150 }}>
                      {(() => {
                        if (!activeDragId || activeDragKind !== "item")
                          return null;
                        const it = standaloneItems.find(
                          (i) => i.id === activeDragId
                        );
                        if (!it) return null;
                        return (
                          <div className="pointer-events-none rounded-md border border-gray-300 bg-white shadow px-2 py-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Icon
                                name={
                                  it.type === "PROVA"
                                    ? "FileText"
                                    : it.type === "ATIVIDADE"
                                    ? "Paperclip"
                                    : "GraduationCap"
                                }
                                className="h-4 w-4 text-gray-500"
                              />
                              <span className="text-gray-700 truncate">
                                {it.title ||
                                  (it.type === "PROVA"
                                    ? "Prova"
                                    : it.type === "ATIVIDADE"
                                    ? "Atividade"
                                    : "Aula")}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </DragOverlay>
                  </DndContext>
                </>
              ))}

            {/* Fecha o DnDContext global após módulos e itens soltos */}
            <DragOverlay dropAnimation={{ duration: 150 }}>
              {(() => {
                if (!activeDragId || !activeDragKind) return null;
                if (activeDragKind === "module") {
                  const mod = modules.find((m) => m.id === activeDragId);
                  if (!mod) return null;
                  return (
                    <div className="pointer-events-none rounded-lg border border-gray-300 bg-white shadow-md px-3 py-2 text-sm">
                      <div className="text-gray-800 font-medium">Módulo</div>
                      <div className="text-gray-600 truncate">
                        {mod.title || "Sem título"}
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
                return (
                  <div className="pointer-events-none rounded-md border border-gray-300 bg-white shadow px-2 py-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={
                          it.type === "PROVA"
                            ? "FileText"
                            : it.type === "ATIVIDADE"
                            ? "Paperclip"
                            : "GraduationCap"
                        }
                        className="h-4 w-4 text-gray-500"
                      />
                      <span className="text-gray-700 truncate">
                        {it.title ||
                          (it.type === "PROVA"
                            ? "Prova"
                            : it.type === "ATIVIDADE"
                            ? "Atividade"
                            : "Aula")}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="space-y-4">
          {/* Paleta de componentes (lateral) */}
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Componentes
            </div>
            <div className="space-y-2">
              {/* Módulo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onDragStart={() => setDragId("palette-MODULO")}
                    onClick={addModule}
                    className="flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100 hover:cursor-pointer"
                  >
                    <Icon name="Boxes" className="h-4 w-4 text-gray-500" />{" "}
                    Módulo
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Clique ou arraste para adicionar
                </TooltipContent>
              </Tooltip>
              {/* Aula */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onClick={() => addToLastModuleAndEdit("AULA")}
                    onDragStart={(e) => {
                      setDragId("palette-AULA");
                      e.dataTransfer.setData("text/plain", "AULA");
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setHoverModuleId(null);
                    }}
                    className="flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100 hover:cursor-pointer"
                  >
                    <Icon
                      name="GraduationCap"
                      className="h-4 w-4 text-gray-500"
                    />{" "}
                    Aula
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Clique ou arraste para adicionar
                </TooltipContent>
              </Tooltip>
              {/* Atividade */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onClick={() => addToLastModuleAndEdit("ATIVIDADE")}
                    onDragStart={(e) => {
                      setDragId("palette-ATIVIDADE");
                      e.dataTransfer.setData("text/plain", "ATIVIDADE");
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setHoverModuleId(null);
                    }}
                    className="flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100 hover:cursor-pointer"
                  >
                    <Icon name="Paperclip" className="h-4 w-4 text-gray-500" />{" "}
                    Atividade
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Clique ou arraste para adicionar
                </TooltipContent>
              </Tooltip>
              {/* Prova */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onClick={() => addToLastModuleAndEdit("PROVA")}
                    onDragStart={(e) => {
                      setDragId("palette-PROVA");
                      e.dataTransfer.setData("text/plain", "PROVA");
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setHoverModuleId(null);
                    }}
                    className="flex cursor-grab items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 hover:bg-gray-100 hover:cursor-pointer"
                  >
                    <Icon name="FileText" className="h-4 w-4 text-gray-500" />{" "}
                    Prova
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Clique ou arraste para adicionar
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <ModuleEditorModal
            isOpen={isPanelOpen && selected?.kind === "module"}
            module={
              selected?.kind === "module"
                ? modules.find((m) => m.id === selected.id) || null
                : null
            }
            instructorOptions={instructorOptions}
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
            modalidade={modalidade}
            instructorOptions={instructorOptions}
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
        </div>
      </div>
    </div>
  );
}

export default BuilderManager;
