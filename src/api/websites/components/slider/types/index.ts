import type { SlideData } from "@/theme/website/components/slider/types";

export type SlideApiResponse = SlideData[];

export type SliderOrientation = "DESKTOP" | "TABLET_MOBILE";
export type SliderStatus = "PUBLICADO" | "RASCUNHO";

export interface SlideBackendResponse {
  id: string;
  sliderName: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  orientacao: SliderOrientation | string;
  status: SliderStatus | string;
  ordem: number;
  ordemId?: string;
  ordemCriadoEm?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface CreateSliderPayload {
  sliderName: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  orientacao: SliderOrientation;
  status: SliderStatus;
  ordem?: number;
  imagem?: File;
}

export interface UpdateSliderPayload {
  sliderName?: string;
  imagemUrl?: string;
  imagemTitulo?: string;
  link?: string;
  orientacao?: SliderOrientation;
  status?: SliderStatus;
  ordem?: number;
  imagem?: File;
}
