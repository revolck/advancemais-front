// src/theme/website/components/header-pages/constants/index.ts

import type { HeaderPageData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_HEADER_DATA: HeaderPageData[] = [
  {
    id: "sobre",
    title:
      "Capacitar hoje para transformar o amanhã, honrando nossa trajetória.",
    subtitle: "Nossa História",
    description:
      "Com excelência, a Advance transforma desafios em oportunidades, impulsionando talentos e empresas por meio de educação, recrutamento e soluções inovadoras para o crescimento no mercado alagoano.",
    buttonText: "Fale com nossos especialistas",
    buttonUrl: "/sobre/equipe",
    imageUrl: "/images/headers/sobre-header.webp",
    imageAlt: "Sobre a AdvanceMais - Nossa História",
    isActive: true,
    targetPages: ["/sobre"],
  },
  {
    id: "default",
    title: "Nossos Serviços",
    subtitle: "Soluções completas",
    description:
      "Descubra como podemos ajudar sua empresa a alcançar novos níveis de sucesso com nossos serviços especializados.",
    buttonText: "Conhecer serviços",
    buttonUrl: "/servicos",
    imageUrl: "/images/headers/default-header.webp",
    imageAlt: "Nossos Serviços - Soluções completas",
    isActive: true,
    targetPages: ["*"], // Fallback para qualquer página
  },
];

/**
 * Configurações do componente
 */
export const HEADER_CONFIG = {
  api: {
    endpoint: "/api/headers/pages",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  image: {
    width: 810,
    height: 360,
    quality: 90,
    priority: true,
    sizes: "(max-width: 1024px) 100vw, 55vw",
  },
  breadcrumbs: {
    separator: "/",
    homeLabel: "Página Inicial",
    homeUrl: "/",
  },
  responsive: {
    mobileBreakpoint: 768,
  },
} as const;

/**
 * Mapeamento de rotas para labels mais amigáveis nos breadcrumbs
 */
export const ROUTE_LABELS: Record<string, string> = {
  consultoria: "Consultoria",
  recrutamento: "Recrutamento",
  treinamento: "Treinamento",
  servicos: "Serviços",
  sobre: "Sobre Nós",
  contato: "Contato",
  blog: "Blog",
  cursos: "Cursos",
  certificados: "Certificados",
  processo: "Processo Seletivo",
  programas: "Programas",
};
