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
} as const;
