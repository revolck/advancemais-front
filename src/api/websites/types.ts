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

