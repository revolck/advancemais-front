// src/theme/website/components/team-showcase/constants/index.ts

import type { TeamMemberData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_TEAM_DATA: TeamMemberData[] = [
  {
    id: "ceo",
    name: "Ana Carolina Silva",
    position: "CEO & Fundadora",
    imageUrl: "/images/team/ana-carolina.webp",
    imageAlt: "Ana Carolina Silva - CEO & Fundadora",
    order: 1,
    isActive: true,
  },
  {
    id: "cto",
    name: "Roberto Santos",
    position: "Diretor de Tecnologia",
    imageUrl: "/images/team/roberto-santos.webp",
    imageAlt: "Roberto Santos - Diretor de Tecnologia",
    order: 2,
    isActive: true,
  },
  {
    id: "marketing",
    name: "Fernanda Costa",
    position: "Gerente de Marketing",
    imageUrl: "/images/team/fernanda-costa.webp",
    imageAlt: "Fernanda Costa - Gerente de Marketing",
    order: 3,
    isActive: true,
  },
  {
    id: "rh",
    name: "Carlos Eduardo Oliveira",
    position: "Gerente de Recursos Humanos",
    imageUrl: "/images/team/carlos-oliveira.webp",
    imageAlt: "Carlos Eduardo Oliveira - Gerente de Recursos Humanos",
    order: 4,
    isActive: true,
  },
  {
    id: "designer",
    name: "Mariana Ribeiro",
    position: "UX/UI Designer",
    imageUrl: "/images/team/mariana-ribeiro.webp",
    imageAlt: "Mariana Ribeiro - UX/UI Designer",
    order: 5,
    isActive: true,
  },
  {
    id: "dev",
    name: "Lucas Ferreira",
    position: "Desenvolvedor Full Stack",
    imageUrl: "/images/team/lucas-ferreira.webp",
    imageAlt: "Lucas Ferreira - Desenvolvedor Full Stack",
    order: 6,
    isActive: true,
  },
  {
    id: "vendas",
    name: "Juliana Almeida",
    position: "Gerente de Vendas",
    imageUrl: "/images/team/juliana-almeida.webp",
    imageAlt: "Juliana Almeida - Gerente de Vendas",
    order: 7,
    isActive: true,
  },
  {
    id: "financeiro",
    name: "Pedro Henrique Lima",
    position: "Analista Financeiro",
    imageUrl: "/images/team/pedro-lima.webp",
    imageAlt: "Pedro Henrique Lima - Analista Financeiro",
    order: 8,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const TEAM_CONFIG = {
  api: {
    endpoint: "/api/team/members",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
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
