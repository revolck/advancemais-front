// src/theme/website/components/training-results/index.ts

// Componente principal
export { default } from "./TrainingResults";
export { default as TrainingResults } from "./TrainingResults";

// Componentes individuais
export { TrainingResultCard } from "./components/TrainingResultCard";

// Hook
export { useTrainingData } from "./hooks/useTrainingData";

// Tipos e constantes
export type {
  TrainingResultData,
  TrainingResultsProps,
  TrainingResultCardProps,
} from "./types";
export { DEFAULT_TRAINING_RESULTS, TRAINING_RESULTS_CONFIG } from "./constants";
