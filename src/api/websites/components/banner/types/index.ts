import type { BannerItem } from "@/theme/website/components/banners/types";

export type BannerApiResponse = BannerItem[];

export type BannerStatus = "PUBLICADO" | "RASCUNHO" | string;

export interface BannerBackendResponse {
  // ID da ordem (utilizado para reordenar e GET por ordem)
  id: string;
  // ID do recurso Banner (utilizado para PUT/DELETE)
  bannerId: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  status?: BannerStatus | boolean;
  ordem: number;
  ordemCriadoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CreateBannerPayload {
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  status?: BannerStatus | boolean;
  ordem?: number;
  imagem?: File;
}

export interface UpdateBannerPayload {
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  status?: BannerStatus | boolean;
  ordem?: number;
  imagem?: File;
}
