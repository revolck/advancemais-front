// src/theme/website/components/logo-enterprises/types/index.ts

/**
 * Interface para dados de logo de empresa vindos da API
 */
export interface LogoData {
  id: number;
  name: string;
  src: string;
  alt?: string;
  website?: string;
  category?: string;
  isActive: boolean;
  order: number;
}

/**
 * Interface para resposta da API
 */
export interface LogosApiResponse {
  data: LogoData[];
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Props do componente principal
 */
export interface LogoEnterprisesProps {
  className?: string;
  /**
   * Título da seção
   * @default "Quem está com a gente nessa jornada"
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
  staticData?: LogoData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: LogoData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Callback quando um logo é clicado
   */
  onLogoClick?: (logo: LogoData) => void;
}

/**
 * Props do componente individual de logo
 */
export interface LogoCardProps {
  logo: LogoData;
  onLogoClick?: (logo: LogoData) => void;
}
