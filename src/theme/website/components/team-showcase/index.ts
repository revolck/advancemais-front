// src/theme/website/components/team-showcase/index.ts

// Componente principal
export { default } from "./TeamShowcase";
export { default as TeamShowcase } from "./TeamShowcase";

// Componentes individuais
export { TeamMember } from "./components/TeamMember";

// Hook
export { useTeamData } from "./hooks/useTeamData";

// Tipos e constantes
export type {
  TeamMemberData,
  TeamShowcaseProps,
  TeamMemberProps,
} from "./types";
export { DEFAULT_TEAM_DATA, TEAM_CONFIG } from "./constants";
