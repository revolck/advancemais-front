export interface PlaninhasBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  icone1: string;
  titulo1: string;
  descricao1: string;
  icone2: string;
  titulo2: string;
  descricao2: string;
  icone3: string;
  titulo3: string;
  descricao3: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreatePlaninhasPayload {
  titulo: string;
  descricao: string;
  icone1: string;
  titulo1: string;
  descricao1: string;
  icone2: string;
  titulo2: string;
  descricao2: string;
  icone3: string;
  titulo3: string;
  descricao3: string;
}

export interface UpdatePlaninhasPayload {
  titulo?: string;
  descricao?: string;
  icone1?: string;
  titulo1?: string;
  descricao1?: string;
  icone2?: string;
  titulo2?: string;
  descricao2?: string;
  icone3?: string;
  titulo3?: string;
  descricao3?: string;
}

