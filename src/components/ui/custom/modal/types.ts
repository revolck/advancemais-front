// src/components/ui/custom/modal/types.ts

import { DialogProps } from "@radix-ui/react-dialog";

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

export type ModalRadius = "none" | "sm" | "md" | "lg";

export type ModalShadow = "none" | "sm" | "md" | "lg";

export type ModalBackdrop = "transparent" | "opaque" | "blur";

export type ModalScrollBehavior = "normal" | "inside" | "outside";

export type ModalPlacement = "auto" | "top" | "center" | "bottom";

export type ModalClassNames = {
  wrapper?: string;
  base?: string;
  backdrop?: string;
  header?: string;
  body?: string;
  footer?: string;
  closeButton?: string;
};

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
  radius?: ModalRadius;

  /**
   * Sombra do modal
   * @default "lg"
   */
  shadow?: ModalShadow;

  /**
   * Tipo de backdrop
   * @default "opaque"
   */
  backdrop?: ModalBackdrop;

  /**
   * Comportamento de scroll
   * @default "normal"
   */
  scrollBehavior?: ModalScrollBehavior;

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
   * Bloqueia o fechamento ao clicar fora quando houver dados não salvos
   * @default true
   */
  preventCloseOnOutsideWhenDirty?: boolean;

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
  classNames?: ModalClassNames;

  /**
   * Função chamada quando o estado de abertura muda
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Função chamada quando o modal é fechado
   */
  onClose?: () => void;

  /**
   * Função chamada quando o estado de "dados não salvos" mudar
   */
  onDirtyChange?: (isDirty: boolean) => void;
}
