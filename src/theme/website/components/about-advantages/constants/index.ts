// src/theme/website/components/about-advantages/constants/index.ts

import { websiteRoutes } from "@/api/routes";

/**
 * Configurações do componente
 */
export const ABOUT_ADVANTAGES_CONFIG = {
  api: {
    endpoint: websiteRoutes.diferenciais.list(),
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 100,
    duration: 600,
  },
} as const;
