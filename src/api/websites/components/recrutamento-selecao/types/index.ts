export interface RecrutamentoSelecaoBackendResponse {
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

export interface CreateRecrutamentoSelecaoPayload {
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1: string;
  titulo2: string;
  titulo3: string;
  titulo4: string;
}

export interface UpdateRecrutamentoSelecaoPayload {
  titulo?: string;
  descricao?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  titulo1?: string;
  titulo2?: string;
  titulo3?: string;
  titulo4?: string;
}
