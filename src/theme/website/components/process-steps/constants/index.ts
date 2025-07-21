// src/theme/website/components/process-steps/constants/index.ts

import type { ProcessSectionData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_PROCESS_DATA: ProcessSectionData = {
  id: "recruitment-process",
  subtitle: "Como Funciona?",
  title: "Feito para ser simples!",
  description:
    "Você não precisa ser um expert para utilizar o nosso sistema de recrutamento.",
  steps: [
    {
      id: "step-1",
      number: 1,
      title: "Crie a conta da sua Empresa",
      description: "Cadastre sua empresa e depois insira outros recrutadores.",
      icon: "Building2",
      order: 1,
      isActive: true,
    },
    {
      id: "step-2",
      number: 2,
      title: "Publique sua Primeira Vaga",
      description: "Em menos de 5 minutos você insere os dados das suas vagas.",
      icon: "FileText",
      order: 2,
      isActive: true,
    },
    {
      id: "step-3",
      number: 3,
      title: "Receba seus Candidatos",
      description: "Tudo estará pronto para que seus talentos se cadastrem.",
      icon: "Users",
      order: 3,
      isActive: true,
    },
  ],
};

/**
 * Configurações do componente
 */
export const PROCESS_CONFIG = {
  api: {
    endpoint: "/api/process/steps",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
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
