import type { ReactNode } from "react";
import type { IconName } from "../Icons";

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
}

/**
 * Propriedades do componente VerticalTabs.
 */
export interface VerticalTabsProps {
  /** Lista de itens que compõem as abas. */
  items: VerticalTabItem[];
  /** Valor inicial selecionado. */
  defaultValue?: string;
  /** Classe adicional aplicada ao contêiner raiz. */
  className?: string;
  /** Classe adicional aplicada à lista de abas. */
  listClassName?: string;
  /** Classe adicional aplicada aos gatilhos das abas. */
  triggerClassName?: string;
  /** Classe adicional aplicada ao seletor exibido em telas menores. */
  selectClassName?: string;
  /** Classe adicional aplicada ao conteúdo da aba. */
  contentClassName?: string;
  /** Callback executado quando o valor da aba ativa muda. */
  onValueChange?: (value: string) => void;
}
