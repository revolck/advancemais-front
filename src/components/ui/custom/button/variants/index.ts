import { cva } from "class-variance-authority";

/**
 * Variantes do componente ButtonCustom usando CVA
 * Atualizado para utilizar o novo sistema de cores global
 */
export const buttonCustomVariants = cva(
  "inline-flex items-center justify-center gap-2 hover:opacity-90 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white !rounded-md relative pr-12 pl-4 font-semibold",
        primary:
          "!bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white !rounded-md relative pr-12 pl-4 font-semibold",
        secondary:
          "!bg-[var(--secondary-color)] !hover:bg-[var(--secondary-color-hover)] text-white !rounded-md relative pr-12 pl-4 font-semibold",
        success:
          "!bg-[var(--global-success)] !hover:bg-[var(--global-success-hover)] text-white !rounded-md relative pr-12 pl-4 font-semibold",
        outline:
          "border border-gray-500/30 hover:border-gray-300 text-gray-700 bg-background hover:bg-gray-200 hover:text-accent-foreground rounded-md",
        ghost:
          "hover:bg-gray-200 bg-gray-100/70 hover:text-accent-foreground !rounded-md",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg-[var(--global-cor-vermelho-terra)] text-white rounded-md",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        md: "h-10 px-5 py-2",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4 text-base",
        xl: "h-14 rounded-md px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      withAnimation: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      withAnimation: true,
    },
  }
);
