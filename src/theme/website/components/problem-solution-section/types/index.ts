// src/theme/website/components/problem-solution-section/types/index.ts

import type { IconName } from "@/components/ui/custom/Icons";

/**
 * Interface para dados de problema/solução vindos da API
 */
export interface ProblemSolutionData {
  id: string;
  icon: IconName;
  iconColor?: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para dados da seção completa
 */
export interface SectionData {
  id: string;
  mainTitle: string;
  mainDescription: string;
  problems: ProblemSolutionData[];
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface ProblemSolutionApiResponse {
  data: SectionData;
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface ProblemSolutionSectionProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: SectionData;
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: SectionData) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
}

/**
 * Props do componente individual de card
 */
export interface ProblemCardProps {
  data: ProblemSolutionData;
  index: number;
}
