import { HTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";
import { imageNotFoundVariants } from "../variants";

/**
 * Props para o componente ImageNotFound
 * Estende HTMLAttributes para permitir props nativas do div
 */
export interface ImageNotFoundProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof imageNotFoundVariants> {
  /**
   * Texto alternativo para acessibilidade
   * @default "Imagem não encontrada"
   */
  alt?: string;

  /**
   * Mensagem customizada a ser exibida
   */
  message?: string;

  /**
   * Se deve mostrar o texto da mensagem
   * @default true
   */
  showMessage?: boolean;

  /**
   * Ícone customizado (nome do ícone Lucide)
   * @default "Image"
   */
  icon?: string;

  /**
   * Tamanho do ícone em pixels
   * @default baseado na variante
   */
  iconSize?: number;

  /**
   * Se deve ter animação de hover
   * @default false
   */
  withAnimation?: boolean;

  /**
   * Callback quando o componente é clicado
   */
  onClick?: () => void;

  /**
   * Se o componente é clicável
   * @default false
   */
  clickable?: boolean;

  /**
   * Aspect ratio para o container
   * @default undefined
   */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
}

/**
 * Configuração de tamanhos para ícones baseado na variante
 */
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
} as const;

/**
 * Mensagens padrão para diferentes contextos
 */
export const DEFAULT_MESSAGES = {
  notFound: "Imagem não encontrada",
  loading: "Carregando imagem...",
  error: "Erro ao carregar imagem",
  empty: "Nenhuma imagem selecionada",
  placeholder: "Adicionar imagem",
} as const;
