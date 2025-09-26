import { cva } from "class-variance-authority";

/**
 * Variantes para o container principal
 */
export const userAvatarsVariants = cva("flex items-center relative", {
  variants: {
    size: {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
      xl: "gap-4",
    },
    alignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
    spacing: {
      tight: "gap-0",
      normal: "gap-1",
      loose: "gap-2",
    },
  },
  defaultVariants: {
    size: "md",
    alignment: "left",
    spacing: "normal",
  },
});

/**
 * Variantes para o avatar individual
 */
export const avatarVariants = cva(
  "relative cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full transition-all duration-200",
  {
    variants: {
      size: {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
      },
      border: {
        none: "border-0",
        thin: "border border-white",
        medium: "border-2 border-white",
        thick: "border-4 border-white",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
      hover: {
        scale: "hover:scale-110",
        lift: "hover:-translate-y-1",
        glow: "hover:shadow-lg hover:shadow-primary/25",
        none: "hover:transform-none",
      },
    },
    defaultVariants: {
      size: "md",
      border: "thin",
      shadow: "md",
      hover: "scale",
    },
  }
);

/**
 * Variantes para o bubble de contagem (+X)
 */
export const bubbleVariants = cva(
  "flex h-full w-full items-center justify-center text-xs font-medium rounded-full",
  {
    variants: {
      size: {
        xs: "text-[10px]",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
      color: {
        default: "bg-background text-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        accent: "bg-accent text-accent-foreground",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
    },
    defaultVariants: {
      size: "sm",
      color: "default",
      weight: "medium",
    },
  }
);

/**
 * Variantes para o tooltip
 */
export const tooltipVariants = cva(
  "absolute left-1/2 z-50 transform -translate-x-1/2 whitespace-nowrap rounded-md text-xs px-2 py-1 shadow-lg",
  {
    variants: {
      placement: {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
      },
      color: {
        default: "bg-black text-white",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        accent: "bg-accent text-accent-foreground",
      },
      size: {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-2.5 py-1.5",
      },
    },
    defaultVariants: {
      placement: "bottom",
      color: "default",
      size: "md",
    },
  }
);

/**
 * Variantes para a imagem do avatar
 */
export const avatarImageVariants = cva("w-full h-full object-cover", {
  variants: {
    fit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      scaleDown: "object-scale-down",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    fit: "cover",
    rounded: "full",
  },
});
