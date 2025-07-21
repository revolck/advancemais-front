// src/theme/website/components/process-steps/index.ts

// Componente principal
export { default } from "./ProcessSteps";
export { default as ProcessSteps } from "./ProcessSteps";

// Componentes individuais
export { ProcessStepItem } from "./components/ProcessStepItem";

// Hook
export { useProcessData } from "./hooks/useProcessData";

// Tipos e constantes
export type {
  ProcessSectionData,
  ProcessStepsProps,
  ProcessStepItemProps,
} from "./types";
export { DEFAULT_PROCESS_DATA, PROCESS_CONFIG } from "./constants";
