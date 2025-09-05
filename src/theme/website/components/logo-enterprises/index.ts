// src/theme/website/components/logo-enterprises/index.ts

// Componente principal
export { default } from "./LogoEnterprises";
export { default as LogoEnterprises } from "./LogoEnterprises";

// Componentes individuais
export { LogoCard } from "./components/LogoCard";

// Hook
export { useLogosData } from "./hooks/useLogosData";

// Tipos e constantes
export type { LogoData, LogoEnterprisesProps, LogoCardProps } from "./types";
export { LOGOS_CONFIG, DEFAULT_CONTENT } from "./constants";
