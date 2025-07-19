// src/theme/website/components/courses-carousel/types/index.ts

/**
 * Interface para dados de curso vindos da API
 */
export interface CourseData {
  id: number;
  title: string;
  image: string;
  tag: string;
  description?: string;
  url?: string;
  duration?: string;
  level?: string;
  instructor?: string;
  price?: number;
  isActive: boolean;
  order: number;
}

/**
 * Interface para resposta da API
 */
export interface CoursesApiResponse {
  data: CourseData[];
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Props do componente principal
 */
export interface CoursesCarouselProps {
  className?: string;
  /**
   * Título da seção
   * @default "Cursos em destaque"
   */
  title?: string;
  /**
   * Texto do botão
   * @default "Ver todos os cursos"
   */
  buttonText?: string;
  /**
   * URL do botão "Ver todos"
   * @default "/cursos"
   */
  buttonUrl?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: CourseData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: CourseData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Callback quando um curso é clicado
   */
  onCourseClick?: (course: CourseData) => void;
}

/**
 * Props do componente individual de curso
 */
export interface CourseCardProps {
  course: CourseData;
  onCourseClick?: (course: CourseData) => void;
}
