import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { IconName } from "../../Icons";
import { verticalTabsVariants } from "../variants";

/**
 * Item utilizado pelo componente VerticalTabs.
 */
export interface VerticalTabItem {
  /** Valor único do item. */
  value: string;
  /** Rótulo exibido na aba. */
  label: string;
  /** Ícone exibido antes do rótulo. */
  icon?: IconName;
  /** Conteúdo a ser renderizado quando a aba estiver ativa. */
  content: ReactNode;
  /** Se o item está desabilitado */
  disabled?: boolean;
  /** Badge ou contador a ser exibido */
  badge?: string | number;
}

/**
 * Propriedades do componente VerticalTabs - Apple Style Design
 */
export interface VerticalTabsProps extends VariantProps<typeof verticalTabsVariants> {
  /** Lista de itens que compõem as abas. */
  items: VerticalTabItem[];
  /** Valor inicial selecionado. */
  defaultValue?: string;
  /** Valor controlado da aba ativa */
  value?: string;
  /** Classe adicional aplicada ao contêiner raiz. */
  className?: string;
  /** Se deve mostrar o indicador visual na aba ativa */
  showIndicator?: boolean;
  /** Se deve habilitar animações */
  withAnimation?: boolean;
  /** Se deve mostrar o select em telas pequenas */
  showMobileSelect?: boolean;
  /** Largura da lista de abas */
  tabsWidth?: "auto" | "sm" | "md" | "lg" | "xl";
  /** Classes personalizadas para diferentes partes do componente */
  classNames?: {
    root?: string;
    tabsList?: string;
    tabsTrigger?: string;
    tabsContent?: string;
    mobileSelect?: string;
    contentWrapper?: string;
    indicator?: string;
  };
  /** Callback executado quando o valor da aba ativa muda. */
  onValueChange?: (value: string) => void;
}

/**
 * Props específicas para os triggers das abas
 */
export interface VerticalTabTriggerProps {
  variant?: "default" | "minimal" | "spacious";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  badge?: string | number;
  className?: string;
  disabled?: boolean;
}

/**
 * Props específicas para o conteúdo das abas  
 */
export interface VerticalTabContentProps {
  variant?: "default" | "minimal" | "spacious" | "bordered" | "card";
  padding?: "none" | "sm" | "md" | "lg";
  withAnimation?: boolean;
  className?: string;
}