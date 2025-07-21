// src/theme/website/components/course-catalog/constants/index.ts

import type { CourseData, CategoryData, ModalityData } from "../types";

/**
 * Dados padrão de cursos para fallback - SIMPLIFICADO
 */
export const DEFAULT_COURSES_DATA: CourseData[] = [
  {
    id: 1,
    titulo: "Gestão Estratégica e Liderança",
    descricao:
      "Desenvolva competências essenciais para liderar equipes e tomar decisões estratégicas em ambientes corporativos complexos.",
    imagem: "/images/courses/gestao-estrategica.webp",
    categoria: "Negócios",
    modalidade: "Online",
    preco: 299,
    duracao: "40h", // Oculto do usuário
    turmas: [], // Oculto do usuário
    isActive: true,
    order: 1,
  },
  {
    id: 2,
    titulo: "Transformação Digital e Inovação",
    descricao:
      "Compreenda os fundamentos da transformação digital e como implementar processos inovadores nas organizações.",
    imagem: "/images/courses/transformacao-digital.webp",
    categoria: "Tecnologia",
    modalidade: "Live",
    preco: 399,
    duracao: "50h",
    turmas: [],
    isActive: true,
    order: 2,
  },
  {
    id: 3,
    titulo: "Finanças Corporativas Avançadas",
    descricao:
      "Análise financeira, gestão de riscos e estratégias de investimento para profissionais de finanças.",
    imagem: "/images/courses/financas-corporativas.webp",
    categoria: "Finanças",
    modalidade: "Presencial",
    preco: 599,
    duracao: "60h",
    turmas: [],
    isActive: true,
    order: 3,
  },
  {
    id: 4,
    titulo: "Marketing Digital e Analytics",
    descricao:
      "Estratégias avançadas de marketing digital com foco em análise de dados e performance de campanhas.",
    imagem: "/images/courses/marketing-digital.webp",
    categoria: "Marketing",
    modalidade: "Online",
    preco: 349,
    duracao: "45h",
    turmas: [],
    isActive: true,
    order: 4,
  },
  {
    id: 5,
    titulo: "Direito Empresarial e Compliance",
    descricao:
      "Aspectos jurídicos essenciais para a gestão empresarial e implementação de programas de compliance.",
    imagem: "/images/courses/direito-empresarial.webp",
    categoria: "Direito",
    modalidade: "Live",
    preco: 459,
    duracao: "55h",
    turmas: [],
    isActive: true,
    order: 5,
  },
  {
    id: 6,
    titulo: "Sustentabilidade e ESG",
    descricao:
      "Práticas sustentáveis e critérios ESG na gestão empresarial moderna e responsabilidade corporativa.",
    imagem: "/images/courses/sustentabilidade-esg.webp",
    categoria: "Sustentabilidade",
    modalidade: "Presencial",
    preco: 399,
    duracao: "35h",
    turmas: [],
    isActive: true,
    order: 6,
  },
  {
    id: 7,
    titulo: "Inteligência Artificial nos Negócios",
    descricao:
      "Como aplicar IA para otimizar processos empresariais e criar vantagens competitivas.",
    categoria: "Tecnologia",
    modalidade: "Online",
    preco: 549,
    duracao: "45h",
    turmas: [],
    isActive: true,
    order: 7,
  },
  {
    id: 8,
    titulo: "Growth Hacking e Métricas",
    descricao:
      "Estratégias de crescimento acelerado e análise de métricas para startups e empresas.",
    categoria: "Marketing",
    modalidade: "Live",
    preco: 299,
    duracao: "30h",
    turmas: [],
    isActive: true,
    order: 8,
  },
  {
    id: 9,
    titulo: "Análise de Investimentos",
    descricao:
      "Técnicas avançadas para análise e seleção de investimentos no mercado financeiro.",
    categoria: "Finanças",
    modalidade: "Presencial",
    preco: 679,
    duracao: "50h",
    turmas: [],
    isActive: true,
    order: 9,
  },
  {
    id: 10,
    titulo: "Gestão de Projetos Ágeis",
    descricao:
      "Metodologias ágeis para gestão eficiente de projetos em ambientes dinâmicos.",
    categoria: "Negócios",
    modalidade: "Online",
    preco: 399,
    duracao: "40h",
    turmas: [],
    isActive: true,
    order: 10,
  },
  {
    id: 11,
    titulo: "Data Science para Negócios",
    descricao:
      "Aplicação prática de ciência de dados para tomada de decisões empresariais.",
    categoria: "Tecnologia",
    modalidade: "Live",
    preco: 599,
    duracao: "60h",
    turmas: [],
    isActive: true,
    order: 11,
  },
  {
    id: 12,
    titulo: "E-commerce e Vendas Digitais",
    descricao:
      "Estratégias completas para criar e otimizar lojas virtuais de alta conversão.",
    categoria: "Marketing",
    modalidade: "Online",
    preco: 449,
    duracao: "35h",
    turmas: [],
    isActive: true,
    order: 12,
  },
];

export const DEFAULT_CATEGORIES_DATA: CategoryData[] = [
  { nome: "Negócios", count: 4 },
  { nome: "Tecnologia", count: 3 },
  { nome: "Finanças", count: 2 },
  { nome: "Marketing", count: 3 },
  { nome: "Direito", count: 1 },
  { nome: "Sustentabilidade", count: 1 },
];

export const MODALIDADES: ModalityData[] = [
  {
    nome: "Online",
    icon: "Monitor",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  { nome: "Live", icon: "Zap", color: "bg-red-50 text-red-700 border-red-200" },
  {
    nome: "Presencial",
    icon: "MapPin",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

/**
 * Configurações do componente - CORRIGIDO
 */
export const COURSE_CATALOG_CONFIG = {
  api: {
    endpoint: "/api/courses/catalog",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  animation: {
    staggerDelay: 100,
    duration: 600,
  },
  image: {
    quality: 90,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    placeholder: "blur",
  },
  pagination: {
    itemsPerPage: 8, // CORRIGIDO: 8 por página
  },
  search: {
    debounceDelay: 300,
  },
} as const;

export const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "alfabetica", label: "A-Z" },
  { value: "preco-baixo", label: "Menor Preço" },
  { value: "preco-alto", label: "Maior Preço" },
  { value: "recente", label: "Mais Recente" },
] as const;
