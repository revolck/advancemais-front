import { cva } from "class-variance-authority";

/**
 * Sistema de Design Minimalista - Inspirado no Design da Apple
 * 
 * Princípios aplicados:
 * - Minimalismo e clareza visual
 * - Hierarquia tipográfica consistente  
 * - Estados visuais sutis mas evidentes
 * - Transições suaves e naturais
 * - Espaçamento generoso e respirável
 */

/**
 * Container principal das abas
 */
export const verticalTabsVariants = cva(
  "flex w-full gap-8", // Espaçamento mais generoso
  {
    variants: {
      variant: {
        default: "",
        minimal: "gap-6",
        spacious: "gap-12",
      },
      size: {
        sm: "text-sm gap-4",
        md: "text-base gap-8", 
        lg: "text-lg gap-10",
      },
      orientation: {
        vertical: "flex-row",
        horizontal: "flex-col",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      orientation: "vertical",
    },
  }
);

/**
 * Lista de navegação das abas - Design Apple minimalista
 */
export const tabsListVariants = cva(
  "flex shrink-0 bg-transparent",
  {
    variants: {
      variant: {
        default: "flex-col gap-1 px-0 py-2",
        minimal: "flex-col gap-2 px-0 py-4",
        spacious: "flex-col gap-3 px-0 py-6",
      },
      tabsWidth: {
        auto: "w-auto min-w-[200px]",
        sm: "w-48",
        md: "w-56", 
        lg: "w-64",
        xl: "w-72",
      },
    },
    defaultVariants: {
      variant: "default",
      tabsWidth: "auto",
    },
  }
);

/**
 * Botões das abas - Estilo Apple minimalista com estados claros
 */
export const tabsTriggerVariants = cva(
  [
    // Base styles - Clean and minimal
    "relative w-full justify-start text-left group cursor-pointer",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-4",
    "disabled:pointer-events-none disabled:opacity-40",
    
    // Apple-style rounded corners and padding
    "rounded-xl px-4 py-3",
    
    // Typography - Clean and readable
    "font-medium tracking-tight",
    
    // Subtle background on hover
    "hover:bg-gray-50/80 active:bg-gray-100/60",
  ],
  {
    variants: {
      variant: {
        default: [
          // Default state - Minimal but clear
          "text-gray-700",
          "data-[state=active]:text-gray-900 data-[state=active]:bg-white",
          "data-[state=active]:border data-[state=active]:border-gray-200/60",
        ],
        minimal: [
          // Ultra minimal - Just text changes
          "text-gray-600",
          "hover:text-gray-800",
          "data-[state=active]:text-blue-600 data-[state=active]:font-semibold",
          "data-[state=active]:bg-transparent",
        ],
        spacious: [
          // Primary color background for active state
          "text-gray-600", 
          "data-[state=active]:text-white data-[state=active]:bg-[var(--primary-color)]",
          "hover:bg-gray-100/50",
        ],
      },
      size: {
        sm: "px-3 py-2 text-sm rounded-lg",
        md: "px-4 py-3 text-base rounded-xl", 
        lg: "px-5 py-4 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Container do conteúdo - Limpo e focado
 */
export const tabsContentVariants = cva(
  [
    "flex-1 rounded-2xl bg-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-4",
    "transition-all duration-300 ease-out",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-gray-200/60",
          "bg-white",
        ],
        minimal: [
          "border-0",
          "bg-transparent",
        ],
        spacious: [
          "border border-gray-200/60",
          "bg-white backdrop-blur-sm",
        ],
        bordered: [
          "border-l-2 border-l-gray-200 pl-8",
          "bg-transparent",
        ],
        card: [
          "border border-gray-200/60",
          "bg-white backdrop-blur-sm",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8", 
      },
    },
    defaultVariants: {
      variant: "default", 
      padding: "md",
    },
  }
);

/**
 * Indicador visual da aba ativa - Sutil mas claro
 */
export const tabsIndicatorVariants = cva(
  [
    "absolute left-0 w-0.5 rounded-full bg-blue-500",
    "transition-all duration-300 ease-out",
    "opacity-0 scale-y-0",
    "group-data-[state=active]:opacity-100 group-data-[state=active]:scale-y-100",
  ],
  {
    variants: {
      variant: {
        default: "h-6 top-1/2 -translate-y-1/2",
        minimal: "h-4 top-1/2 -translate-y-1/2 bg-blue-600",
        spacious: "h-8 top-1/2 -translate-y-1/2 w-1 bg-[var(--primary-color)]", 
      },
      size: {
        sm: "h-4",
        md: "h-6",
        lg: "h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md", 
    },
  }
);

/**
 * Ícone da aba - Harmonia visual com o texto
 */
export const tabsIconVariants = cva(
  [
    "transition-all duration-300 ease-out",
    "opacity-60 group-data-[state=active]:opacity-100",
  ],
  {
    variants: {
      variant: {
        default: "text-gray-500 group-data-[state=active]:text-gray-700",
        minimal: "text-gray-500 group-data-[state=active]:text-blue-600",
        spacious: "text-gray-500 group-data-[state=active]:text-white",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Select mobile - Design consistente
 */
export const tabsMobileSelectVariants = cva(
  [
    "w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl",
    "text-base text-gray-900 font-medium",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50",
    "transition-all duration-200 ease-out",
    "appearance-none cursor-pointer",
    "hover:bg-gray-50",
  ],
  {
    variants: {
      size: {
        sm: "px-3 py-2 text-sm rounded-lg",
        md: "px-4 py-3 text-base rounded-xl", 
        lg: "px-5 py-4 text-lg rounded-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
