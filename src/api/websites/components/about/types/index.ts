export interface AboutApiResponse {
  src: string;
  title: string;
  description: string;
}

export interface AboutBackendResponse {
  imagemUrl: string;
  titulo: string;
  descricao: string;
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
