export interface TreinamentosInCompanyBackendResponse {
  id: string;
  titulo: string;
  icone1?: string;
  descricao1: string;
  icone2?: string;
  descricao2: string;
  icone3?: string;
  descricao3: string;
  icone4?: string;
  descricao4: string;
  icone5?: string;
  descricao5: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateTreinamentosInCompanyPayload {
  titulo: string;
  icone1: string;
  descricao1: string;
  icone2: string;
  descricao2: string;
  icone3: string;
  descricao3: string;
  icone4: string;
  descricao4: string;
  icone5: string;
  descricao5: string;
}

export interface UpdateTreinamentosInCompanyPayload {
  titulo?: string;
  icone1?: string;
  descricao1?: string;
  icone2?: string;
  descricao2?: string;
  icone3?: string;
  descricao3?: string;
  icone4?: string;
  descricao4?: string;
  icone5?: string;
  descricao5?: string;
}

