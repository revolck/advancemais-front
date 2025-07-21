// src/theme/website/components/communication-highlights/types/index.ts

/**
 * Interface para dados de imagem da galeria
 */
export interface GalleryImageData {
  id: string;
  imageUrl: string;
  alt: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados de texto da seção
 */
export interface CommunicationTextData {
  id: string;
  title: string;
  paragraphs: string[];
  highlightText?: string;
  citation?: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados completos da seção
 */
export interface CommunicationData {
  textContent: CommunicationTextData;
  gallery: GalleryImageData[];
}

/**
 * Interface para resposta da API
 */
export interface CommunicationApiResponse {
  data: CommunicationData;
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface CommunicationHighlightsProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: CommunicationData;
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: CommunicationData) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente de galeria
 */
export interface ImageGalleryProps {
  images: GalleryImageData[];
}

/**
 * Props do componente de texto
 */
export interface TextContentProps {
  content: CommunicationTextData;
}
