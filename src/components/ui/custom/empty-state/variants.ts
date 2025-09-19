import { cva } from "class-variance-authority";

export const emptyStateVariants = cva(
  "flex w-full flex-col gap-6 rounded-2xl border border-dashed p-8 transition-colors duration-200",
  {
    variants: {
      align: {
        center: "items-center text-center",
        start: "items-start text-left",
      },
      size: {
        sm: "p-6 gap-5",
        md: "p-8 gap-6",
        lg: "p-12 gap-8",
      },
      tone: {
        neutral:
          "border-gray-200/80 bg-white/70 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300",
        muted:
          "border-gray-200/50 bg-gray-50/80 text-gray-600 dark:border-zinc-800/70 dark:bg-zinc-900/30 dark:text-zinc-300",
        accent:
          "border-[var(--primary-color)]/40 bg-[var(--primary-color)]/5 text-gray-600 dark:text-zinc-200",
      },
      fullHeight: {
        true: "min-h-[320px] justify-center",
        false: "",
      },
    },
    defaultVariants: {
      align: "center",
      size: "md",
      tone: "neutral",
      fullHeight: false,
    },
  }
);
