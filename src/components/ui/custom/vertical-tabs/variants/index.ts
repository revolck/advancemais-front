import { cva } from "class-variance-authority";

/**
 * Variantes do componente VerticalTabs usando CVA
 */
export const verticalTabsVariants = cva(
  "flex w-full gap-4",
  {
    variants: {
      variant: {
        default: "",
        compact: "gap-2",
        spacious: "gap-6",
      },
      size: {
        sm: "text-sm",
        md: "",
        lg: "text-base",
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
 * Variantes da lista de abas
 */
export const tabsListVariants = cva(
  "flex shrink-0 bg-transparent p-0",
  {
    variants: {
      variant: {
        default: "flex-col gap-1 rounded-none px-1 py-0 text-foreground",
        compact: "flex-col gap-0.5 px-1 py-0 text-foreground",
        spacious: "flex-col gap-2 px-2 py-2 text-foreground",
      },
      tabsWidth: {
        auto: "w-auto",
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
 * Variantes dos triggers das abas
 */
export const tabsTriggerVariants = cva(
  "relative w-full justify-start text-left font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent",
        compact: "after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent",
        spacious: "after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent",
      },
      size: {
        sm: "px-2 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Variantes do conteúdo das abas
 */
export const tabsContentVariants = cva(
  "grow rounded-lg text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-border",
        bordered: "border-l border-border pl-6",
        card: "bg-card border border-border shadow-sm",
        plain: "",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);