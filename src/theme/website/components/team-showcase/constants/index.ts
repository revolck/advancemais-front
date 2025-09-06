// src/theme/website/components/team-showcase/constants/index.ts

/**
 * Configurações do componente (sem detalhes de API; integração via src/api)
 */
export const TEAM_CONFIG = {
  animation: {
    staggerDelay: 100, // Delay entre membros
    duration: 400,
  },
  image: {
    quality: 95,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  },
  grid: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    },
  },
} as const;
