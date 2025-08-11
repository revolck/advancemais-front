import type { BannerItem } from "@/theme/website/components/banners/types";

export type BannerApiResponse = BannerItem[];

export interface BannerBackendResponse {
  id: string;
  imagemUrl: string;
  imagemTitulo: string;
  link?: string;
  ordem: number;
}
