import { HTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";
import { avatarCustomVariants } from "../variants";

export interface AvatarCustomProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof avatarCustomVariants> {
  /**
   * Nome completo da pessoa para gerar iniciais
   * @example "João Feitosa Fernandes" → "JF"
   */
  name: string;

  /**
   * URL da imagem do avatar
   * Se não fornecida, mostra iniciais
   */
  src?: string;

  /**
   * Texto alternativo para a imagem
   * @default nome da pessoa
   */
  alt?: string;

  /**
   * Se deve usar cor de fundo fixa ao invés de aleatória
   */
  fixedColor?: string;

  /**
   * Se deve mostrar um indicador de status online
   * @default false
   */
  showStatus?: boolean;

  /**
   * Status da pessoa (online, offline, away, busy)
   * @default "offline"
   */
  status?: "online" | "offline" | "away" | "busy";

  /**
   * Se deve ser clicável
   * @default false
   */
  clickable?: boolean;

  /**
   * Callback quando o avatar é clicado
   */
  onClick?: () => void;

  /**
   * Se deve ter borda
   * @default false
   */
  withBorder?: boolean;

  /**
   * Se está em estado de carregamento
   * @default false
   */
  isLoading?: boolean;
}

/**
 * Configuração de cores para avatares sem imagem
 */
export const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
] as const;

/**
 * Cores de status para indicadores
 */
export const STATUS_COLORS = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
} as const;
