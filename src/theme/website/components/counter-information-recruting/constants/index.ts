import type { CounterData } from "../types";

export const DEFAULT_COUNTER_DATA: CounterData[] = [
  {
    id: "students",
    value: 20000,
    suffix: "",
    description: "vagas preenchidas",
    order: 1,
    isActive: true,
  },
  {
    id: "courses",
    value: 85,
    suffix: "%",
    description: "aprovados",
    order: 2,
    isActive: true,
  },
  {
    id: "teachers",
    value: 200,
    suffix: "",
    description: "empresas parceiras",
    order: 3,
    isActive: true,
  },
  {
    id: "certificates",
    value: 20,
    suffix: "",
    description: "profissionais especialista",
    order: 4,
    isActive: true,
  },
];

export const COUNTER_CONFIG = {
  animation: {
    defaultDuration: 1200,
    delay: 100,
    easing: "easeOutQuart",
  },
  api: {
    endpoint: "/api/statistics/counters",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  display: {
    decimals: 0,
    useGroupingSeparator: false,
    locale: "pt-BR",
    compact: true,
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
} as const;
