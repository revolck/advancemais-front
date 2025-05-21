import { IconName } from "@/components/ui/custom/Icons";

/**
 * Definição de um item do menu
 */
export interface MenuItem {
  icon: IconName | null;
  label: string;
  href?: string;
  active?: boolean;
  submenu?: MenuItem[];
}

/**
 * Definição de uma seção do menu
 */
export interface MenuSection {
  title: string;
  items: MenuItem[];
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
