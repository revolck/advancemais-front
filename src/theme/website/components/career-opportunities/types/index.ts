// src/theme/website/components/career-opportunities/types/index.ts

/**
 * Interface para dados de vaga vindos da API
 */
export interface JobData {
  id: number;
  titulo: string;
  empresa: string;
  empresaLogo?: string;
  empresaAnonima: boolean;
  localizacao: string;
  tipoContrato: string;
  modalidade: string;
  categoria: string;
  nivel: string;
  descricao: string;
  dataPublicacao: string;
  pcd: boolean;
  destaque: boolean;
  salario?: {
    min?: number;
    max?: number;
    moeda: string;
  };
  beneficios?: string[];
  requisitos?: string[];
  vagasDisponiveis?: number;
  urlCandidatura?: string;
  isActive: boolean;
}

/**
 * Interface para filtros
 */
export interface JobFilters {
  busca: string;
  categorias: string[];
  modalidades: string[];
  tiposContrato: string[];
  niveis: string[];
  apenasDestaque: boolean;
  apenasVagasPCD: boolean;
}

/**
 * Interface para resposta da API
 */
export interface CareerApiResponse {
  data: JobData[];
  totalCount: number;
  filters: {
    categorias: CategoryCount[];
    modalidades: ModalityCount[];
    tiposContrato: ContractTypeCount[];
    niveis: LevelCount[];
  };
  success: boolean;
  message?: string;
}

/**
 * Interfaces para contadores de filtros
 */
export interface CategoryCount {
  nome: string;
  count: number;
}

export interface ModalityCount {
  nome: string;
  count: number;
  icon: string;
}

export interface ContractTypeCount {
  nome: string;
  count: number;
  icon: string;
}

export interface LevelCount {
  nome: string;
  count: number;
}

/**
 * Props do componente principal
 */
export interface CareerOpportunitiesProps {
  className?: string;
  /**
   * Se deve carregar dados da API
   * @default true
   */
  fetchFromApi?: boolean;
  /**
   * Dados estáticos (usado quando fetchFromApi é false)
   */
  staticData?: JobData[];
  /**
   * Callback quando os dados são carregados
   */
  onDataLoaded?: (data: JobData[]) => void;
  /**
   * Callback quando ocorre erro
   */
  onError?: (error: string) => void;
  /**
   * Número máximo de vagas por página
   * @default 10
   */
  itemsPerPage?: number;
}

/**
 * Props dos componentes individuais
 */
export interface JobCardProps {
  job: JobData;
  index: number;
  onApply?: (jobId: number) => void;
  onViewDetails?: (jobId: number) => void;
}

export interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  filterCounts: {
    categorias: CategoryCount[];
    modalidades: ModalityCount[];
    tiposContrato: ContractTypeCount[];
    niveis: LevelCount[];
  };
  isLoading?: boolean;
}

export interface JobSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  totalJobs: number;
  sortValue: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}
