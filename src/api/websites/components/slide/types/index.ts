import type { SlideData } from "@/theme/website/components/slider/types";

export type SlideApiResponse = SlideData[];

export interface SlideBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  ordem: number;
}
