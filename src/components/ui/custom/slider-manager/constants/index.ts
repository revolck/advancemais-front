/**
 * Slider Manager Constants
 * Path: src/components/ui/custom/slider-manager/constants/index.ts
 */

export const SLIDER_CONSTANTS = {
  // Animation durations
  ANIMATION_DURATION: 200,
  SUCCESS_MESSAGE_DURATION: 2000,

  // Validation limits
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MAX_URL_LENGTH: 500,

  // Default values
  DEFAULT_POSITION: 1,
  DEFAULT_STATUS: true,
} as const;

export const SLIDER_MESSAGES = {
  // Success messages
  SUCCESS_CREATE: "Slider criado com sucesso!",
  SUCCESS_UPDATE: "Slider atualizado com sucesso!",
  SUCCESS_DELETE: "Slider excluído com sucesso!",
  SUCCESS_REORDER: "Ordem dos sliders atualizada!",
  SUCCESS_STATUS_TOGGLE: "Status do slider alterado com sucesso!",

  // Error messages
  ERROR_TITLE_REQUIRED: "O título é obrigatório",
  ERROR_TITLE_MIN_LENGTH: `O título deve ter pelo menos ${SLIDER_CONSTANTS.MIN_TITLE_LENGTH} caracteres`,
  ERROR_TITLE_MAX_LENGTH: `O título deve ter no máximo ${SLIDER_CONSTANTS.MAX_TITLE_LENGTH} caracteres`,
  ERROR_IMAGE_REQUIRED: "Selecione uma imagem para o slider",
  ERROR_URL_INVALID: "Digite uma URL válida (ex: https://exemplo.com)",
  ERROR_URL_MAX_LENGTH: `A URL deve ter no máximo ${SLIDER_CONSTANTS.MAX_URL_LENGTH} caracteres`,
  ERROR_GENERIC: "Ocorreu um erro inesperado. Tente novamente.",
  ERROR_NETWORK: "Erro de conexão. Verifique sua internet e tente novamente.",

  // Confirmation messages
  CONFIRM_DELETE: "Tem certeza que deseja excluir este slider?",
  CONFIRM_DELETE_DESCRIPTION:
    "Esta ação não pode ser desfeita e o slider será removido permanentemente.",

  // Empty states
  EMPTY_SLIDERS_TITLE: "Nenhum slider encontrado",
  EMPTY_SLIDERS_DESCRIPTION:
    "Comece criando seu primeiro slider para dar vida ao seu site!",

  // Form placeholders
  PLACEHOLDER_TITLE: "Ex: Banner Promocional de Verão",
  PLACEHOLDER_URL: "https://exemplo.com/promocao",

  // Upload messages
  UPLOAD_INSTRUCTION: "Arraste uma imagem aqui ou clique para selecionar",
  UPLOAD_BROWSE: "Escolher imagem",
  URL_DESCRIPTION: "Para onde o usuário será direcionado ao clicar no slider",
} as const;

export const SLIDER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export const SLIDER_VIEWS = {
  LIST: "list" as const,
  FORM: "form" as const,
};

export const SLIDER_ANIMATIONS = {
  FADE_IN: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

// CSS Classes for consistent styling
export const SLIDER_STYLES = {
  CARD: "border border-border/30 !bg-gray-100 shadow-none hover:border-primary/30 transition-all duration-300 bg-card rounded-xl",
  BUTTON_PRIMARY:
    "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium",
  BUTTON_SECONDARY: "bg-transparent rounded-lg border-border/50",
  INPUT: "h-10 text-sm rounded-lg",
  INPUT_ERROR: "border-destructive focus-visible:ring-destructive",
  // Badges alinhadas ao design do modal (Label do Switch no formulário)
  BADGE_ACTIVE:
    "!bg-emerald-100 !text-emerald-700 !border-emerald-200 px-3 py-1",
  BADGE_INACTIVE:
    "!bg-red-100 !text-red-700 !border-red-200 px-3 py-1",
} as const;

export const SLIDER_DRAG_CONFIG = {
  DRAG_SCALE: 1.02,
  DRAG_ROTATE: 1,
  TRANSITION_DURATION: 0.2,
} as const;
