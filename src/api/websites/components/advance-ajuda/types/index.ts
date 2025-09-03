export interface AdvanceAjudaBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1: string;
  descricao1: string;
  titulo2: string;
  descricao2: string;
  titulo3: string;
  descricao3: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateAdvanceAjudaPayload {
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1: string;
  descricao1: string;
  titulo2: string;
  descricao2: string;
  titulo3: string;
  descricao3: string;
}

export interface UpdateAdvanceAjudaPayload {
  titulo?: string;
  descricao?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1?: string;
  descricao1?: string;
  titulo2?: string;
  descricao2?: string;
  titulo3?: string;
  descricao3?: string;
}
