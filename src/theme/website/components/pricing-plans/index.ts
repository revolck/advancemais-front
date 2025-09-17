// src/theme/website/components/pricing-plans/index.ts

// Componente principal
export { default } from "./PricingPlans";
export { default as PricingPlans } from "./PricingPlans";

// Componentes individuais
export { PricingPlanCard } from "./components/PricingPlanCard";

// Hook
export { usePricingData } from "./hooks/usePricingData";

// Tipos e constantes
export type {
  PricingPlanData,
  PricingPlansProps,
  PricingPlanCardProps,
} from "./types";
export { PRICING_CONFIG } from "./constants";
