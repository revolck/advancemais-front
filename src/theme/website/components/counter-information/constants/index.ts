// Sem mock data nesta camada

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
