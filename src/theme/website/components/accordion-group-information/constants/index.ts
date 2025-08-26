// src/theme/website/components/accordion-group-information/constants/index.ts

import type { AccordionSectionData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_ACCORDION_DATA: AccordionSectionData[] = [
  {
    id: "sobre-empresa",
    title: "Transformamos desafios em oportunidades únicas",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    items: [
      {
        id: "nossa-historia",
        value: "nossa-historia",
        trigger: "Nossa História",
        content:
          "Fundada em 2014, a Advance+ nasceu com o propósito de transformar a educação e o desenvolvimento empresarial no Brasil. Ao longo dos anos, construímos uma trajetória sólida baseada na inovação, excelência e compromisso com nossos clientes. Nossa jornada é marcada por conquistas significativas e pela constante busca por soluções que realmente fazem a diferença na vida das pessoas e no crescimento das empresas.",
        order: 1,
        isActive: true,
      },
      {
        id: "missao",
        value: "missao",
        trigger: "Missão",
        content:
          "Nossa missão é democratizar o acesso ao conhecimento e impulsionar o crescimento profissional e empresarial através de soluções educacionais inovadoras e serviços de consultoria especializados. Buscamos formar profissionais capacitados e transformar organizações, contribuindo para um mercado de trabalho mais qualificado e empresas mais competitivas.",
        order: 2,
        isActive: true,
      },
      {
        id: "visao",
        value: "visao",
        trigger: "Visão",
        content:
          "Ser a principal referência em educação corporativa e consultoria empresarial no Brasil, reconhecida pela qualidade de nossos serviços, inovação pedagógica e impacto positivo na transformação de carreiras e organizações. Almejamos ser a ponte que conecta talentos às oportunidades e empresas ao sucesso sustentável.",
        order: 3,
        isActive: true,
      },
    ],
    order: 1,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const ACCORDION_CONFIG = {
  api: {
    endpoint: "/api/accordion/sections",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 300,
    duration: 600,
  },
  video: {
    autoplay: false,
    controls: true,
    aspectRatio: "16/9",
  },
  // Espaçamento para o header sticky
  stickyOffset: 110, // altura do header + margem
} as const;
