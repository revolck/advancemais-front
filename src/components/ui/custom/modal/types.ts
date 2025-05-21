// src/components/ui/custom/modal/types.ts

import { DialogProps } from "@radix-ui/react-dialog";

// Tipos para as propriedades do modal
export type ModalSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

// Aqui está o tipo para os backdrops da modal
export type ModalBackdrop = "transparent" | "opaque" | "blur";

export type ModalPlacement = "auto" | "top" | "center" | "bottom";

export interface ModalProps extends Omit<DialogProps, "modal"> {
  /**
   * Tamanho do modal
   * @default "md"
   */
  size?: ModalSize;

  /**
   * Radio das bordas
   * @default "lg"
   */
  radius?: "none" | "sm" | "md" | "lg";

  /**
   * Sombra do modal
   * @default "lg"
   */
  shadow?: "none" | "sm" | "md" | "lg";

  /**
   * Tipo de backdrop
   * @default "opaque"
   */
  backdrop?: ModalBackdrop;

  /**
   * Comportamento de scroll
   * @default "normal"
   */
  scrollBehavior?: "normal" | "inside" | "outside";

  /**
   * Posição do modal na tela
   * @default "center"
   */
  placement?: ModalPlacement;

  /**
   * Se o modal está aberto
   */
  isOpen?: boolean;

  /**
   * Se o modal pode ser fechado clicando fora
   * @default true
   */
  isDismissable?: boolean;

  /**
   * Se o modal pode ser fechado pressionando ESC
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;

  /**
   * Se o scroll da página deve ser bloqueado quando o modal estiver aberto
   * @default true
   */
  shouldBlockScroll?: boolean;

  /**
   * Se o botão de fechar deve ser escondido
   * @default false
   */
  hideCloseButton?: boolean;

  /**
   * Botão de fechar personalizado
   */
  closeButton?: React.ReactNode;

  /**
   * Props de animação
   */
  motionProps?: any;

  /**
   * Container do portal
   */
  portalContainer?: HTMLElement;

  /**
   * Se a animação deve ser desativada
   * @default false
   */
  disableAnimation?: boolean;

  /**
   * Classes personalizadas
   */
  classNames?: {
    wrapper?: string;
    base?: string;
    backdrop?: string;
    header?: string;
    body?: string;
    footer?: string;
    closeButton?: string;
  };

  /**
   * Função chamada quando o estado de abertura muda
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Função chamada quando o modal é fechado
   */
  onClose?: () => void;
}
