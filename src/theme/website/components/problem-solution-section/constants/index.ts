// src/theme/website/components/problem-solution-section/constants/index.ts

import type { SectionData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_SECTION_DATA: SectionData = {
  id: "recruitment-problems",
  mainTitle: "Você ainda recruta com emails e planilhas?",
  mainDescription:
    "O esforço e a boa vontade do recrutador têm um limite claro e acabam criando problemas e desafios relevantes. Simplifique seus processos e alcance resultados melhores com as ferramentas certas.",
  problems: [
    {
      id: "desorganization",
      icon: "Activity",
      iconColor: "text-red-500",
      title: "Sensação de Desorganização",
      description:
        "Se sentir desorganizado com a avalanche de demandas e informações afeta diretamente o desempenho do negócio.",
      order: 1,
      isActive: true,
    },
    {
      id: "repetitive-effort",
      icon: "Target",
      iconColor: "text-blue-600",
      title: "Esforço Repetitivo",
      description:
        "Tarefas manuais travam o bom uso do seu tempo e não te permite focar no que é essencial.",
      order: 2,
      isActive: true,
    },
    {
      id: "poor-results",
      icon: "Database",
      iconColor: "text-red-500",
      title: "Resultados Insatisfatórios",
      description:
        "Recrutamento manual gera atrasos que impedem seu negócio de crescer na velocidade que ele poderia.",
      order: 3,
      isActive: true,
    },
    {
      id: "lack-control",
      icon: "AlertTriangle",
      iconColor: "text-orange-500",
      title: "Falta de Controle",
      description:
        "Sem visibilidade dos processos, fica impossível identificar gargalos e otimizar resultados.",
      order: 4,
      isActive: true,
    },
  ],
  imageUrl: "/images/home/recruitment-problems.webp",
  imageAlt: "Problemas do recrutamento manual",
  isActive: true,
};

/**
 * Configurações do componente
 */
export const PROBLEM_SOLUTION_CONFIG = {
  api: {
    endpoint: "/api/problems/recruitment",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 150, // Delay entre cards
    duration: 600,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
  skeleton: {
    // Quantidade de cards placeholder exibidos durante o loading
    cardsCount: 3,
  },
  emptyState: {
    // Ícone padrão quando não há dados
    icon: "FileSpreadsheet",
    // Título destacado do empty state
    title: "Sem conteúdos de Planilhas publicados",
    // Mensagem auxiliar para orientar o usuário
    message:
      "Cadastre em Website → Planinhas no painel para aparecer aqui.",
    // Rótulo do botão de ação
    buttonLabel: "Recarregar",
  },
} as const;
