import { cva } from "class-variance-authority";

export const textareaVariants = cva(
  "flex w-full resize-none border-0 rounded-lg bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto overflow-x-hidden",
  {
    variants: {
      size: {
        sm: "min-h-[80px] max-h-[80px] h-[80px]",
        md: "min-h-[120px] max-h-[120px] h-[120px]",
        lg: "min-h-[160px] max-h-[160px] h-[160px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
