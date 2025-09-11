export interface LoginImageBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginImageItem {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string | null;
}

export interface CreateLoginImagePayload {
  imagem?: File;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
}

export type UpdateLoginImagePayload = CreateLoginImagePayload;
