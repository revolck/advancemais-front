export interface DiferenciaisBackendResponse {
  id: string;
  icone1: string;
  titulo1: string;
  descricao1: string;
  icone2: string;
  titulo2: string;
  descricao2: string;
  icone3: string;
  titulo3: string;
  descricao3: string;
  icone4: string;
  titulo4: string;
  descricao4: string;
  titulo: string;
  descricao: string;
  botaoUrl: string;
  botaoLabel: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateDiferenciaisPayload {
  icone1: string;
  titulo1: string;
  descricao1: string;
  icone2: string;
  titulo2: string;
  descricao2: string;
  icone3: string;
  titulo3: string;
  descricao3: string;
  icone4: string;
  titulo4: string;
  descricao4: string;
  titulo: string;
  descricao: string;
  botaoUrl: string;
  botaoLabel: string;
}

export interface UpdateDiferenciaisPayload {
  icone1?: string;
  titulo1?: string;
  descricao1?: string;
  icone2?: string;
  titulo2?: string;
  descricao2?: string;
  icone3?: string;
  titulo3?: string;
  descricao3?: string;
  icone4?: string;
  titulo4?: string;
  descricao4?: string;
  titulo?: string;
  descricao?: string;
  botaoUrl?: string;
  botaoLabel?: string;
}
