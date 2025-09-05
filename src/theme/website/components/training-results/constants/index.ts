// src/theme/website/components/training-results/constants/index.ts

// Nenhum dado mockado aqui — a fonte será somente a API
// Mantemos apenas as configurações do componente abaixo.

/**
 * Configurações do componente
 */
export const TRAINING_RESULTS_CONFIG = {
  api: {
    // Endpoint não é usado diretamente aqui. O hook consome a camada `src/api`.
    // Mantido por compatibilidade de tipo/rastreabilidade.
    endpoint: "/api/website/treinamentos-in-company",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 100, // Delay entre cards
    duration: 400,
  },
  grid: {
    mobile: "grid-cols-1",
    tablet: "sm:grid-cols-2",
    desktop: "lg:grid-cols-5",
  },
  defaultTitle: "O TREINAMENTO",
  defaultHighlight: "IN COMPANY",
  defaultSuffix: "É IDEAL PARA",
} as const;
