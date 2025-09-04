import type { ServiceBenefitsData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_SERVICE_BENEFITS_DATA: ServiceBenefitsData[] = [
  {
    id: "recrutamento-selecao",
    title: "Conheça nosso serviço de Recrutamento & Seleção",
    description:
      "O segredo para uma empresa de sucesso está em talentos excepcionais. A Advance+ auxilia sua empresa a recrutar os melhores profissionais de forma descomplicada, permitindo que você se concentre no que realmente importa.",
    imageUrl: "/images/home/banner_site_3.webp",
    imageAlt: "Equipe trabalhando em recrutamento e seleção",
    benefits: [
      {
        id: "qualidade-equipe",
        text: "Aumente a qualidade da sua equipe.",
        gradientType: "secondary",
        order: 1,
        isActive: true,
      },
      {
        id: "tempo-contratacao",
        text: "Reduza o tempo na contratação.",
        gradientType: "primary",
        order: 2,
        isActive: true,
      },
      {
        id: "recrutadores-experientes",
        text: "Recrutadores experientes e especialistas na área.",
        gradientType: "secondary",
        order: 3,
        isActive: true,
      },
      {
        id: "garantia-reposicao",
        text: "Garantia de reposição.",
        gradientType: "primary",
        order: 4,
        isActive: true,
      },
    ],
    order: 1,
    isActive: true,
  },
  {
    id: "consultoria-empresarial",
    title: "Conheça nosso serviço de Consultoria Empresarial",
    description:
      "Transforme sua empresa com estratégias personalizadas. Nossa consultoria oferece soluções inovadoras para otimizar processos, aumentar produtividade e acelerar o crescimento do seu negócio.",
    imageUrl: "/images/home/banner_site_2.webp",
    imageAlt: "Consultoria empresarial em ação",
    benefits: [
      {
        id: "estrategias-personalizadas",
        text: "Estratégias personalizadas para seu negócio.",
        gradientType: "secondary",
        order: 1,
        isActive: true,
      },
      {
        id: "otimizacao-processos",
        text: "Otimização de processos operacionais.",
        gradientType: "primary",
        order: 2,
        isActive: true,
      },
      {
        id: "aumento-produtividade",
        text: "Aumento comprovado de produtividade.",
        gradientType: "secondary",
        order: 3,
        isActive: true,
      },
      {
        id: "consultores-especializados",
        text: "Consultores especializados e experientes.",
        gradientType: "primary",
        order: 4,
        isActive: true,
      },
    ],
    order: 2,
    isActive: true,
  },
];

/**
 * Configurações do componente
 */
export const SERVICE_BENEFITS_CONFIG = {
  animation: {
    staggerDelay: 150, // Delay entre benefícios
    duration: 400,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
  gradients: {
    primary: {
      background:
        "linear-gradient(90deg, rgba(0, 25, 86, 0.14) 0%, rgba(0, 25, 86, 0) 100%)",
      color: "#001956",
      circleColor: "bg-[#001956]", // primary color
    },
    secondary: {
      background:
        "linear-gradient(90deg, rgba(255, 31, 41, 0.14) 0%, rgba(255, 31, 41, 0) 100%)",
      color: "#ff1f29",
      circleColor: "bg-[#ff1f29]", // secondary color
    },
  },
} as const;
