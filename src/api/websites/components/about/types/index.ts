export interface AboutApiResponse {
  src: string;
  title: string;
  description: string;
}

export interface AboutBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AboutImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AboutContentProps {
  title: string;
  description: string;
}

export interface CreateAboutPayload {
  titulo: string;
  descricao: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}

export interface UpdateAboutPayload {
  titulo?: string;
  descricao?: string;
  imagem?: File | Blob;
  imagemUrl?: string;
  imagemTitulo?: string;
}
