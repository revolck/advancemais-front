// src/theme/website/components/course-catalog/types/index.ts

/**
 * Interface para turmas do curso
 */
export interface CourseTurma {
  id: number;
  numero: number;
  dataInicio: string; // formato: "21/07"
  dataFim: string; // formato: "25/08"
  vagas: number;
  vagasDisponiveis: number;
  isActive: boolean;
}

/**
 * Interface para dados de curso vindos da API - ATUALIZADO
 */
export interface CourseData {
  id: number;
  titulo: string;
  descricao: string;
  imagem?: string;
  categoria: string; // Mantém para filtros, mas não exibe
  modalidade: "Online" | "Live" | "Presencial";
  preco?: number;
  duracao?: string; // Ex: "40h"
  turmas: CourseTurma[]; // NOVO: Lista de turmas
  isActive: boolean;
  order: number;
}

/**
 * Interface para categorias
 */
export interface CategoryData {
  nome: string;
  count: number;
}

/**
 * Interface para modalidades
 */
export interface ModalityData {
  nome: "Online" | "Live" | "Presencial";
  icon: string;
  color: string;
}

/**
 * Interface para resposta da API
 */
export interface CourseCatalogApiResponse {
  data: {
    courses: CourseData[];
    categories: CategoryData[];
    totalPages: number;
    currentPage: number;
    totalCourses: number;
  };
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface CourseCatalogProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: {
    courses: CourseData[];
    categories: CategoryData[];
  };
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: {
    courses: CourseData[];
    categories: CategoryData[];
  }) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Se deve mostrar o header
   * @default true
   */
  showHeader?: boolean;
}

/**
 * Props do componente de card de curso
 */
export interface CourseCardProps {
  course: CourseData;
  index: number;
}

/**
 * Props do componente de filtros
 */
export interface CourseFiltersProps {
  categories: CategoryData[];
  modalidades: ModalityData[];
  categoriasSelecionadas: string[];
  modalidadesSelecionadas: string[];
  onToggleCategoria: (categoria: string) => void;
  onToggleModalidade: (modalidade: string) => void;
  onLimparFiltros: () => void;
  temFiltrosAtivos: boolean;
}

/**
 * Estado dos filtros
 */
export interface FilterState {
  busca: string;
  ordenacao: string;
  categoriasSelecionadas: string[];
  modalidadesSelecionadas: string[];
}

/**
 * Props para paginação
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}
