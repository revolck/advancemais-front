// src/theme/website/components/problem-solution-section/index.ts

// Componente principal
export { default } from "./ProblemSolutionSection";
export { default as ProblemSolutionSection } from "./ProblemSolutionSection";

// Componentes individuais
export { ProblemCard } from "./components/ProblemCard";
export { ProblemsList } from "./components/ProblemsList";

// Hook
export { useProblemSolutionData } from "./hooks/useProblemSolutionData";

// Tipos
export type {
  ProblemSolutionData,
  SectionData,
  ProblemSolutionSectionProps,
} from "./types";
