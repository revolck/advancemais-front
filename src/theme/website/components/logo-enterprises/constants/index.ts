// src/theme/website/components/logo-enterprises/constants/index.ts

import type { LogoData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_LOGOS_DATA: LogoData[] = [
  {
    id: 1,
    name: "Appian",
    src: "https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Appian_Logo.svg/512px-Appian_Logo.svg",
    alt: "Logo da Appian",
    website: "https://appian.com",
    category: "Tecnologia",
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    name: "Kofax",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Tungsten_Automation.svg/220px-Tungsten_Automation.svg",
    alt: "Logo da Kofax (Tungsten Automation)",
    website: "https://www.kofax.com",
    category: "Automação",
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    name: "AWS",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    alt: "Logo da Amazon Web Services",
    website: "https://aws.amazon.com",
    category: "Cloud",
    isActive: true,
    order: 3,
  },
  {
    id: 4,
    name: "Microsoft",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    alt: "Logo da Microsoft",
    website: "https://microsoft.com",
    category: "Tecnologia",
    isActive: true,
    order: 4,
  },
  {
    id: 5,
    name: "Google",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    alt: "Logo do Google",
    website: "https://google.com",
    category: "Tecnologia",
    isActive: true,
    order: 5,
  },
  {
    id: 6,
    name: "Apple",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/90px-Apple_logo_black.svg",
    alt: "Logo da Apple",
    website: "https://apple.com",
    category: "Tecnologia",
    isActive: true,
    order: 6,
  },
  {
    id: 7,
    name: "Microsoft Outlook",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/100px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg",
    alt: "Logo do Microsoft Outlook",
    website: "https://outlook.com",
    category: "Produtividade",
    isActive: true,
    order: 7,
  },
  {
    id: 8,
    name: "Windows",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Windows_logo_and_wordmark_-_2021.svg/210px-Windows_logo_and_wordmark_-_2021.svg",
    alt: "Logo do Windows",
    website: "https://windows.com",
    category: "Sistema Operacional",
    isActive: true,
    order: 8,
  },
  {
    id: 9,
    name: "Amazon",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Amazon_2024.svg/220px-Amazon_2024.svg",
    alt: "Logo da Amazon",
    website: "https://amazon.com",
    category: "E-commerce",
    isActive: true,
    order: 9,
  },
  {
    id: 10,
    name: "Nike",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/220px-Logo_NIKE.svg",
    alt: "Logo da Nike",
    website: "https://nike.com",
    category: "Esportes",
    isActive: true,
    order: 10,
  },
];

/**
 * Configurações do componente
 */
export const LOGOS_CONFIG = {
  api: {
    endpoint: "/api/enterprises/logos",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  layout: {
    gridCols: {
      mobile: 2,
      tablet: 3,
      desktop: 5,
    },
    gap: 6,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 640px) 100px, (max-width: 1024px) 120px, 140px",
    placeholder: "blur",
    maxWidth: 100,
    maxHeight: 40,
  },
  animation: {
    hoverDuration: 300,
    staggerDelay: 100,
  },
} as const;

/**
 * Texto padrão da seção
 */
export const DEFAULT_CONTENT = {
  title: "Quem está com a gente nessa jornada",
  subtitle:
    "Na Advance RH, acreditamos que cada talento é singular e cada empresa tem um potencial ilimitado. Conectamos histórias para criar um futuro mais inovador, inclusivo e promissor.",
} as const;
