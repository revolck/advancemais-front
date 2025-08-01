// src/theme/website/components/process-steps/types/index.ts

/**
 * Interface para dados de etapa do processo vindos da API
 */
export interface ProcessStepData {
  id: string;
  number: number;
  title: string;
  description: string;
  icon?: string; // Nome do ícone Lucide ou URL da imagem
  imageUrl?: string; // URL da imagem (opcional)
  imageAlt?: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados da seção principal
 */
export interface ProcessSectionData {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  steps: ProcessStepData[];
}

/**
 * Interface para resposta da API
 */
export interface ProcessApiResponse {
  data: ProcessSectionData;
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface ProcessStepsProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: ProcessSectionData;
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: ProcessSectionData) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de etapa
 */
export interface ProcessStepItemProps {
  step: ProcessStepData;
  index: number;
}
