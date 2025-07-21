// src/theme/website/components/training-results/constants/index.ts

import type { TrainingResultData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_TRAINING_RESULTS: TrainingResultData[] = [
  {
    id: "opportunities",
    title: "Enxergar novas oportunidades nos processos",
    iconName: "Settings",
    color: "text-red-600",
    order: 1,
    isActive: true,
  },
  {
    id: "rethink",
    title: "Repensar como o trabalho atual é feito",
    iconName: "FileText",
    color: "text-red-600",
    order: 2,
    isActive: true,
  },
  {
    id: "problem-solving",
    title: "Aprender como resolver problemas",
    iconName: "PieChart",
    color: "text-red-600",
    order: 3,
    isActive: true,
  },
  {
    id: "apply-knowledge",
    title: "Aplicar conhecimento em um caso real da empresa",
    iconName: "BarChart",
    color: "text-red-600",
    order: 4,
    isActive: true,
  },
  {
    id: "challenge-results",
    title: "Desafiar os resultados da empresa",
    iconName: "TrendingUp",
    color: "text-red-600",
    order: 5,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const TRAINING_RESULTS_CONFIG = {
  api: {
    endpoint: "/api/training/results",
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
