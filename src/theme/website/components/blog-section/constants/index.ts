// src/theme/website/components/blog-section/constants/index.ts

import type { BlogPostData } from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_BLOG_DATA: BlogPostData[] = [
  {
    id: 1,
    title: "25 Perguntas da Entrevista de Emprego e Suas Melhores Respostas",
    image: "/images/blog/blog-post-1.png",
    link: "/blog/25-perguntas-entrevista-emprego",
    excerpt:
      "Prepare-se para sua próxima entrevista com as respostas mais eficazes para as perguntas mais comuns.",
    author: "Maria Silva",
    publishedAt: "2024-01-15",
    category: "Carreira",
    tags: ["entrevista", "emprego", "dicas"],
    readTime: "8 min",
    isActive: true,
    order: 1,
    isFeatured: true,
  },
  {
    id: 2,
    title: "15 Habilidades e Competências que Valorizam o Currículo",
    image: "/images/blog/blog-post-2.png",
    link: "/blog/15-habilidades-competencias-curriculo",
    excerpt:
      "Descubra quais habilidades são mais valorizadas pelo mercado de trabalho atual.",
    author: "João Santos",
    publishedAt: "2024-01-10",
    category: "Desenvolvimento",
    tags: ["habilidades", "currículo", "competências"],
    readTime: "6 min",
    isActive: true,
    order: 2,
    isFeatured: false,
  },
  {
    id: 3,
    title:
      "Resumo Profissional: Dicas e Modelos para Destacar Seus Diferenciais",
    image: "/images/blog/blog-post-3.png",
    link: "/blog/resumo-profissional-dicas-modelos",
    excerpt:
      "Aprenda a criar um resumo profissional que chame a atenção dos recrutadores.",
    author: "Ana Costa",
    publishedAt: "2024-01-05",
    category: "Currículo",
    tags: ["resumo", "currículo", "diferencial"],
    readTime: "5 min",
    isActive: true,
    order: 3,
    isFeatured: false,
  },
  {
    id: 4,
    title: "Como Fazer um Currículo Incrível",
    image: "/images/blog/blog-post-4.png",
    link: "/blog/como-fazer-curriculo-incrivel",
    excerpt:
      "Guia completo com tudo que você precisa saber para criar um currículo que se destaque.",
    author: "Carlos Oliveira",
    publishedAt: "2024-01-01",
    category: "Currículo",
    tags: ["currículo", "dicas", "modelo"],
    readTime: "10 min",
    isActive: true,
    order: 4,
    isFeatured: true,
  },
  {
    id: 5,
    title: "Networking: Como Construir uma Rede de Contatos Profissionais",
    image: "/images/blog/blog-post-5.png",
    link: "/blog/networking-rede-contatos-profissionais",
    excerpt:
      "Estratégias eficazes para expandir sua rede de contatos e acelerar sua carreira.",
    author: "Fernanda Lima",
    publishedAt: "2023-12-28",
    category: "Networking",
    tags: ["networking", "contatos", "carreira"],
    readTime: "7 min",
    isActive: true,
    order: 5,
    isFeatured: false,
  },
  {
    id: 6,
    title: "Soft Skills: As Habilidades Comportamentais Mais Procuradas",
    image: "/images/blog/blog-post-6.png",
    link: "/blog/soft-skills-habilidades-comportamentais",
    excerpt:
      "Entenda quais soft skills são essenciais para o sucesso profissional nos dias de hoje.",
    author: "Roberto Mendes",
    publishedAt: "2023-12-25",
    category: "Desenvolvimento",
    tags: ["soft skills", "comportamento", "habilidades"],
    readTime: "6 min",
    isActive: true,
    order: 6,
    isFeatured: false,
  },
];

/**
 * Configurações do componente
 */
export const BLOG_CONFIG = {
  api: {
    endpoint: "/api/blog/posts",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  display: {
    desktop: {
      maxPosts: 4,
      columns: 4,
    },
    mobile: {
      maxPosts: 2,
      columns: 1,
    },
    tablet: {
      maxPosts: 4,
      columns: 2,
    },
  },
  image: {
    quality: 90,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    placeholder: "blur",
  },
  animation: {
    staggerDelay: 150,
    duration: 300,
  },
} as const;

/**
 * Categorias disponíveis para os posts
 */
export const BLOG_CATEGORIES = {
  carreira: {
    label: "Carreira",
    color: "bg-blue-600",
  },
  desenvolvimento: {
    label: "Desenvolvimento",
    color: "bg-green-600",
  },
  curriculo: {
    label: "Currículo",
    color: "bg-purple-600",
  },
  networking: {
    label: "Networking",
    color: "bg-orange-600",
  },
  entrevista: {
    label: "Entrevista",
    color: "bg-red-600",
  },
  dicas: {
    label: "Dicas",
    color: "bg-gray-600",
  },
} as const;
