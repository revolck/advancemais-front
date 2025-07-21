// src/theme/website/components/training-results/types/index.ts

/**
 * Interface para dados de resultados de treinamento vindos da API
 */
export interface TrainingResultData {
  id: string;
  title: string;
  description?: string;
  iconName?: string; // Nome do ícone Lucide
  iconUrl?: string; // URL de imagem customizada
  color?: string; // Cor do ícone
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface TrainingResultsApiResponse {
  data: TrainingResultData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface TrainingResultsProps {
  className?: string;
  /**
   * Título da seção
   */
  title?: string;
  /**
   * Subtítulo destacado
   */
  highlightedText?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: TrainingResultData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: TrainingResultData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de resultado
 */
export interface TrainingResultCardProps {
  data: TrainingResultData;
  index: number;
}
