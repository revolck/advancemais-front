// src/theme/website/components/accordion-group-information/index.ts

// Componente principal
export { default } from "./AccordionGroupInformation";
export { default as AccordionGroupInformation } from "./AccordionGroupInformation";

// Componentes individuais
export { AccordionSection } from "./components/AccordionSection";

// Hook
export { useAccordionData } from "./hooks/useAccordionData";

// Tipos e constantes
export type {
  AccordionSectionData,
  AccordionGroupInformationProps,
  AccordionSectionProps,
} from "./types";
export { DEFAULT_ACCORDION_DATA, ACCORDION_CONFIG } from "./constants";
