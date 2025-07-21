// src/theme/website/components/pricing-plans/constants/index.ts

import type { PricingPlanData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_PRICING_DATA: PricingPlanData[] = [
  {
    id: "inicial",
    title: "Inicial",
    iconName: "Briefcase",
    price: "49,99",
    description: "Comece a recrutar com eficiência",
    features: [
      "3 vagas ativas",
      "30 dias de divulgação",
      "Acesso a candidatos qualificados",
      "Painel de controle básico",
    ],
    isPopular: false,
    isActive: true,
    order: 1,
    buttonText: "Assinar plano",
    buttonUrl: "/checkout?plano=inicial",
    period: "mês",
    currency: "R$",
  },
  {
    id: "intermediario",
    title: "Intermediário",
    iconName: "Trophy",
    price: "74,99",
    description: "Amplie seu alcance de recrutamento",
    features: [
      "10 vagas ativas",
      "30 dias de divulgação",
      "Acesso a candidatos qualificados",
      "Painel de controle básico",
    ],
    isPopular: false,
    isActive: true,
    order: 2,
    buttonText: "Assinar plano",
    buttonUrl: "/checkout?plano=intermediario",
    period: "mês",
    currency: "R$",
  },
  {
    id: "avancado",
    title: "Avançado",
    iconName: "Crown",
    price: "99,99",
    description: "Solução completa para grandes equipes",
    features: [
      "20 vagas ativas",
      "30 dias de divulgação",
      "Acesso a candidatos qualificados",
      "Painel de controle básico",
    ],
    isPopular: true,
    isActive: true,
    order: 3,
    buttonText: "Assinar plano",
    buttonUrl: "/checkout?plano=avancado",
    period: "mês",
    currency: "R$",
  },
  {
    id: "destaque",
    title: "Destaque",
    iconName: "Rocket",
    price: "199,99",
    description: "Recrutamento sem limites",
    features: [
      "Vagas ilimitadas",
      "30 dias de divulgação",
      "Acesso a candidatos qualificados",
      "Painel de controle avançado",
      "1 vaga em destaque",
    ],
    isPopular: false,
    isActive: true,
    order: 4,
    buttonText: "Assinar plano",
    buttonUrl: "/checkout?plano=destaque",
    period: "mês",
    currency: "R$",
  },
];

/**
 * Configurações do componente
 */
export const PRICING_CONFIG = {
  api: {
    endpoint: "/api/pricing/plans",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 100, // Delay entre cards
    duration: 600,
  },
  icons: {
    defaultSize: 20,
    fallbackIcon: "Package",
  },
  grid: {
    mobile: 1, // colunas no mobile
    tablet: 2, // colunas no tablet
    desktop: 4, // colunas no desktop
  },
} as const;

/**
 * Mapeamento de ícones disponíveis
 */
export const ICON_MAPPING = {
  Briefcase: "Briefcase",
  Trophy: "Trophy",
  Crown: "Crown",
  Rocket: "Rocket",
  Package: "Package",
  Star: "Star",
  Zap: "Zap",
  Shield: "Shield",
  Target: "Target",
  Award: "Award",
} as const;
