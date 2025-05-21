/**
 * Exportações do módulo de seleção de projetos
 *
 * Facilita a importação dos componentes deste módulo
 * Esconde a estrutura interna do módulo de outros componentes
 */

// Componentes visuais
export { ProjectAvatar } from "./components/ProjectAvatar";
export { ProjectSelector } from "./components/ProjectSelector";
export { ProjectSelectorModal } from "./components/ProjectSelectorModal";

// Store de projetos
export { useProjectStore } from "./store/projectStore";

// Tipos
export type { Project } from "./types/project.types";
