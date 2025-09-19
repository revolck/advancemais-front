import type { HTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import type { EmptyStateIllustration } from "./illustrations";
import { emptyStateVariants } from "./variants";

export type EmptyStateSize = NonNullable<VariantProps<typeof emptyStateVariants>["size"]>;

export interface EmptyStateProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  /**
   * Título principal exibido no estado vazio.
   */
  title: string;

  /**
   * Texto descritivo opcional exibido abaixo do título.
   */
  description?: string;

  /**
   * Texto auxiliar exibido acima do título.
   */
  eyebrow?: string;

  /**
   * Define o elemento HTML utilizado para o título.
   * @default "h3"
   */
  titleAs?: "h2" | "h3" | "h4" | "h5";

  /**
   * Define o elemento HTML utilizado para a descrição.
   * @default "p"
   */
  descriptionAs?: "p" | "span";

  /**
   * Identificador da ilustração a ser utilizada.
   */
  illustration?: EmptyStateIllustration;

  /**
   * Texto alternativo da ilustração para fins de acessibilidade.
   */
  illustrationAlt?: string;

  /**
   * Controla o tamanho da ilustração exibida.
   */
  imageSize?: EmptyStateSize;

  /**
   * Define a largura máxima do conteúdo textual.
   * @default "md"
   */
  maxContentWidth?: "sm" | "md" | "lg" | "full";

  /**
   * Área opcional para ações (botões, links, etc.).
   */
  actions?: ReactNode;
}
