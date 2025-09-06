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
  ServiceType,
} from "./types";
export { SERVICE_BENEFITS_CONFIG } from "./constants";
