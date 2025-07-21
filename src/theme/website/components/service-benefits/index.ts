// src/theme/website/components/service-benefits/index.ts

// Componente principal
export { default } from "./ServiceBenefits";
export { default as ServiceBenefits } from "./ServiceBenefits";

// Componentes individuais
export { ServiceBenefitsItem } from "./components/ServiceBenefitsItem";

// Hook
export { useServiceBenefits } from "./hooks/useServiceBenefits";

// Tipos e constantes
export type {
  ServiceBenefitsData,
  ServiceBenefitsProps,
  ServiceBenefitsItemProps,
} from "./types";
export {
  DEFAULT_SERVICE_BENEFITS_DATA,
  SERVICE_BENEFITS_CONFIG,
} from "./constants";
