export type HeaderPage =
  | "SOBRE"
  | "HOME"
  | "SERVICOS"
  | "RECRUTAMENTO"
  | string;

export interface HeaderPageBackendResponse {
  id: string;
  subtitulo?: string;
  titulo: string;
  descricao?: string;
  imagemUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
  page: HeaderPage;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateHeaderPagePayload {
  subtitulo?: string;
  titulo: string;
  descricao?: string;
  imagemUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
  page: HeaderPage;
}

export interface UpdateHeaderPagePayload {
  subtitulo?: string;
  titulo?: string;
  descricao?: string;
  imagemUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
  page?: HeaderPage;
}

