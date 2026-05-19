import type { BuilderData } from "@/components/ui/custom/builder-manager/types";

type StructureLike = Partial<BuilderData> & {
  modulos?: Array<{ items?: unknown[]; itens?: unknown[] }>;
  itensAvulsos?: unknown[];
  itens?: unknown[];
};

export const TURMA_ESTRUTURA_PUBLICACAO_MESSAGE =
  "Turma sem estrutura: voce pode publicar e receber inscricoes, mas ela so iniciara quando houver pelo menos 1 item na estrutura.";

export interface TurmaEstruturaResumo {
  itemCount: number;
  modulesCount: number;
  standaloneItemsCount: number;
}

export function getTurmaEstruturaResumo(
  estrutura?: StructureLike | null,
): TurmaEstruturaResumo {
  const modules = Array.isArray(estrutura?.modules)
    ? estrutura.modules
    : Array.isArray(estrutura?.modulos)
      ? estrutura.modulos
      : [];

  const standaloneItems = Array.isArray(estrutura?.standaloneItems)
    ? estrutura.standaloneItems
    : Array.isArray(estrutura?.itensAvulsos)
      ? estrutura.itensAvulsos
      : Array.isArray(estrutura?.itens)
        ? estrutura.itens
        : [];

  const moduleItemsCount = modules.reduce((total, module) => {
    const legacyItems = (module as { itens?: unknown[] }).itens;
    const items: unknown[] = Array.isArray(module?.items)
      ? module.items
      : Array.isArray(legacyItems)
        ? legacyItems
        : [];

    return total + items.length;
  }, 0);

  return {
    itemCount: moduleItemsCount + standaloneItems.length,
    modulesCount: modules.length,
    standaloneItemsCount: standaloneItems.length,
  };
}

export function getTurmaEstruturaItemCount(
  estrutura?: StructureLike | null,
): number {
  return getTurmaEstruturaResumo(estrutura).itemCount;
}

export function isTurmaStatusPublicado(status?: string | null): boolean {
  return String(status ?? "").toUpperCase() === "PUBLICADO";
}
