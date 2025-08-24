import { VariantProps } from "class-variance-authority";
import { checkboxCustomVariants } from "../variants";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

/**
 * Props para o componente CheckboxCustom
 */
export interface CheckboxCustomProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxCustomVariants> {
  /**
   * Texto do rótulo associado ao checkbox
   */
  label?: string;

  /**
   * Posição do rótulo em relação ao checkbox
   * @default "right"
   */
  labelPosition?: "left" | "right";
}
