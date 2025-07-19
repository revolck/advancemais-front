// src/theme/website/components/blog-section/types/index.ts

/**
 * Interface para dados de post do blog vindos da API
 */
export interface BlogPostData {
  id: number;
  title: string;
  image: string;
  link: string;
  excerpt?: string;
  author?: string;
  publishedAt?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  isActive: boolean;
  order: number;
  isFeatured?: boolean;
}

/**
 * Interface para resposta da API
 */
export interface BlogApiResponse {
  data: BlogPostData[];
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
export interface BlogSectionProps {
  className?: string;
  /**
   * Título da seção
   * @default "Dicas para crescer profissionalmente"
   */
  title?: string;
  /**
   * Texto do botão
   * @default "Ver mais dicas"
   */
  buttonText?: string;
  /**
   * URL do botão "Ver mais"
   * @default "/blog"
   */
  buttonUrl?: string;
  /**
   * Número máximo de posts a exibir no desktop
   * @default 4
   */
  maxPostsDesktop?: number;
  /**
   * Número máximo de posts a exibir no mobile
   * @default 2
   */
  maxPostsMobile?: number;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: BlogPostData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: BlogPostData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Callback quando um post é clicado
   */
  onPostClick?: (post: BlogPostData) => void;
}

/**
 * Props do componente individual de post
 */
export interface BlogCardProps {
  post: BlogPostData;
  onPostClick?: (post: BlogPostData) => void;
}
