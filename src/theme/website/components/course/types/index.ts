// Tipos para componente de catálogo de cursos públicos

export interface CourseData {
  id: string;
  nome: string;
  descricao: string;
  cargaHoraria: number;
  categoria: string;
  subcategoria?: string;
  imagemUrl?: string;
  statusPadrao: "PUBLICADO" | "RASCUNHO";
  estagioObrigatorio: boolean;
  totalTurmas?: number;
  totalAlunos?: number;
  criadoEm: string;
  // Campos de precificação
  valor: number;
  valorPromocional?: number;
  gratuito: boolean;
}

export interface CourseFilters {
  busca: string;
  categorias: string[];
  modalidades: string[];
  apenasComVagas: boolean;
}

export interface CourseCatalogProps {
  className?: string;
  fetchFromApi?: boolean;
  staticData?: CourseData[];
  itemsPerPage?: number;
}

export interface CourseCardProps {
  course: CourseData;
  index: number;
  onViewDetails?: (course: CourseData) => void;
}
