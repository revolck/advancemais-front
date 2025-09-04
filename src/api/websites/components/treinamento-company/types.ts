export interface TreinamentoCompanyBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1: string;
  titulo2: string;
  titulo3: string;
  titulo4: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateTreinamentoCompanyPayload {
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1: string;
  titulo2: string;
  titulo3: string;
  titulo4: string;
}

export interface UpdateTreinamentoCompanyPayload {
  titulo?: string;
  descricao?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1?: string;
  titulo2?: string;
  titulo3?: string;
  titulo4?: string;
}
