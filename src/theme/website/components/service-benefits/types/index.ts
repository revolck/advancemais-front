// src/theme/website/components/service-benefits/types/index.ts

/**
 * Interface para um benefício individual
 */
export interface ServiceBenefit {
  id: string;
  text: string;
  gradientType: "primary" | "secondary";
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados da seção de benefícios vindos da API
 */
export interface ServiceBenefitsData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  benefits: ServiceBenefit[];
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface ServiceBenefitsApiResponse {
  data: ServiceBenefitsData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface ServiceBenefitsProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: ServiceBenefitsData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: ServiceBenefitsData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de seção
 */
export interface ServiceBenefitsItemProps {
  data: ServiceBenefitsData;
  index: number;
}
