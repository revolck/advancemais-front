import { cva } from "class-variance-authority";

export const emptyStateVariants = cva(
  "relative isolate flex w-full flex-col rounded-3xl transition-colors duration-200",
  {
    variants: {
      align: {
        center: "items-center text-center",
        start: "items-start text-left",
      },
      size: {
        sm: "gap-5 px-6 py-8",
        md: "gap-6 px-8 py-10",
        lg: "gap-8 px-10 py-14",
      },
      tone: {
        neutral:
          "border border-gray-100/80 bg-gradient-to-b from-white/95 via-white/90 to-gray-50/80 text-gray-600 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm dark:border-zinc-800/70 dark:from-zinc-950/70 dark:via-zinc-950/60 dark:to-zinc-900/60 dark:text-zinc-300 dark:ring-white/10",
        muted:
          "border border-gray-100/60 bg-gradient-to-b from-gray-50/95 via-white/90 to-gray-100/80 text-gray-600 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.45)] ring-1 ring-black/5 backdrop-blur-sm dark:border-zinc-800/60 dark:from-zinc-950/70 dark:via-zinc-950/55 dark:to-zinc-900/55 dark:text-zinc-300 dark:ring-white/10",
        accent:
          "border border-[var(--primary-color)]/30 bg-gradient-to-b from-[var(--primary-color)]/15 via-[var(--primary-color)]/10 to-white/70 text-gray-700 shadow-[0_22px_60px_-45px_rgba(67,56,202,0.45)] ring-1 ring-[var(--primary-color)]/20 backdrop-blur-sm dark:text-zinc-100",
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
