/**
 * Arquivo de barril (barrel file) para exportações do sidebar
 *
 * Facilita a importação de componentes e tipos sem expor a estrutura interna
 * Fornece uma API limpa para outros módulos
 */

// Exportação do componente principal
export { Sidebar } from "./Sidebar";

// Exportação do módulo de seleção de projetos
export { ProjectSelector } from "./modules/project-selector";

// Exportação dos tipos
export type { SidebarProps } from "./types/sidebar.types";
