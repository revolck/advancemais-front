// src/theme/website/components/career-opportunities/index.ts

// Componente principal
export { default } from "./CareerOpportunities";
export { default as CareerOpportunities } from "./CareerOpportunities";

// Componentes individuais
export { JobCard } from "./components/JobCard";

// Hook
export { useCareerData } from "./hooks/useCareerData";

// Tipos e constantes
export type { JobData, CareerOpportunitiesProps, JobCardProps } from "./types";
export { DEFAULT_JOBS_DATA, CAREER_CONFIG } from "./constants";
