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
export { PROCESS_CONFIG } from "./constants";
