import type { BuilderModule, BuilderData } from "../types";

/**
 * Hook com todas as ações de manipulação de módulos
 * Facilita reutilização e testes
 */
export function useModuleActions(
  value: BuilderData,
  onChange: (val: BuilderData) => void
) {
  const setModuleTitle = (modId: string, title: string) => {
    onChange({
      ...value,
      modules: value.modules.map((m) => (m.id === modId ? { ...m, title } : m)),
    });
  };

  const setModuleDates = (
    modId: string,
    startDate: string | null,
    endDate: string | null
  ) => {
    onChange({
      ...value,
      modules: value.modules.map((m) =>
        m.id === modId ? { ...m, startDate, endDate } : m
      ),
    });
  };

  const deleteModule = (modId: string) => {
    onChange({
      ...value,
      modules: value.modules.filter((m) => m.id !== modId),
    });
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const items = Array.from(value.modules);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    onChange({ ...value, modules: items });
  };

  const updateModule = (modId: string, updates: Partial<BuilderModule>) => {
    onChange({
      ...value,
      modules: value.modules.map((m) =>
        m.id === modId ? { ...m, ...updates } : m
      ),
    });
  };

  const addModule = (newModule: BuilderModule, index?: number) => {
    if (typeof index === "number") {
      const newModules = [...value.modules];
      newModules.splice(index, 0, newModule);
      onChange({ ...value, modules: newModules });
    } else {
      onChange({ ...value, modules: [...value.modules, newModule] });
    }
  };

  return {
    setModuleTitle,
    setModuleDates,
    deleteModule,
    moveModule,
    updateModule,
    addModule,
  };
}
