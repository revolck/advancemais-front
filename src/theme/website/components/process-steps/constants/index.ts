// src/theme/website/components/process-steps/constants/index.ts

/**
 * Configurações do componente ProcessSteps
 */
export const PROCESS_CONFIG = {
  animation: {
    staggerDelay: 150, // Delay entre etapas
    duration: 600,
  },
  grid: {
    mobile: {
      columns: 1,
      gap: "2rem",
    },
    tablet: {
      columns: 2,
      gap: "2rem",
    },
    desktop: {
      columns: 3,
      gap: "2rem",
    },
  },
} as const;
