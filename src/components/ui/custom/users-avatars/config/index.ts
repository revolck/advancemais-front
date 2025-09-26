/**
 * Configurações padrão para o componente UserAvatars
 */
export const DEFAULT_USER_AVATARS_CONFIG = {
  /** Tamanho padrão dos avatares */
  DEFAULT_SIZE: 56,
  /** Número máximo de avatares visíveis */
  DEFAULT_MAX_VISIBLE: 7,
  /** Percentual de sobreposição padrão */
  DEFAULT_OVERLAP: 60,
  /** Fator de escala no hover */
  DEFAULT_FOCUS_SCALE: 1.2,
  /** Posicionamento padrão do tooltip */
  DEFAULT_TOOLTIP_PLACEMENT: "bottom" as const,
  /** Configuração de animação padrão */
  DEFAULT_ANIMATION: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
  },
  /** Configuração de tooltip padrão */
  DEFAULT_TOOLTIP_ANIMATION: {
    duration: 0.18,
  },
} as const;

/**
 * Tamanhos predefinidos para os avatares
 */
export const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
  "2xl": 96,
} as const;

/**
 * Configurações de sobreposição predefinidas
 */
export const OVERLAP_PRESETS = {
  tight: 80,
  normal: 60,
  loose: 40,
  none: 0,
} as const;

/**
 * Configurações de escala de hover predefinidas
 */
export const SCALE_PRESETS = {
  subtle: 1.1,
  normal: 1.2,
  prominent: 1.3,
  dramatic: 1.5,
} as const;

/**
 * Cores padrão para diferentes temas
 */
export const THEME_COLORS = {
  light: {
    border: "border-white",
    shadow: "shadow-md",
    tooltip: "bg-black text-white",
    bubble: "bg-gray-100 text-gray-700",
  },
  dark: {
    border: "border-gray-800",
    shadow: "shadow-lg shadow-black/25",
    tooltip: "bg-white text-black",
    bubble: "bg-gray-800 text-gray-200",
  },
} as const;

/**
 * Configurações de acessibilidade
 */
export const ACCESSIBILITY_CONFIG = {
  /** Texto alternativo padrão para avatares sem nome */
  DEFAULT_ALT_TEXT: "User avatar",
  /** Texto alternativo para avatares com nome */
  getAltText: (name?: string) => (name ? `${name} avatar` : "User avatar"),
  /** Texto para o bubble de contagem */
  getCountText: (count: number) => `+${count} more users`,
  /** Texto para o tooltip de contagem */
  getTooltipText: (count: number) => `${count} more users`,
} as const;

/**
 * Utilitários para formatação
 */
export const FORMAT_UTILS = {
  /**
   * Formata o nome do usuário para exibição
   */
  formatUserName: (name?: string) => {
    if (!name) return "Usuário";
    return name.trim();
  },

  /**
   * Gera iniciais do nome do usuário
   */
  getInitials: (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Valida se uma URL de imagem é válida
   */
  isValidImageUrl: (url: string) => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    } catch {
      return false;
    }
  },

  /**
   * Gera uma cor de fundo baseada no ID do usuário
   */
  generateBackgroundColor: (id: string | number) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const hash = String(id)
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
    return colors[Math.abs(hash) % colors.length];
  },
} as const;
