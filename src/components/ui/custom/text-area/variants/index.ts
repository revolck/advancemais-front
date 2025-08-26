import { cva } from "class-variance-authority"

export const textareaVariants = cva(
  "flex w-full resize-none border-0 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-[80px]",
        md: "min-h-[120px]",
        lg: "min-h-[160px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
)

