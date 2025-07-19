// src/theme/website/components/business-group-information/constants/index.ts

import type { BusinessSectionData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_BUSINESS_DATA: BusinessSectionData[] = [
  {
    id: "consultoria",
    title: "Conheça nosso serviço de Consultoria Empresarial",
    description:
      "O segredo para uma empresa de sucesso está em decisões estratégicas bem fundamentadas. A Advance+ oferece consultoria personalizada para auxiliar no crescimento sustentável e inovação do seu negócio.",
    buttonLabel: "Saiba mais",
    buttonUrl: "/consultoria",
    imageUrl: "/images/home/banner_site_2.webp",
    imageAlt: "Conheça nosso serviço de Consultoria Empresarial",
    reverse: false,
    order: 1,
    isActive: true,
  },
  {
    id: "recrutamento",
    title: "Conheça nosso serviço de Recrutamento & Seleção",
    description:
      "O segredo para uma empresa de sucesso está em decisões estratégicas bem fundamentadas. A Advance+ oferece consultoria personalizada para auxiliar no crescimento sustentável e inovação do seu negócio.",
    buttonLabel: "Saiba mais",
    buttonUrl: "/recrutamento",
    imageUrl: "/images/home/banner_site_3.webp",
    imageAlt: "Conheça nosso serviço de Recrutamento & Seleção",
    reverse: true,
    order: 2,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const BUSINESS_CONFIG = {
  api: {
    endpoint: "/api/business/sections",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 200, // Delay entre seções
    duration: 600,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 50vw",
    placeholder: "blur",
  },
} as const;
