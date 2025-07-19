import { cva } from "class-variance-authority";

/**
 * Variantes para o componente ImageNotFound
 * Define estilos base e variações de tamanho, cor e estado
 */
export const imageNotFoundVariants = cva(
  [
    "flex flex-col items-center justify-center",
    "!bg-blue-900",
    "border border-blue-200",
    "rounded-lg",
    "transition-all duration-200 ease-in-out",
    "select-none",
  ],
  {
    variants: {
      /**
       * Tamanhos do componente
       */
      size: {
        xs: "w-16 h-16 min-h-[4rem]",
        sm: "w-24 h-24 min-h-[6rem]",
        md: "w-32 h-32 min-h-[8rem]",
        lg: "w-48 h-48 min-h-[12rem]",
        xl: "w-64 h-64 min-h-[16rem]",
        "2xl": "w-80 h-80 min-h-[20rem]",
        full: "w-full h-full min-h-[8rem]",
      },

      /**
       * Variantes de cores/estilos
       */
      variant: {
        default: ["text-gray-400", "border-gray-200"],
        muted: ["text-gray-300", "bg-gray-25", "border-gray-100"],
        accent: ["text-blue-400", "bg-blue-50", "border-blue-200"],
        success: ["text-green-400", "bg-green-50", "border-green-200"],
        warning: ["text-yellow-400", "bg-yellow-50", "border-yellow-200"],
        error: ["text-red-400", "bg-red-50", "border-red-200"],
      },

      /**
       * Aspect ratio do container
       */
      aspectRatio: {
        square: "aspect-square",
        video: "aspect-video",
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]",
      },

      /**
       * Estado clicável
       */
      clickable: {
        true: [
          "cursor-pointer",
          "hover:bg-gray-100",
          "hover:border-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "active:scale-[0.98]",
        ],
        false: "cursor-default",
      },

      /**
       * Animações
       */
      withAnimation: {
        true: [
          "hover:scale-[1.02]",
          "hover:shadow-sm",
          "transition-transform duration-200",
        ],
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      clickable: false,
      withAnimation: false,
    },
  }
);
