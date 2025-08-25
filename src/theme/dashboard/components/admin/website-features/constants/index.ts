import type { WebsiteFeature } from "../types";

export const DEFAULT_WEBSITE_FEATURES: WebsiteFeature[] = [
  {
    id: 1,
    title: "Página Inicial",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página inicial.",
    link: "/config/website/pagina-inicial",
    imageUrl: "/images/dashboard/cards/homepage_1.webp",
    imageUrlHover: "/images/dashboard/cards/homepage.webp",
  },
  {
    id: 2,
    title: "Sobre",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página sobre.",
    link: "/admin/website/about",
    imageUrl: "/images/dashboard/cards/about_1.webp",
    imageUrlHover: "/images/dashboard/cards/about.webp",
  },
  {
    id: 3,
    title: "Cursos",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página cursos.",
    link: "/admin/website/courses",
    imageUrl: "/images/dashboard/cards/course_1.webp",
    imageUrlHover: "/images/dashboard/cards/course.webp",
  },
  {
    id: 4,
    title: "Recrutamento",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página recrutamento.",
    link: "/admin/website/recruitment",
    imageUrl: "/images/dashboard/cards/recruitment_1.webp",
    imageUrlHover: "/images/dashboard/cards/recruitment.webp",
  },
  {
    id: 5,
    title: "Treinamento",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página treinamento.",
    link: "/admin/website/training",
    imageUrl: "/images/dashboard/cards/training_1.webp",
    imageUrlHover: "/images/dashboard/cards/training.webp",
  },
  {
    id: 6,
    title: "Contato",
    description:
      "Gerencie os textos, botões e imagens dos components dedicados a página contato.",
    link: "/admin/website/contact",
    imageUrl: "/images/dashboard/cards/contact_1.webp",
    imageUrlHover: "/images/dashboard/cards/contact.webp",
  },
  {
    id: 7,
    title: "Configurações Gerais",
    description:
      "Modifique informações de metadatas, favicons, titulo do site, redes sociais entre outros nas configurações gerais.",
    link: "/admin/website/settings",
    imageUrl: "/images/dashboard/cards/settings_1.webp",
    imageUrlHover: "/images/dashboard/cards/settings.webp",
  },
];

export const WEBSITE_FEATURES_CONFIG = {
  api: {
    endpoint: "/api/v1/dashboard/website/features",
    timeout: 5000,
    retryAttempts: 3,
  },
  animation: {
    staggerDelay: 100,
    duration: 300,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 768px) 120px, 120px",
  },
} as const;
