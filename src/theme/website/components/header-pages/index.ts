// src/theme/website/components/header-pages/index.ts

// Componente principal
export { default } from "./HeaderPages";
export { default as HeaderPages } from "./HeaderPages";

// Componentes individuais
export { HeaderContent } from "./components/HeaderContent";

// Hook
export { useHeaderData } from "./hooks/useHeaderData";

// Utilitários
export { generateBreadcrumbs, capitalizeFirst, isExternalUrl } from "./utils";

// Tipos e constantes
export type { HeaderPageData, HeaderPagesProps, BreadcrumbItem } from "./types";
export { DEFAULT_HEADER_DATA, HEADER_CONFIG, ROUTE_LABELS } from "./constants";
