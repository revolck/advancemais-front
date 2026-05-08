import type { SlideData } from "@/theme/website/components/slider/types";

export type SlideApiResponse = SlideData[];

export type SliderOrientation = "DESKTOP" | "TABLET_MOBILE";
export type WebsiteStatus = "PUBLICADO" | "RASCUNHO";

export interface SlideBackendResponse {
  id: string;
  // ID do recurso de slider (utilizado para PUT/DELETE)
  sliderId?: string;
  sliderName?: string;
  titulo?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  orientacao?: SliderOrientation | string;
  status?: WebsiteStatus | string | boolean;
  ordem?: number;
  ordemId?: string;
  ordemCriadoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  slider?: Partial<SlideBackendResponse>;
  [key: string]: unknown;
}

export interface CreateSliderPayload {
  sliderName: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  orientacao: SliderOrientation;
  status: WebsiteStatus | boolean;
  ordem?: number;
  imagem?: File;
}

export interface UpdateSliderPayload {
  sliderName?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  orientacao?: SliderOrientation;
  status?: WebsiteStatus | boolean;
  ordem?: number;
  imagem?: File;
}
