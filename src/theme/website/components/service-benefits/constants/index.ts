// Sem mock data nesta camada; fonte é a API

/**
 * Configurações do componente
 */
export const SERVICE_BENEFITS_CONFIG = {
  animation: {
    staggerDelay: 150, // Delay entre benefícios
    duration: 400,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
  gradients: {
    primary: {
      background:
        "linear-gradient(90deg, rgba(0, 25, 86, 0.14) 0%, rgba(0, 25, 86, 0) 100%)",
      color: "#001956",
      circleColor: "bg-[#001956]", // primary color
    },
    secondary: {
      background:
        "linear-gradient(90deg, rgba(255, 31, 41, 0.14) 0%, rgba(255, 31, 41, 0) 100%)",
      color: "#ff1f29",
      circleColor: "bg-[#ff1f29]", // secondary color
    },
  },
} as const;
