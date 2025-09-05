// src/theme/website/components/communication-highlights/constants/index.ts

// Sem dados mockados — a fonte é somente a API

/**
 * Configurações do componente
 */
export const COMMUNICATION_CONFIG = {
  api: {
    // Referência informativa; o hook usa a camada `src/api`.
    endpoint: "/api/website/conexao-forte",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 768px) 50vw, 25vw",
    placeholder: "blur",
  },
  animation: {
    staggerDelay: 100,
    duration: 300,
  },
  gallery: {
    columns: 2,
    gap: 32, // 8 * 4 = 32px
    aspectRatio: "4/3",
  },
} as const;
