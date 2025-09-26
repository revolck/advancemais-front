import type { KeyboardEvent } from "react";

/**
 * Interface para representar um usuário
 */
export interface User {
  /** ID único do usuário */
  id: string | number;
  /** Nome do usuário (opcional) */
  name?: string;
  /** URL da imagem do avatar */
  image: string;
}

/**
 * Propriedades do componente UserAvatars
 */
export interface UserAvatarsProps {
  /** Lista de usuários com id, name e image */
  users: User[];
  /** Tamanho do avatar em px (padrão: 56) */
  size?: number | string;
  /** Classes extras para o container */
  className?: string;
  /** Número máximo de avatares visíveis antes de mostrar +X (padrão: 7) */
  maxVisible?: number;
  /** Percentual de sobreposição entre avatares (padrão: 60) */
  overlap?: number;
  /** Fator de escala no hover (padrão: 1.2) */
  focusScale?: number;
  /** Exibir avatares da direita para esquerda (padrão: false) */
  isRightToLeft?: boolean;
  /** Apenas sobrepor avatares, sem deslocamento no hover (padrão: false) */
  isOverlapOnly?: boolean;
  /** Posicionamento do tooltip (padrão: "bottom") */
  tooltipPlacement?: "top" | "bottom";
  /** Callback quando um avatar é clicado */
  onAvatarClick?: (user: User, index: number) => void;
  /** Callback quando o hover é ativado */
  onHover?: (user: User, index: number) => void;
  /** Callback quando o hover é desativado */
  onHoverEnd?: () => void;
}

/**
 * Props para o evento de teclado
 */
export interface KeyboardEventProps {
  /** Evento de teclado */
  event: KeyboardEvent<HTMLDivElement>;
  /** Índice do avatar */
  index: number;
  /** Usuário do avatar */
  user: User;
}

/**
 * Configurações de animação
 */
export interface AnimationConfig {
  /** Tipo de transição */
  type: "spring" | "tween" | "keyframes";
  /** Rigidez da animação (para spring) */
  stiffness?: number;
  /** Amortecimento da animação (para spring) */
  damping?: number;
  /** Duração da animação (para tween) */
  duration?: number;
  /** Easing da animação */
  ease?: string;
}

/**
 * Configurações de estilo
 */
export interface StyleConfig {
  /** Cor de fundo do container */
  backgroundColor?: string;
  /** Cor da borda dos avatares */
  borderColor?: string;
  /** Cor do texto do tooltip */
  tooltipTextColor?: string;
  /** Cor de fundo do tooltip */
  tooltipBackgroundColor?: string;
  /** Sombra dos avatares */
  shadowColor?: string;
  /** Cor de fundo do bubble +X */
  bubbleBackgroundColor?: string;
  /** Cor do texto do bubble +X */
  bubbleTextColor?: string;
}
