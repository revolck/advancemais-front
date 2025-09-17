// src/theme/website/components/pricing-plans/constants/index.ts

/**
 * Configurações do componente
 */
export const PRICING_CONFIG = {
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
  defaults: {
    buttonText: "Falar com um especialista",
    buttonUrl: "/contato",
    period: "mês",
    currency: "R$",
  },
} as const;

