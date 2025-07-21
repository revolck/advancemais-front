// src/theme/website/components/communication-highlights/constants/index.ts

import type { CommunicationData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_COMMUNICATION_DATA: CommunicationData = {
  textContent: {
    id: "communication-text",
    title: "Conexão Forte = Resultado Forte",
    paragraphs: [
      "De acordo com uma pesquisa recente (Front) realizada com mais de 1.100 profissionais, um dos principais padrões das equipes de alta performance é a comunicação aberta e de confiança.",
      "Estes times valorizam o tempo de cada um e possuem fortes habilidades de comunicação.",
      "Entendemos que o seu desafio é único e focamos na personalização de acordo com as necessidades de comunicação da sua equipe. Conheça nossas soluções que já ajudaram centenas de empresas a se comunicarem de forma estratégica e eficaz.",
    ],
    highlightText:
      "um dos principais padrões das equipes de alta performance é a comunicação aberta e de confiança.",
    citation: "(Front)",
    order: 1,
    isActive: true,
  },
  gallery: [
    {
      id: "gallery-1",
      imageUrl: "/images/home/banner_site_2.webp",
      alt: "Treinamento em comunicação empresarial",
      order: 1,
      isActive: true,
    },
    {
      id: "gallery-2",
      imageUrl: "/images/home/banner_site_3.webp",
      alt: "Workshop de desenvolvimento de equipes",
      order: 2,
      isActive: true,
    },
    {
      id: "gallery-3",
      imageUrl: "/images/home/banner_info.webp",
      alt: "Consultoria em comunicação estratégica",
      order: 3,
      isActive: true,
    },
    {
      id: "gallery-4",
      imageUrl: "/images/sobre/banner_about.webp",
      alt: "Resultados de alta performance",
      order: 4,
      isActive: true,
    },
  ],
};

/**
 * Configurações do componente
 */
export const COMMUNICATION_CONFIG = {
  api: {
    endpoint: "/api/communication/highlights",
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
