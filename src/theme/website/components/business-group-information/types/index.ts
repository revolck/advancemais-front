/**
 * Interface para dados de seção de negócios vindos da API
 */
export interface BusinessSectionData {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
  imageAlt: string;
  reverse: boolean;
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface BusinessApiResponse {
  data: BusinessSectionData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface BusinessGroupInformationProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: BusinessSectionData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: BusinessSectionData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de seção
 */
export interface ContentSectionProps {
  data: BusinessSectionData;
  index: number;
}
