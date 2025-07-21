// src/theme/website/components/header-pages/types/index.ts

/**
 * Interface para dados do header vindos da API
 */
export interface HeaderPageData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  imageAlt: string;
  isActive: boolean;
  /**
   * Páginas onde este header deve aparecer
   * Ex: ["/consultoria", "/recrutamento"] ou ["*"] para todas
   */
  targetPages: string[];
}

/**
 * Interface para resposta da API
 */
export interface HeaderApiResponse {
  data: HeaderPageData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface HeaderPagesProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: HeaderPageData;
  /**
   * Página atual para buscar o header correto
   * Se não fornecida, usa usePathname()
   */
  currentPage?: string;
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: HeaderPageData) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Interface para breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}
