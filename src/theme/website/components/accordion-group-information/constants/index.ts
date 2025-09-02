// src/theme/website/components/accordion-group-information/constants/index.ts

import type { AccordionSectionData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_ACCORDION_DATA: AccordionSectionData[] = [
  {
    id: "sobre-empresa",
    title: "Sobre a Empresa",
    description: "Conheça nossa história, missão, visão e valores.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    items: [
      {
        id: "missao",
        value: "missao",
        trigger: "Missão",
        content:
          "Nossa missão é democratizar o acesso ao conhecimento e impulsionar o crescimento profissional e empresarial.",
        order: 1,
        isActive: true,
      },
      {
        id: "visao",
        value: "visao",
        trigger: "Visão",
        content:
          "Ser referência em educação corporativa e consultoria empresarial no Brasil.",
        order: 2,
        isActive: true,
      },
      {
        id: "valores",
        value: "valores",
        trigger: "Valores",
        content:
          "Ética, inovação, excelência, compromisso com resultados e desenvolvimento humano.",
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
