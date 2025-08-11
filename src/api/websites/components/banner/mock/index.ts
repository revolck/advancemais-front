import type { BannerItem } from "@/theme/website/components/banners/types";

export const bannerMockData: BannerItem[] = [
  {
    id: "1",
    imagemUrl: "/images/home/banner_produtividade.webp",
    linkUrl: "/produtividade",
    position: 1,
    alt: "Banner Produtividade - Aumente sua eficiência operacional",
  },
  {
    id: "2",
    imagemUrl: "/images/home/banner_custos.webp",
    linkUrl: "/custos",
    position: 2,
    alt: "Banner Custos - Reduza despesas e otimize recursos",
  },
  {
    id: "3",
    imagemUrl: "/images/home/banner_gestao.webp",
    linkUrl: "/gestao",
    position: 3,
    alt: "Banner Gestão - Simplifique sua administração",
  },
  {
    id: "4",
    imagemUrl: "/images/home/banner_vendas.webp",
    linkUrl: "/vendas",
    position: 4,
    alt: "Banner Vendas - Maximize seus resultados comerciais",
  },
  {
    id: "5",
    imagemUrl: "/images/home/banner_crescimento.webp",
    linkUrl: "/crescimento",
    position: 5,
    alt: "Banner Crescimento - Escale seu negócio com segurança",
  },
];

export async function getBannerDataMock(): Promise<BannerItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return bannerMockData;
}
