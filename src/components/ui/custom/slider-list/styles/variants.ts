import { cva, type VariantProps } from "class-variance-authority";

/**
 * Variantes para o container principal da lista
 */
export const sliderListVariants = cva(
  "flex flex-col space-y-4 w-full max-w-7xl mx-auto",
  {
    variants: {
      variant: {
        default: "bg-background",
        card: "bg-card rounded-lg shadow-sm border p-6",
        minimal: "bg-transparent",
      },
      size: {
        sm: "max-w-4xl",
        md: "max-w-6xl",
        lg: "max-w-7xl",
        full: "max-w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
);

/**
 * Variantes para o cabeçalho da lista
 */
export const sliderListHeaderVariants = cva(
  "flex items-center justify-between pb-4 border-b border-border/50",
  {
    variants: {
      variant: {
        default: "",
        minimal: "border-none pb-2",
        prominent: "pb-6 border-b-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Variantes para cada item da lista
 */
export const sliderListItemVariants = cva(
  [
    "group relative flex items-center gap-4 p-4 rounded-lg border border-border/50",
    "bg-card/50 backdrop-blur-sm transition-all duration-200",
    "hover:bg-card hover:border-border hover:shadow-sm",
    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
  ],
  {
    variants: {
      state: {
        default: "",
        dragging: "opacity-50 scale-95 rotate-1 shadow-lg z-10",
        dragOver: "border-primary bg-primary/5 shadow-md scale-102",
        published: "border-green-200 bg-green-50/50",
        unpublished: "border-orange-200 bg-orange-50/50",
        loading: "animate-pulse",
      },
      position: {
        first: "",
        middle: "",
        last: "",
        only: "",
      },
      size: {
        sm: "p-3 gap-3",
        md: "p-4 gap-4",
        lg: "p-5 gap-5",
      },
    },
    defaultVariants: {
      state: "default",
      position: "middle",
      size: "md",
    },
  }
);

/**
 * Variantes para o indicador de ordem
 */
export const orderIndicatorVariants = cva(
  [
    "flex items-center justify-center rounded-full text-sm font-medium",
    "border-2 transition-all duration-200 shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-muted border-border text-muted-foreground",
        active: "bg-primary border-primary text-primary-foreground",
        dragging:
          "bg-primary/80 border-primary text-primary-foreground scale-110",
        success: "bg-green-500 border-green-500 text-white",
        warning: "bg-orange-500 border-orange-500 text-white",
      },
      size: {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
      },
    },
    defaultVariants: {
      variant: "active",
      size: "md",
    },
  }
);

/**
 * Variantes para o thumbnail da imagem
 */
export const thumbnailVariants = cva(
  [
    "relative overflow-hidden rounded-lg border border-border/30",
    "bg-muted transition-all duration-200 shrink-0",
  ],
  {
    variants: {
      size: {
        sm: "w-12 h-8",
        md: "w-20 h-12",
        lg: "w-24 h-14",
        xl: "w-32 h-20",
      },
      state: {
        default: "",
        loading: "animate-pulse bg-muted",
        error: "border-destructive bg-destructive/5",
        success: "border-green-200 bg-green-50/50",
      },
      aspectRatio: {
        "16/9": "aspect-video",
        "4/3": "aspect-[4/3]",
        "3/2": "aspect-[3/2]",
        square: "aspect-square",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
      aspectRatio: "16/9",
    },
  }
);

/**
 * Variantes para as informações do slider
 */
export const sliderInfoVariants = cva("flex-1 min-w-0 space-y-1", {
  variants: {
    layout: {
      default: "space-y-1",
      compact: "space-y-0.5",
      spacious: "space-y-2",
    },
  },
  defaultVariants: {
    layout: "default",
  },
});

/**
 * Variantes para os metadados do slider
 */
export const metadataVariants = cva(
  "flex items-center gap-4 text-xs text-muted-foreground",
  {
    variants: {
      layout: {
        horizontal: "flex-row",
        vertical: "flex-col items-start gap-1",
        wrap: "flex-row flex-wrap gap-2",
      },
      density: {
        compact: "gap-2 text-xs",
        normal: "gap-4 text-xs",
        spacious: "gap-6 text-sm",
      },
    },
    defaultVariants: {
      layout: "horizontal",
      density: "normal",
    },
  }
);

/**
 * Variantes para o container de ações
 */
export const actionsContainerVariants = cva(
  ["flex items-center gap-2 transition-opacity duration-200 shrink-0"],
  {
    variants: {
      position: {
        right: "ml-auto",
        inline: "",
        floating: "absolute top-2 right-2",
      },
      visibility: {
        always: "opacity-100",
        hover: "opacity-0 group-hover:opacity-100",
        focus: "opacity-0 group-focus-within:opacity-100",
      },
      layout: {
        horizontal: "flex-row",
        vertical: "flex-col",
        grid: "grid grid-cols-2 gap-1",
      },
    },
    defaultVariants: {
      position: "right",
      visibility: "hover",
      layout: "horizontal",
    },
  }
);

/**
 * Variantes para botões de ação
 */
export const actionButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-md text-sm font-medium",
    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground",
        publish:
          "h-8 w-8 hover:bg-green-100 text-green-600 hover:text-green-700",
        edit: "h-8 w-8 hover:bg-blue-100 text-blue-600 hover:text-blue-700",
        delete: "h-8 w-8 hover:bg-red-100 text-red-600 hover:text-red-700",
        reorder:
          "h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing",
      },
      size: {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Variantes para o estado vazio da lista
 */
export const emptyStateVariants = cva(
  [
    "flex flex-col items-center justify-center py-12 px-6 text-center",
    "border-2 border-dashed border-border/30 rounded-lg bg-muted/20",
  ],
  {
    variants: {
      variant: {
        default: "",
        minimal: "border-none bg-transparent py-8",
        prominent: "border-border bg-muted/10 py-16",
      },
      size: {
        sm: "py-8 px-4",
        md: "py-12 px-6",
        lg: "py-16 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Variantes para o botão de adicionar slider
 */
export const addButtonVariants = cva(
  [
    "inline-flex items-center gap-2 rounded-lg",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "transition-all duration-200 font-medium",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-primary text-primary bg-background hover:bg-primary/5",
        ghost: "text-primary hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Variantes para indicadores de status
 */
export const statusIndicatorVariants = cva(
  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      status: {
        published: "bg-green-100 text-green-800 border border-green-200",
        unpublished: "bg-orange-100 text-orange-800 border border-orange-200",
        draft: "bg-gray-100 text-gray-800 border border-gray-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        loading:
          "bg-blue-100 text-blue-800 border border-blue-200 animate-pulse",
      },
    },
    defaultVariants: {
      status: "unpublished",
    },
  }
);

/**
 * Variantes para estados de loading
 */
export const loadingStateVariants = cva("animate-pulse bg-muted rounded", {
  variants: {
    variant: {
      text: "h-4",
      title: "h-6",
      button: "h-10 w-24",
      thumbnail: "aspect-video",
      circle: "rounded-full aspect-square",
    },
  },
  defaultVariants: {
    variant: "text",
  },
});

// Export tipos para uso com VariantProps
export type SliderListVariants = VariantProps<typeof sliderListVariants>;
export type SliderListItemVariants = VariantProps<
  typeof sliderListItemVariants
>;
export type ThumbnailVariants = VariantProps<typeof thumbnailVariants>;
export type ActionButtonVariants = VariantProps<typeof actionButtonVariants>;
export type AddButtonVariants = VariantProps<typeof addButtonVariants>;
export type StatusIndicatorVariants = VariantProps<
  typeof statusIndicatorVariants
>;
