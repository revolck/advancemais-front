/**
 * Configurações de animação
 */
export const ANIMATION_CONFIG = {
  /** Configurações do Framer Motion */
  MOTION: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
  },
  /** Configurações de stagger */
  STAGGER: {
    delayChildren: 0.1,
    staggerChildren: 0.05,
  },
} as const;

/**
 * Configurações de tema
 */
export const THEME_CONFIG = {
  /** Breakpoints personalizados */
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  /** Z-index layers */
  Z_INDEX: {
    modal: 50,
    dropdown: 40,
    overlay: 30,
    header: 20,
    content: 10,
  },
} as const;
