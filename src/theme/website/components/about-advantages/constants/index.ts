// src/theme/website/components/about-advantages/constants/index.ts

import type { AboutAdvantagesApiData } from "../types";
import { websiteRoutes } from "@/api/routes";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_ABOUT_ADVANTAGES_DATA: AboutAdvantagesApiData = {
  whyChoose: {
    id: "why-choose",
    title: "Por que escolher Advance+?",
    description:
      "Oferecemos soluções inovadoras e personalizadas que transformam desafios em oportunidades reais de crescimento para sua empresa.",
    buttonText: "Conheça nossos serviços",
    buttonUrl: "/servicos",
    isActive: true,
  },
  aboutSection: {
    id: "about-section",
    title: "Sobre a Advance+",
    paragraphs: [
      "A Advance+ é uma empresa especializada em soluções de gestão de pessoas e tecnologia, com foco em resultados que impulsionam o crescimento sustentável dos nossos clientes.",
      "Com anos de experiência no mercado, desenvolvemos metodologias próprias que combinam inovação tecnológica com expertise em recursos humanos, oferecendo um serviço diferenciado e personalizado.",
      "Nossa missão é conectar talentos e tecnologia para criar soluções que geram valor real para empresas de todos os portes, sempre com foco na excelência e na satisfação do cliente.",
    ],
    imageUrl: "/images/home/about-advantages.webp",
    imageAlt: "Sobre a Advance+ - Transformando desafios em oportunidades",
    overlayTitle: "Transformamos desafios em oportunidades reais.",
    overlayDescription:
      "Descubra como podemos conectar talentos, transformar desafios em oportunidades e criar soluções que impulsionam resultados.",
    overlayButtonText: "Solicitar Consultoria",
    overlayButtonUrl: "/consultoria",
    isActive: true,
  },
  advantageCards: [
    {
      id: "expertise",
      icon: "Award",
      title: "Expertise Comprovada",
      description:
        "Anos de experiência no mercado com resultados comprovados em gestão de pessoas e tecnologia.",
      order: 1,
      isActive: true,
    },
    {
      id: "innovation",
      icon: "Lightbulb",
      title: "Inovação Constante",
      description:
        "Metodologias próprias que combinam as melhores práticas com soluções tecnológicas avançadas.",
      order: 2,
      isActive: true,
    },
    {
      id: "personalization",
      icon: "Target",
      title: "Soluções Personalizadas",
      description:
        "Cada projeto é único. Desenvolvemos estratégias específicas para atender suas necessidades.",
      order: 3,
      isActive: true,
    },
    {
      id: "support",
      icon: "Users",
      title: "Suporte Dedicado",
      description:
        "Equipe especializada disponível para garantir o sucesso da implementação e resultados.",
      order: 4,
      isActive: true,
    },
  ],
};

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
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
} as const;
