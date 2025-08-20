/**
 * Arquivo principal de exportação do tema
 * Centraliza todas as exportações dos componentes do tema
 */

// Exportações do Sidebar
export { Sidebar as DashboardSidebar } from "./dashboard/sidebar";
export type { SidebarProps } from "./dashboard/sidebar";

// Exportações do Header
export { DashboardHeader } from "./dashboard/header";
export type { DashboardHeaderProps } from "./dashboard/header";

// Exportações dos componentes específicos do header (caso necessário usar individualmente)
export { NotificationButton } from "./dashboard/header/components/NotificationButton";
export { UserButton } from "./dashboard/header/components/UserButton";
