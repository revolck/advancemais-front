export type BuilderItemType = "AULA" | "PROVA" | "ATIVIDADE";
export type ActivityType =
  | "IMAGEM"
  | "PDF"
  | "PPT"
  | "DOC"
  | "LINK"
  | "PLATAFORMA";

export interface BuilderItem {
  id: string;
  title: string;
  type: BuilderItemType;
  startDate?: string | null;
  endDate?: string | null;
  instructorId?: string | null;
  obrigatorio?: boolean;
  // Campos específicos para ATIVIDADE
  activityType?: ActivityType | null;
  platformActivityId?: string | null;
  fileUrl?: string | null;
  linkUrl?: string | null;
  // Campos específicos para AULA (baseado na modalidade)
  youtubeUrl?: string | null;
  meetUrl?: string | null;
  tipoLinkSemiPresencial?: "MEET" | "YOUTUBE" | null;
}

export interface BuilderModule {
  id: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  // suporte a um ou vários instrutores (mantém compat com API antiga)
  instructorId?: string | null;
  instructorIds?: string[];
  obrigatorio?: boolean;
  items: BuilderItem[];
}

export interface BuilderData {
  modules: BuilderModule[];
  standaloneItems?: BuilderItem[]; // para itens fora de módulos (dinâmica)
}

export type BuilderTemplate = "MODULARIZADA" | "DINAMICA" | "PADRAO";

export function getDefaultBuilder(template: BuilderTemplate): BuilderData {
  const aula = (n: number): BuilderItem => ({
    id: `aula-${n}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Aula ${n}`,
    type: "AULA",
    startDate: null,
    endDate: null,
  });
  const prova = (): BuilderItem => ({
    id: `prova-${Math.random().toString(36).slice(2, 7)}`,
    title: "Prova",
    type: "PROVA",
    startDate: null,
    endDate: null,
  });

  if (template === "MODULARIZADA") {
    return {
      modules: [
        { id: `mod-1`, title: "Módulo 1", items: [aula(1), aula(2)] },
        { id: `mod-2`, title: "Módulo 2", items: [aula(1), aula(2)] },
      ],
    };
  }

  if (template === "DINAMICA") {
    return {
      modules: [{ id: `mod-1`, title: "Módulo 1", items: [aula(1), aula(2)] }],
      standaloneItems: [aula(3), prova()],
    };
  }

  // PADRAO
  return {
    modules: [],
    standaloneItems: [aula(1), aula(2), aula(3)],
  };
}
