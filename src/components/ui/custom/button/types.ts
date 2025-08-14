import { VariantProps } from "class-variance-authority";
import type { HTMLMotionProps } from "framer-motion";
import { IconName } from "../Icons";
import { buttonCustomVariants } from "./variants";

/**
 * Props para o componente ButtonCustom
 */
export interface ButtonCustomProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonCustomVariants> {
  /**
   * Renderiza o filho como um slot
   * @default false
   */
  asChild?: boolean;

  /**
   * Ícone a ser exibido no botão
   */
  icon?: IconName;

  /**
   * Posição do ícone
   * @default "left"
   */
  iconPosition?: "left" | "right";

  /**
   * Se o botão está em estado de carregamento
   * @default false
   */
  isLoading?: boolean;

  /**
   * Texto a ser exibido durante o carregamento
   */
  loadingText?: string;

  /**
   * Se o botão deve ter animação
   * @default true
   */
  withAnimation?: boolean;
}
