// src/theme/website/components/business-group-information/index.ts

// Componente principal
export { default } from "./BusinessGroupInformation";
export { default as BusinessGroupInformation } from "./BusinessGroupInformation";

// Componentes individuais
export { ContentSection } from "./components/ContentSection";

// Hook
export { useBusinessData } from "./hooks/useBusinessData";

// Tipos e constantes
export type {
  BusinessSectionData,
  BusinessGroupInformationProps,
  ContentSectionProps,
} from "./types";
export { DEFAULT_BUSINESS_DATA, BUSINESS_CONFIG } from "./constants";
