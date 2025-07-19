import type { CourseData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_COURSES_DATA: CourseData[] = [
  {
    id: 1,
    title: "Indicadores de Recrutamento e Seleção",
    image: "/images/courses/course-1.png",
    tag: "Popular",
    description:
      "Aprenda a otimizar processos de recrutamento com indicadores eficazes",
    url: "/cursos/indicadores-recrutamento",
    duration: "8 horas",
    level: "Intermediário",
    instructor: "João Silva",
    price: 197,
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    title: "Oratória e Persuasão para Líderes",
    image: "/images/courses/course-2.png",
    tag: "Novo",
    description: "Desenvolva habilidades de comunicação e liderança",
    url: "/cursos/oratoria-persuasao",
    duration: "12 horas",
    level: "Avançado",
    instructor: "Maria Santos",
    price: 297,
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    title: "Formação em RH Generalista",
    image: "/images/courses/course-3.png",
    tag: "INÍCIO IMEDIATO",
    description: "Curso completo para profissionais de Recursos Humanos",
    url: "/cursos/rh-generalista",
    duration: "40 horas",
    level: "Iniciante",
    instructor: "Carlos Oliveira",
    price: 497,
    isActive: true,
    order: 3,
  },
  {
    id: 4,
    title: "Como Montar um Currículo",
    image: "/images/courses/course-4.png",
    tag: "gratuito",
    description: "Estratégias para criar currículos que impressionam",
    url: "/cursos/montar-curriculo",
    duration: "4 horas",
    level: "Iniciante",
    instructor: "Ana Costa",
    price: 0,
    isActive: true,
    order: 4,
  },
  {
    id: 5,
    title: "Emprego e Métodos Eficazes",
    image: "/images/courses/course-5.png",
    tag: "promocao",
    description: "Técnicas comprovadas para conquistar a vaga dos sonhos",
    url: "/cursos/emprego-metodos",
    duration: "6 horas",
    level: "Iniciante",
    instructor: "Pedro Lima",
    price: 147,
    isActive: true,
    order: 5,
  },
  {
    id: 6,
    title: "Técnicas de Feedback Eficaz",
    image: "/images/courses/course-6.png",
    tag: "Novo",
    description: "Aprenda a dar e receber feedback de forma construtiva",
    url: "/cursos/feedback-eficaz",
    duration: "5 horas",
    level: "Intermediário",
    instructor: "Fernanda Rocha",
    price: 127,
    isActive: true,
    order: 6,
  },
  {
    id: 7,
    title: "Gestão de Tempo e Produtividade",
    image: "/images/courses/course-7.png",
    tag: "Popular",
    description: "Maximize sua produtividade com técnicas de gestão de tempo",
    url: "/cursos/gestao-tempo",
    duration: "8 horas",
    level: "Intermediário",
    instructor: "Roberto Silva",
    price: 197,
    isActive: true,
    order: 7,
  },
  {
    id: 8,
    title: "Liderança e Gestão de Equipes",
    image: "/images/courses/course-8.png",
    tag: "INÍCIO IMEDIATO",
    description: "Desenvolva competências de liderança e gestão",
    url: "/cursos/lideranca-gestao",
    duration: "15 horas",
    level: "Avançado",
    instructor: "Luciana Mendes",
    price: 347,
    isActive: true,
    order: 8,
  },
];

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
