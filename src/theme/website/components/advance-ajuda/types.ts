// src/theme/website/components/advance-ajuda/types.ts

/** Itens de benefício exibidos no componente */
export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

/** Estrutura utilizada pelo componente após transformação */
export interface AdvanceAjudaData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlightText?: string;
  benefits: BenefitItem[];
}

/** Propriedades do componente principal */
export interface AdvanceAjudaProps {
  className?: string;
  /** Se deve carregar dados da API (default true) */
  fetchFromApi?: boolean;
  /** Dados estáticos para fallback ou testes */
  staticData?: AdvanceAjudaData[];
  /** Callback quando os dados são carregados */
  onDataLoaded?: (data: AdvanceAjudaData[]) => void;
  /** Callback quando ocorre erro */
  onError?: (error: string) => void;
}

/** Propriedades de cada seção exibida */
export interface HighlightSectionProps {
  data: AdvanceAjudaData;
  index: number;
}
