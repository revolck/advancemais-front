import { IconName } from "@/components/ui/custom/Icons";
import { UserRole } from "@/config/roles";

/**
 * Definição de um item do menu
 */
export interface MenuItem {
  readonly icon: IconName | null;
  readonly label: string;
  readonly route?: string;
  /**
   * Propriedade mutável para marcar o item ativo dinamicamente.
   * Mantida fora do objeto imutável original.
   */
  active?: boolean;
  readonly submenu?: readonly MenuItem[];
  readonly permissions?: readonly UserRole[];
}

/**
 * Definição de uma seção do menu
 */
export interface MenuSection {
  readonly title: string;
  readonly items: readonly MenuItem[];
}

/**
 * Props para o componente principal Sidebar
 */
export interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

/**
 * Props para o componente MenuItem
 */
export interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  handleNavigation: () => void;
  level: number;
  parentId?: string; // ID do menu pai para rastreamento e controle
}

/**
 * Props para o componente MenuSection
 */
export interface MenuSectionProps {
  section: MenuSection;
  isCollapsed: boolean;
  handleNavigation: () => void;
}

/**
 * Props para o componente SidebarHeader
 */
export interface SidebarHeaderProps {
  isCollapsed: boolean;
  onCloseMobile: () => void;
}
