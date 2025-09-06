/**
 * Interface para dados de depoimento vindos da API
 */
export interface TestimonialData {
  id: string;
  name: string;
  position: string;
  company?: string;
  testimonial: string;
  imageUrl: string;
  rating?: number;
  order: number;
  isActive: boolean;
}

/**
 * Props do componente principal
 */
export interface TestimonialsCarouselProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: TestimonialData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: TestimonialData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de depoimento
 */
export interface TestimonialItemProps {
  data: TestimonialData;
  index: number;
}
