import type { SlideData } from "@/theme/website/components/slider/types";

export type SlideApiResponse = SlideData[];

export interface SlideBackendResponse {
  id: string;
  sliderName: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  orientacao: "DESKTOP" | "MOBILE" | string;
  status: "PUBLICADO" | "INATIVO" | string;
  ordem: number;
  ordemId?: string;
  ordemCriadoEm?: string;
  criadoEm: string;
  atualizadoEm?: string;
}
