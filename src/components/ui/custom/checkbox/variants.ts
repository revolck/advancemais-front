import { cva } from "class-variance-authority";

/**
 * Variantes do componente CheckboxCustom usando CVA
 */
export const checkboxCustomVariants = cva(
  "peer flex items-center justify-center shrink-0 rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
      variant: {
        default: "bg-muted border border-input",
        outline: "bg-transparent border-2 border-input",
        filled:
          "bg-muted/80 border border-input data-[state=checked]:bg-primary/90",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

/**
 * Variantes para o label do checkbox
 */
export const checkboxLabelVariants = cva("text-foreground transition-colors", {
  variants: {
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    disabled: false,
    size: "md",
  },
});
