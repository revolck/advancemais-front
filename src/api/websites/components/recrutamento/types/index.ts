export interface RecrutamentoApiResponse {
  src: string;
  title: string;
  description: string;
  buttonUrl: string;
  buttonLabel: string;
}

export interface RecrutamentoBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  titulo: string;
  descricao: string;
  buttonUrl: string;
  buttonLabel: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RecrutamentoImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface RecrutamentoContentProps {
  title: string;
  description: string;
  buttonUrl: string;
  buttonLabel: string;
}

export interface CreateRecrutamentoPayload {
  titulo: string;
  descricao: string;
  buttonUrl: string;
  buttonLabel: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}

export interface UpdateRecrutamentoPayload {
  titulo?: string;
  descricao?: string;
  buttonUrl?: string;
  buttonLabel?: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}
