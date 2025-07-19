import { cva } from "class-variance-authority";

export const avatarCustomVariants = cva(
  // Estilos base
  [
    "relative flex shrink-0 overflow-hidden rounded-full",
    "select-none",
    "transition-all duration-200 ease-in-out",
  ],
  {
    variants: {
      /**
       * Tamanhos do avatar
       */
      size: {
        xs: "size-6 text-xs",
        sm: "size-8 text-sm",
        md: "size-10 text-base",
        lg: "size-12 text-lg",
        xl: "size-16 text-xl",
        "2xl": "size-20 text-2xl",
        "3xl": "size-24 text-3xl",
      },

      /**
       * Estados interativos
       */
      clickable: {
        true: [
          "cursor-pointer",
          "hover:scale-105",
          "hover:shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "active:scale-95",
        ],
        false: "cursor-default",
      },

      /**
       * Variante com borda
       */
      withBorder: {
        true: "ring-2 ring-white shadow-sm",
        false: "",
      },

      /**
       * Estado de loading
       */
      isLoading: {
        true: "animate-pulse bg-gray-200",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      clickable: false,
      withBorder: false,
      isLoading: false,
    },
  }
);

/**
 * Variantes para o indicador de status
 */
export const statusIndicatorVariants = cva(
  [
    "absolute rounded-full border-2 border-white",
    "transition-all duration-200",
  ],
  {
    variants: {
      size: {
        xs: "size-2 -bottom-0 -right-0",
        sm: "size-2.5 -bottom-0 -right-0",
        md: "size-3 -bottom-0.5 -right-0.5",
        lg: "size-3.5 -bottom-0.5 -right-0.5",
        xl: "size-4 -bottom-1 -right-1",
        "2xl": "size-5 -bottom-1 -right-1",
        "3xl": "size-6 -bottom-1.5 -right-1.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
