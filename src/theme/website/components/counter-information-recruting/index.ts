// Componente principal
export { default } from "./CounterInformationRecruting";
export { default as CounterInformation } from "./CounterInformationRecruting";

// Componentes individuais
export { CounterItem } from "./components/CounterItem";

// Hook
export { useCounterData } from "./hooks/useCounterData";

// Utilitários
export { formatNumber, formatCompactNumber, animateValue } from "./utils";

// Tipos e constantes
export type {
  CounterData,
  CounterInformationProps,
  CounterItemProps,
} from "./types";
export { DEFAULT_COUNTER_DATA, COUNTER_CONFIG } from "./constants";
