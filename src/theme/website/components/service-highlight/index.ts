// src/theme/website/components/service-highlight/index.ts

// Componente principal
export { default } from "./ServiceHighlight";
export { default as ServiceHighlight } from "./ServiceHighlight";

// Componentes individuais
export { HighlightSection } from "./components/HighlightSection";

// Hook
export { useServiceHighlightData } from "./hooks/useServiceHighlightData";

// Tipos e constantes
export type {
  ServiceHighlightData,
  ServiceHighlightProps,
  HighlightSectionProps,
} from "./types";
export {
  DEFAULT_SERVICE_HIGHLIGHT_DATA,
  SERVICE_HIGHLIGHT_CONFIG,
} from "./constants";
