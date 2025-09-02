// src/theme/website/components/accordion-group-information/types/index.ts

/**
 * Interface para item do accordion
 */
export interface AccordionItemData {
  id: string;
  value: string;
  trigger: string;
  content: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados de seção de accordion vindos da API
 */
export interface AccordionSectionData {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "mp4" | "url";
  items: AccordionItemData[];
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface AccordionApiResponse {
  data: AccordionSectionData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface AccordionGroupInformationProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: AccordionSectionData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: AccordionSectionData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de seção
 */
export interface AccordionSectionProps {
  data: AccordionSectionData;
  index: number;
}
