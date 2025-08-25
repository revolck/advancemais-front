/**
 * Constantes gerais do SliderList
 */

/**
 * Configurações padrão para sliders
 */
export const SLIDER_CONFIG = {
  /** Máximo de sliders permitidos */
  MAX_SLIDERS: 4,
  /** Mínimo de sliders obrigatório */
  MIN_SLIDERS: 1,
  /** Tamanho máximo de arquivo em bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Tipos de arquivo aceitos */
  ACCEPTED_FILE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ] as const,
  /** Extensões aceitas para exibição */
  ACCEPTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"] as const,
} as const;

/**
 * Configurações de UI
 */
export const SLIDER_UI_CONFIG = {
  /** Duração das animações em ms */
  ANIMATION_DURATION: 200,
  /** Delay entre animações de lista */
  STAGGER_DELAY: 50,
  /** Duração dos toasts */
  TOAST_DURATION: 3000,
  /** Placeholder para imagens */
  IMAGE_PLACEHOLDER: "/placeholder-slider.jpg",
  /** Dimensões padrão do thumbnail */
  THUMBNAIL_SIZE: {
    width: 80,
    height: 48,
  },
} as const;

/**
 * Configurações de drag & drop
 */
export const DRAG_CONFIG = {
  /** Threshold para iniciar drag em pixels */
  DRAG_THRESHOLD: 5,
  /** Opacidade durante drag */
  DRAG_OPACITY: 0.5,
  /** Escala durante drag */
  DRAG_SCALE: 0.95,
  /** Rotação durante drag */
  DRAG_ROTATION: 1,
} as const;

/**
 * Tipos derivados das configurações
 */
export type AcceptedFileType =
  (typeof SLIDER_CONFIG.ACCEPTED_FILE_TYPES)[number];
export type AcceptedExtension =
  (typeof SLIDER_CONFIG.ACCEPTED_EXTENSIONS)[number];
