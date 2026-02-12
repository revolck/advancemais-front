export interface WebsiteModuleInfoResponse {
  message: string;
  version: string;
  timestamp: string;
  endpoints: {
    sobre: string;
    slider: string;
    banner: string;
    logoEnterprises: string;
    consultoria: string;
    recrutamento: string;
    sobreEmpresa: string;
    team: string;
    diferenciais: string;
    planinhas: string;
    advanceAjuda: string;
    recrutamentoSelecao: string;
    sistema: string;
    treinamentoCompany: string;
    treinamentosInCompany: string;
    headerPages: string;
    depoimentos: string;
    informacoesGerais: string;
    imagemLogin: string;
    scripts: string;
  };
  status?: string;
}

export interface WebsiteReorderPayload {
  ordem: number;
}

export type WebsiteSiteDataStatus =
  | "PUBLICADO"
  | "RASCUNHO"
  | "ALL"
  | "TODOS"
  | "true"
  | "false";

export type WebsiteSiteDataSection =
  | "sobre"
  | "slider"
  | "banner"
  | "logoEnterprises"
  | "consultoria"
  | "recrutamento"
  | "sobreEmpresa"
  | "team"
  | "diferenciais"
  | "planinhas"
  | "advanceAjuda"
  | "recrutamentoSelecao"
  | "sistema"
  | "treinamentoCompany"
  | "conexaoForte"
  | "treinamentosInCompany"
  | "headerPages"
  | "depoimentos"
  | "informacoesGerais"
  | "imagemLogin"
  | "scripts";

export interface GetWebsiteSiteDataParams {
  status?: WebsiteSiteDataStatus;
  sections?: WebsiteSiteDataSection[];
}

export interface WebsiteSiteDataResponse {
  statusFilter: string;
  sections: string[];
  generatedAt: string;
  data: Record<string, unknown>;
}
