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
  /**
   * ID do template (aula/avaliação) escolhido no modal.
   * - AULA: templateId de /api/v1/cursos/aulas?semTurma=true
   * - ATIVIDADE/PROVA: templateId de /api/v1/cursos/avaliacoes?semTurma=true
   */
  templateId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  instructorId?: string | null;
  instructorIds?: string[];
  // Preferir `obrigatoria` (API v1). Mantém `obrigatorio` por compatibilidade interna.
  obrigatoria?: boolean;
  obrigatorio?: boolean;
  recuperacaoFinal?: boolean;
  aulaId?: string | null;
  // Posição do item standalone (quando fora de módulo)
  // -1 = antes de todos, 0 = após módulo 0, 1 = após módulo 1, etc.
  afterModuleIndex?: number;
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
  items: BuilderItem[];
}

export interface BuilderData {
  modules: BuilderModule[];
  standaloneItems?: BuilderItem[]; // para itens fora de módulos (dinâmica)
}

export type BuilderTemplate = "MODULAR" | "DINAMICA" | "PADRAO";

export function getDefaultBuilder(template: BuilderTemplate): BuilderData {
  const aula = (n: number): BuilderItem => ({
    id: `aula-${n}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Aula ${n}`,
    type: "AULA",
    templateId: null,
    startDate: null,
    endDate: null,
    aulaId: null,
    instructorIds: [],
    obrigatoria: true,
  });
  const prova = (): BuilderItem => ({
    id: `prova-${Math.random().toString(36).slice(2, 7)}`,
    title: "Prova",
    type: "PROVA",
    templateId: null,
    startDate: null,
    endDate: null,
    instructorIds: [],
    obrigatoria: true,
    recuperacaoFinal: false,
  });

  if (template === "MODULAR") {
    return {
      modules: [
        { id: `mod-1`, title: "Módulo 1", items: [aula(1), prova()] },
      ],
      standaloneItems: [],
    };
  }

  if (template === "DINAMICA") {
    return {
      modules: [{ id: `mod-1`, title: "Módulo 1", items: [aula(1), prova()] }],
      standaloneItems: [aula(2)],
    };
  }

  // PADRAO
  return {
    modules: [],
    standaloneItems: [aula(1), prova()],
  };
}
