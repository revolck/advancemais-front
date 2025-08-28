import { cva } from "class-variance-authority";

/**
 * Variantes do componente FileUpload usando CVA
 */
export const fileUploadVariants = cva("relative w-full", {
  variants: {
    variant: {
      default: "bg-background border border-border rounded-lg",
      bordered: "bg-background border-1 border-solid border-border rounded-lg",
      filled: "bg-muted/50 border border-border rounded-lg",
      minimal: "bg-transparent border-none",
    },
    size: {
      sm: "text-sm",
      md: "",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "bordered",
    size: "md",
  },
});

/**
 * Variantes da área de dropzone
 */
export const dropzoneVariants = cva(
  "relative transition-all duration-200 ease-in-out cursor-pointer",
  {
    variants: {
      variant: {
        default: [
          "rounded-lg p-8 text-center",
          "hover:bg-gray-900/3",
          "focus:outline-none focus:ring-1 focus:ring-red-200 focus:ring-offset-1",
        ],
        compact: [
          "rounded-md p-4 text-center",
          "hover:border-primary/50 hover:bg-primary/5",
          "focus:outline-none focus:ring-1 focus:ring-red-200",
        ],
        minimal: [
          "rounded-md p-6 text-center",
          "hover:border-primary/30 hover:bg-primary/2",
        ],
      },
      state: {
        idle: "",
        dragOver: "border-primary bg-primary/10 scale-[1.02]",
        disabled:
          "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent",
        error: "border-destructive/50 bg-destructive/5",
      },
      size: {
        sm: "p-4 text-sm",
        md: "p-6",
        lg: "p-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "idle",
      size: "md",
    },
  }
);

/**
 * Variantes dos itens de arquivo
 */
export const fileItemVariants = cva(
  "relative flex items-center gap-3 p-3 rounded-md transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background border border-border hover:bg-muted/50",
        minimal: "bg-muted/30 hover:bg-muted/50",
        card: "bg-card border border-border shadow-sm hover:shadow-md",
      },
      status: {
        idle: "",
        uploading: "bg-blue-50 border-blue-200 hover:bg-blue-50",
        completed: "bg-green-50 border-green-200 hover:bg-green-50",
        failed: "bg-red-50 border-red-200 hover:bg-red-50",
        cancelled: "bg-gray-50 border-gray-200 opacity-75 hover:bg-gray-50",
      },
      size: {
        sm: "p-2 text-sm",
        md: "p-3",
        lg: "p-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "idle",
      size: "md",
    },
  }
);

/**
 * Variantes da barra de progresso
 */
export const progressBarVariants = cva(
  "w-full bg-gray-200 rounded-full overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
      variant: {
        default: "bg-gray-200",
        minimal: "bg-gray-100",
        prominent: "bg-gray-300",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

/**
 * Variantes do indicador de progresso
 */
export const progressIndicatorVariants = cva(
  "h-full rounded-full transition-all duration-300 ease-out",
  {
    variants: {
      status: {
        uploading: "bg-blue-500",
        completed: "bg-green-500",
        failed: "bg-red-500",
        idle: "bg-gray-400",
        cancelled: "bg-gray-400",
      },
      animated: {
        true: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-[length:200%_100%] animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      status: "uploading",
      animated: false,
    },
  }
);

/**
 * Variantes do preview de arquivo
 */
export const filePreviewVariants = cva("relative overflow-hidden rounded-md", {
  variants: {
    type: {
      image: "aspect-square bg-gray-100",
      document: "aspect-[4/3] bg-gray-50 flex items-center justify-center",
      generic: "aspect-square bg-gray-50 flex items-center justify-center",
    },
    size: {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-20 h-20",
    },
  },
  defaultVariants: {
    type: "generic",
    size: "md",
  },
});

/**
 * Variantes dos botões de ação nos arquivos
 */
export const fileActionVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "sm",
    },
  }
);

/**
 * Variantes para mensagens de erro/sucesso
 */
export const messageVariants = cva("text-sm font-medium", {
  variants: {
    type: {
      error: "text-destructive",
      warning: "text-yellow-600",
      success: "text-green-600",
      info: "text-blue-600",
    },
  },
  defaultVariants: {
    type: "error",
  },
});
