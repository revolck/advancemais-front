import type { BuilderItem, BuilderData } from "../types";

/**
 * Hook com todas as ações de manipulação de itens (aulas/provas/atividades)
 * Facilita reutilização e testes
 */
export function useItemActions(
  value: BuilderData,
  onChange: (val: BuilderData) => void
) {
  const setItemTitle = (itemId: string, title: string) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => ({
        ...m,
        items: m.items.map((it) => (it.id === itemId ? { ...it, title } : it)),
      })),
      standaloneItems: (value.standaloneItems || []).map((it) =>
        it.id === itemId ? { ...it, title } : it
      ),
    });
  };

  const setItemDates = (
    itemId: string,
    startDate: string | null,
    endDate: string | null
  ) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => ({
        ...m,
        items: m.items.map((it) =>
          it.id === itemId ? { ...it, startDate, endDate } : it
        ),
      })),
      standaloneItems: (value.standaloneItems || []).map((it) =>
        it.id === itemId ? { ...it, startDate, endDate } : it
      ),
    });
  };

  const deleteItem = (itemId: string) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => ({
        ...m,
        items: m.items.filter((it) => it.id !== itemId),
      })),
      standaloneItems: (value.standaloneItems || []).filter(
        (it) => it.id !== itemId
      ),
    });
  };

  const moveItem = (moduleId: string, fromIndex: number, toIndex: number) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const items = Array.from(m.items);
        const [reorderedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, reorderedItem);
        return { ...m, items };
      }),
    });
  };

  const updateItem = (itemId: string, updates: Partial<BuilderItem>) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => ({
        ...m,
        items: m.items.map((it) =>
          it.id === itemId ? { ...it, ...updates } : it
        ),
      })),
      standaloneItems: (value.standaloneItems || []).map((it) =>
        it.id === itemId ? { ...it, ...updates } : it
      ),
    });
  };

  const addItemToModule = (moduleId: string, newItem: BuilderItem) => {
    onChange({
      ...value,
      modules: value.modules.map((m) =>
        m.id === moduleId ? { ...m, items: [...m.items, newItem] } : m
      ),
    });
  };

  const addStandaloneItem = (newItem: BuilderItem) => {
    onChange({
      ...value,
      standaloneItems: [...(value.standaloneItems || []), newItem],
    });
  };

  return {
    setItemTitle,
    setItemDates,
    deleteItem,
    moveItem,
    updateItem,
    addItemToModule,
    addStandaloneItem,
  };
}
