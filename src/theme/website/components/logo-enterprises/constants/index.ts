// src/theme/website/components/logo-enterprises/constants/index.ts

/**
 * Configurações do componente LogoEnterprises
 */
export const LOGOS_CONFIG = {
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
    sizes:
      "(max-width: 640px) 100px, (max-width: 1024px) 120px, 140px",
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

