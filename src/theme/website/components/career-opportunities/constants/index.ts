// src/theme/website/components/career-opportunities/constants/index.ts

/**
 * Configurações do componente de oportunidades de carreira
 */
export const CAREER_CONFIG = {
  api: {
    endpoint: "/api/jobs",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  pagination: {
    defaultItemsPerPage: 10,
    maxItemsPerPage: 50,
  },
  animation: {
    staggerDelay: 100,
    duration: 300,
  },
  search: {
    debounceDelay: 300,
    minSearchLength: 2,
  },
  sorting: {
    options: [
      { value: "recent", label: "Mais recente" },
      { value: "relevance", label: "Mais relevante" },
      { value: "salary_high", label: "Maior salário" },
      { value: "salary_low", label: "Menor salário" },
      { value: "name_az", label: "Nome (A-Z)" },
      { value: "name_za", label: "Nome (Z-A)" },
    ],
  },
} as const;

/**
 * Mapeamento de ícones para modalidades e tipos de contrato
 */
export const ICON_MAPPING = {
  modality: {
    Remoto: "Monitor",
    Presencial: "Building2",
    Híbrido: "Zap",
  },
  contractType: {
    CLT: "Briefcase",
    PJ: "User",
    Estágio: "GraduationCap",
  },
} as const;
