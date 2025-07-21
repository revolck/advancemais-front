// src/theme/website/components/service-highlight/types/index.ts

/**
 * Interface para dados de destaque de serviço vindos da API
 */
export interface ServiceHighlightData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlightText?: string;
  benefits: BenefitItem[];
  order: number;
  isActive: boolean;
}

/**
 * Interface para itens de benefício
 */
export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Interface para resposta da API
 */
export interface ServiceHighlightApiResponse {
  data: ServiceHighlightData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface ServiceHighlightProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: ServiceHighlightData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: ServiceHighlightData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de destaque
 */
export interface HighlightSectionProps {
  data: ServiceHighlightData;
  index: number;
}
