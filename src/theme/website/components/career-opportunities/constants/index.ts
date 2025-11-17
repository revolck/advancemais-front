// src/theme/website/components/career-opportunities/constants/index.ts

import type {
  JobData,
  CategoryCount,
  ModalityCount,
  ContractTypeCount,
  LevelCount,
} from "../types";

/**
 * Dados padrão para fallback quando a API falha
 */
export const DEFAULT_JOBS_DATA: JobData[] = [
  {
    id: 1,
    titulo: "Product Designer",
    empresa: "Gojek",
    empresaLogo: "/images/companies/gojek-logo.png",
    empresaAnonima: false,
    localizacao: "Singapore",
    tipoContrato: "CLT",
    modalidade: "Remoto",
    categoria: "Design",
    nivel: "Sênior",
    descricao:
      "Garantir volume de artes para suprir necessidades gráficas de materiais tanto digitais quanto físicos. Desenvolver o papel de guardião da identidade visual da marca garantindo sinergia entre todos os pontos de contato da jornada do cliente.",
    dataPublicacao: "09/12/2024",
    pcd: true,
    destaque: true,
    salario: { min: 8000, max: 12000, moeda: "BRL" },
    isActive: true,
  },
  {
    id: 2,
    titulo: "Copywriting Specialist",
    empresa: "Odama Studio",
    empresaLogo: "/images/companies/odama-logo.png",
    empresaAnonima: false,
    localizacao: "Paris",
    tipoContrato: "PJ",
    modalidade: "Presencial",
    categoria: "Marketing",
    nivel: "Pleno",
    descricao:
      "Garantir volume de artes para suprir necessidades gráficas de materiais tanto digitais quanto físicos. Desenvolver o papel de guardião da identidade visual da marca garantindo sinergia entre todos os pontos de contato da jornada do cliente.",
    dataPublicacao: "07/12/2024",
    pcd: true,
    destaque: false,
    isActive: true,
  },
  {
    id: 3,
    titulo: "Frontend Developer",
    empresa: "Tech Solutions",
    empresaAnonima: false,
    localizacao: "Belo Horizonte",
    tipoContrato: "CLT",
    modalidade: "Híbrido",
    categoria: "Tecnologia",
    nivel: "Pleno",
    descricao:
      "Desenvolver interfaces modernas e responsivas utilizando React, TypeScript e outras tecnologias frontend. Colaborar com equipes de design e backend para criar experiências excepcionais.",
    dataPublicacao: "05/12/2024",
    pcd: false,
    destaque: true,
    isActive: true,
  },
  {
    id: 4,
    titulo: "Marketing Digital",
    empresa: "Digital Agency",
    empresaAnonima: false,
    localizacao: "Brasília",
    tipoContrato: "CLT",
    modalidade: "Remoto",
    categoria: "Marketing",
    nivel: "Júnior",
    descricao:
      "Planejar e executar campanhas de marketing digital, analisar métricas de performance, gerenciar redes sociais e otimizar estratégias de conversão para diferentes clientes.",
    dataPublicacao: "03/12/2024",
    pcd: false,
    destaque: false,
    isActive: true,
  },
  {
    id: 5,
    titulo: "UX Designer",
    empresa: "Startup Inovadora",
    empresaAnonima: false,
    localizacao: "Florianópolis",
    tipoContrato: "PJ",
    modalidade: "Remoto",
    categoria: "Design",
    nivel: "Sênior",
    descricao:
      "Criar experiências digitais intuitivas e centradas no usuário, conduzir pesquisas de usabilidade, desenvolver protótipos e trabalhar em colaboração com equipes de produto.",
    dataPublicacao: "01/12/2024",
    pcd: true,
    destaque: false,
    isActive: true,
  },
];

/**
 * Contadores de filtros padrão
 */
export const DEFAULT_CATEGORIES: CategoryCount[] = [
  { nome: "Design", count: 24 },
  { nome: "Tecnologia", count: 42 },
  { nome: "Marketing", count: 18 },
  { nome: "Produto", count: 15 },
  { nome: "Vendas", count: 12 },
];

export const DEFAULT_MODALITIES: ModalityCount[] = [
  { nome: "Remoto", icon: "Monitor", count: 45 },
  { nome: "Presencial", icon: "Building2", count: 23 },
  { nome: "Híbrido", icon: "Zap", count: 12 },
];

export const DEFAULT_CONTRACT_TYPES: ContractTypeCount[] = [
  { nome: "CLT", count: 45, icon: "Briefcase" },
  { nome: "PJ", count: 23, icon: "User" },
  { nome: "Estágio", count: 12, icon: "GraduationCap" },
];

export const DEFAULT_LEVELS: LevelCount[] = [
  { nome: "Júnior", count: 18 },
  { nome: "Pleno", count: 32 },
  { nome: "Sênior", count: 25 },
];

/**
 * Configurações do componente
 */
export const CAREER_CONFIG = {
  api: {
    endpoint: "/api/jobs",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  pagination: {
    defaultItemsPerPage: 10,
    maxItemsPerPage: 50,
  },
  animation: {
    staggerDelay: 100,
    duration: 300,
  },
  search: {
    debounceDelay: 300,
    minSearchLength: 2,
  },
  sorting: {
    options: [
      { value: "recent", label: "Mais recente" },
      { value: "relevance", label: "Mais relevante" },
      { value: "salary_high", label: "Maior salário" },
      { value: "salary_low", label: "Menor salário" },
      { value: "name_az", label: "Nome (A-Z)" },
      { value: "name_za", label: "Nome (Z-A)" },
    ],
  },
} as const;

/**
 * Mapeamento de ícones para modalidades e tipos de contrato
 */
export const ICON_MAPPING = {
  modality: {
    Remoto: "Monitor",
    Presencial: "Building2",
    Híbrido: "Zap",
  },
  contractType: {
    CLT: "Briefcase",
    PJ: "User",
    Estágio: "GraduationCap",
  },
} as const;
