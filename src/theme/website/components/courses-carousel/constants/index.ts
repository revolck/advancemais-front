// Sem mock data nesta camada; fonte é a API

/**
 * Configurações do componente
 */
export const COURSES_CONFIG = {
  api: {
    endpoint: "/api/courses/featured",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  carousel: {
    align: "start",
    containScroll: "trimSnaps",
    loop: true,
    slidesToScroll: 1,
    breakpoints: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4,
    },
  },
  image: {
    quality: 90,
    sizes: "(max-width: 640px) 300px, (max-width: 1024px) 280px, 300px",
    placeholder: "blur",
  },
} as const;

/**
 * Tags disponíveis para os cursos - ATUALIZADO COM TODAS AS TAGS
 */
export const COURSE_TAGS = {
  // Tags existentes
  popular: {
    label: "Popular",
    color: "bg-red-600",
    textColor: "text-white",
  },
  novo: {
    label: "Novo",
    color: "bg-green-600",
    textColor: "text-white",
  },

  // Novas tags solicitadas
  "início imediato": {
    label: "INÍCIO IMEDIATO",
    color: "bg-blue-600",
    textColor: "text-white",
  },
  gratuito: {
    label: "gratuito",
    color: "bg-emerald-600",
    textColor: "text-white",
  },
  promocao: {
    label: "promocao",
    color: "bg-orange-600",
    textColor: "text-white",
  },

  // Tags adicionais úteis
  destaque: {
    label: "Destaque",
    color: "bg-purple-600",
    textColor: "text-white",
  },
  limitado: {
    label: "Vagas Limitadas",
    color: "bg-yellow-600",
    textColor: "text-black",
  },
  certificado: {
    label: "Com Certificado",
    color: "bg-indigo-600",
    textColor: "text-white",
  },
  "em breve": {
    label: "Em Breve",
    color: "bg-gray-600",
    textColor: "text-white",
  },
  exclusivo: {
    label: "Exclusivo",
    color: "bg-pink-600",
    textColor: "text-white",
  },
} as const;

/**
 * Helper para obter configuração da tag
 */
export const getTagConfig = (tagName: string) => {
  const normalizedTag = tagName.toLowerCase();
  return (
    COURSE_TAGS[normalizedTag as keyof typeof COURSE_TAGS] || {
      label: tagName,
      color: "bg-gray-600",
      textColor: "text-white",
    }
  );
};
