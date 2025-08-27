export interface ConsultoriaApiResponse {
  src: string;
  title: string;
  description: string;
  buttonUrl: string;
  buttonLabel: string;
}

export interface ConsultoriaBackendResponse {
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

export interface ConsultoriaImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ConsultoriaContentProps {
  title: string;
  description: string;
  buttonUrl: string;
  buttonLabel: string;
}

export interface CreateConsultoriaPayload {
  titulo: string;
  descricao: string;
  buttonUrl: string;
  buttonLabel: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}

export interface UpdateConsultoriaPayload {
  titulo?: string;
  descricao?: string;
  buttonUrl?: string;
  buttonLabel?: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}
