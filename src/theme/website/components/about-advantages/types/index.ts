// src/theme/website/components/about-advantages/types/index.ts

/**
 * Interface para dados de card de vantagem
 */
export interface AdvantageCard {
  id: string;
  icon: string; // Nome do ícone Lucide
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados da seção "Por que escolher"
 */
export interface WhyChooseData {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
}

/**
 * Interface para dados da seção "Sobre"
 */
export interface AboutData {
  id: string;
  title: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  overlayTitle: string;
  overlayDescription: string;
  overlayButtonText: string;
  overlayButtonUrl: string;
  isActive: boolean;
}

/**
 * Interface para dados completos vindos da API
 */
export interface AboutAdvantagesApiData {
  whyChoose: WhyChooseData;
  aboutSection: AboutData;
  advantageCards: AdvantageCard[];
}

/**
 * Interface para resposta da API
 */
export interface AboutAdvantagesApiResponse {
  data: AboutAdvantagesApiData;
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface AboutAdvantagesProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: AboutAdvantagesApiData;
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: AboutAdvantagesApiData) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props dos componentes individuais
 */
export interface AdvantageCardProps {
  card: AdvantageCard;
  index: number;
}

export interface WhyChooseSectionProps {
  data: WhyChooseData;
  cards: AdvantageCard[];
}

export interface AboutSectionProps {
  data: AboutData;
}
