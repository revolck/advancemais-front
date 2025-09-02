// src/theme/website/components/team-showcase/types/index.ts

/**
 * Interface para dados de membro da equipe vindos da API
 */
export interface TeamMemberData {
  id: string;
  name: string;
  position: string;
  imageUrl: string;
  imageAlt: string;
  order: number;
  isActive: boolean;
}

/**
 * Interface para resposta da API
 */
export interface TeamApiResponse {
  data: TeamMemberData[];
  success: boolean;
  message?: string;
}

/**
 * Props do componente principal
 */
export interface TeamShowcaseProps {
  className?: string;
  /**
   * Título da seção
   * @default "Nossa Equipe"
   */
  title?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: TeamMemberData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: TeamMemberData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Tema da seção (cores, raio e gap)
   */
  theme?: {
    primaryColor?: string; // cor de destaque (borda/hover)
    secondaryColor?: string; // cor de apoio (texto/calls)
    radius?: number | string; // ex: 16 ou "1rem"
    gap?: number | string; // ex: 20 ou "1.25rem"
  };
}

/**
 * Props do componente individual de membro
 */
export interface TeamMemberProps {
  data: TeamMemberData;
  index: number;
}
