// src/theme/website/components/accordion-group-information/constants/index.ts

// Sem mock data; fonte é a API

/**
 * Configurações do componente
 */
export const ACCORDION_CONFIG = {
  animation: {
    staggerDelay: 300,
    duration: 600,
  },
  video: {
    autoplay: false,
    controls: true,
    aspectRatio: "16/9",
  },
  // Espaçamento para o header sticky
  stickyOffset: 110, // altura do header + margem
} as const;
