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
  "bg-red-100",
  "bg-orange-100",
  "bg-amber-100",
  "bg-yellow-100",
  "bg-[var(--primary-color)]",
  "bg-green-100",
  "bg-emerald-100",
  "bg-teal-100",
  "bg-cyan-100",
  "bg-sky-100",
  "bg-blue-100",
  "bg-indigo-100",
  "bg-violet-100",
  "bg-purple-100",
  "bg-fuchsia-100",
  "bg-pink-100",
  "bg-rose-100",
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
