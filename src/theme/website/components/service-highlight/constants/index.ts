// src/theme/website/components/service-highlight/constants/index.ts

import type { ServiceHighlightData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_SERVICE_HIGHLIGHT_DATA: ServiceHighlightData[] = [
  {
    id: "migration-advance",
    title: "Nós ajudamos você a migrar para a advance+",
    description:
      "Com a nossa plataforma você facilmente deixa tarefas chatas e repetitivas para trás com um sistema de recrutamento e seleção e foca no que mais importa em seu processo:",
    highlightText: "escolher as pessoas certas!",
    imageUrl: "/images/home/banner_site_2.webp",
    imageAlt: "Team working - Equipe trabalhando",
    benefits: [
      {
        id: "better-candidates",
        title: "Atenda melhor os candidatos",
        description:
          "Tenha ferramentas incríveis para gerenciar e se comunicar melhor com seus potenciais talentos.",
        order: 1,
      },
      {
        id: "productivity",
        title: "Ganhe Produtividade",
        description:
          "Atinga seus objetivos de recrutamento e seleção com menos esforço e otimize melhor seu tempo com nosso sistema.",
        order: 2,
      },
      {
        id: "centralize-info",
        title: "Centralize Informações",
        description:
          "Realize as atividades mais importantes de emails e planilhas num só lugar, de um jeito mais fácil e organizado.",
        order: 3,
      },
    ],
    order: 1,
    isActive: true,
  },
  {
    id: "business-solutions",
    title: "Soluções empresariais completas para seu negócio",
    description:
      "Oferecemos um conjunto abrangente de ferramentas e serviços que transformam a gestão de pessoas da sua empresa, desde o recrutamento até o desenvolvimento contínuo:",
    highlightText: "resultados mensuráveis e sustentáveis!",
    imageUrl: "/images/home/banner_site_3.webp",
    imageAlt: "Business solutions - Soluções empresariais",
    benefits: [
      {
        id: "smart-recruitment",
        title: "Recrutamento Inteligente",
        description:
          "Utilize inteligência artificial para identificar os melhores candidatos e acelerar seu processo seletivo.",
        order: 1,
      },
      {
        id: "data-analytics",
        title: "Análise de Dados",
        description:
          "Tenha insights poderosos sobre sua equipe e tome decisões estratégicas baseadas em dados reais.",
        order: 2,
      },
      {
        id: "continuous-development",
        title: "Desenvolvimento Contínuo",
        description:
          "Implemente programas de capacitação que mantêm sua equipe sempre atualizada e engajada.",
        order: 3,
      },
    ],
    order: 2,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const SERVICE_HIGHLIGHT_CONFIG = {
  api: {
    endpoint: "/api/service-highlight/sections",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 300, // Delay entre seções
    duration: 600,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 600px",
  },
} as const;
