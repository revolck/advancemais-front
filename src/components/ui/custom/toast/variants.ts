import { cva } from "class-variance-authority";

/**
 * Sistema de variantes para toasts usando class-variance-authority
 * Implementa design inspirado no Apple System e na referência visual fornecida
 */
export const toastVariants = cva(
  [
    "group relative flex w-full items-center gap-3 overflow-hidden",
    "rounded-lg border p-4 shadow-lg backdrop-blur-sm",
    "transition-all duration-200 ease-in-out",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
  ],
  {
    variants: {
      variant: {
        default: ["border-border/40 bg-background/80", "text-foreground"],

        success: [
          "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/90",
          "text-emerald-800 dark:text-emerald-300",
        ],

        error: [
          "border-destructive/30 bg-destructive/10",
          "text-destructive dark:text-destructive-foreground",
        ],

        warning: [
          "border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/90",
          "text-amber-800 dark:text-amber-300",
        ],

        info: [
          "border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/90",
          "text-blue-800 dark:text-blue-300",
        ],

        // Novos estilos inspirados na imagem
        action: [
          "border-purple-500/30 bg-purple-50/90 dark:bg-purple-950/90",
          "text-purple-800 dark:text-purple-300",
        ],

        confirmation: [
          "border-indigo-500/30 bg-indigo-50/90 dark:bg-indigo-950/90",
          "text-indigo-800 dark:text-indigo-300",
        ],

        status: [
          "border-gray-500/30 bg-gray-50/90 dark:bg-gray-800/90",
          "text-gray-800 dark:text-gray-300",
        ],
      },

      // Variante de densidade (compact ou normal)
      density: {
        compact: "py-2.5 px-3",
        normal: "py-4 px-4",
      },

      // Variante de importância/proeminência
      prominence: {
        low: "border-opacity-30 bg-opacity-90",
        high: "border-opacity-50 bg-opacity-95 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      density: "normal",
      prominence: "low",
    },
  }
);

/**
 * Estilos para o contêiner dos botões de ação
 */
export const toastActionVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        outline: [
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

/**
 * Estilos para o contêiner de link nos toasts
 */
export const toastLinkVariants = cva(
  "inline-flex items-center gap-1 font-medium underline-offset-2 transition-colors",
  {
    variants: {
      variant: {
        default: "text-primary hover:underline",
        muted: "text-muted-foreground hover:underline",
        destructive: "text-destructive hover:underline",
        success: "text-emerald-600 dark:text-emerald-400 hover:underline",
        info: "text-blue-600 dark:text-blue-400 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
