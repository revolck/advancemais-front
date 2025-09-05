export interface ConexaoForteBackendResponse {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl1?: string;
  imagemTitulo1?: string;
  imagemUrl2?: string;
  imagemTitulo2?: string;
  imagemUrl3?: string;
  imagemTitulo3?: string;
  imagemUrl4?: string;
  imagemTitulo4?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateConexaoFortePayload {
  titulo: string;
  descricao: string;
  imagemUrl1?: string;
  imagemTitulo1?: string;
  imagemUrl2?: string;
  imagemTitulo2?: string;
  imagemUrl3?: string;
  imagemTitulo3?: string;
  imagemUrl4?: string;
  imagemTitulo4?: string;
}

export interface UpdateConexaoFortePayload {
  titulo?: string;
  descricao?: string;
  imagemUrl1?: string;
  imagemTitulo1?: string;
  imagemUrl2?: string;
  imagemTitulo2?: string;
  imagemUrl3?: string;
  imagemTitulo3?: string;
  imagemUrl4?: string;
  imagemTitulo4?: string;
}
