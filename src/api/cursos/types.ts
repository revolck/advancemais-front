// Tipos principais para o módulo de Cursos (resumo, conforme documentação)

export interface CursosModuleMeta {
  message: string;
  version: string;
  timestamp: string;
  endpoints: Record<string, string>;
  status?: string;
}

export interface Curso {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  cargaHoraria: number;
  categoriaId: number;
  statusPadrao: "PUBLICADO" | "RASCUNHO";
  criadoEm: string;
  atualizadoEm: string;
  imagemUrl?: string;
  subcategoriaId?: number;
}

export interface CursosListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusPadrao?: string | string[]; // Aceita string (comma-separated) ou array
  categoriaId?: number;
  subcategoriaId?: number;
  instrutorId?: string;
  includeTurmas?: boolean;
}

// Turmas
export interface CursoTurma {
  id: string;
  codigo: string;
  nome: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  status?: string;
  vagasTotais?: number;
  vagasDisponiveis?: number; // Mantido para compatibilidade, mas pode estar desatualizado
  // Novos campos calculados pela API (sempre atualizados)
  inscricoesCount?: number; // Número total de inscrições ativas
  vagasOcupadas?: number; // Número de vagas ocupadas (igual a inscricoesCount)
  vagasDisponiveisCalculadas?: number; // vagasTotais - inscricoesCount
  dataInicio?: string;
  dataFim?: string;
  dataInscricaoInicio?: string;
  dataInscricaoFim?: string;
  instrutor?: {
    id: string;
    nome?: string;
    email?: string;
    codUsuario?: string;
  };
}

export interface CreateTurmaPayload {
  nome: string;
  instrutorId?: string;
  turno: "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";
  metodo: "ONLINE" | "PRESENCIAL" | "LIVE" | "SEMIPRESENCIAL";
  vagasTotais: number;
  dataInicio?: string;
  dataFim?: string;
  dataInscricaoInicio?: string;
  dataInscricaoFim?: string;
  estrutura?: {
    modules: Array<{
      title: string;
      startDate?: string | null;
      endDate?: string | null;
      instructorId?: string | null;
      items: Array<{
        title: string;
        type: "AULA" | "PROVA" | "ATIVIDADE";
        startDate?: string | null;
        endDate?: string | null;
      }>;
    }>;
    standaloneItems?: Array<{
      title: string;
      type: "AULA" | "PROVA" | "ATIVIDADE";
      startDate?: string | null;
      endDate?: string | null;
    }>;
  };
}

// Inscrições (Alunos)
export interface TurmaInscricao {
  id: string;
  turmaId: string;
  alunoId: string;
  status?: string; // Status da inscrição: INSCRITO, EM_ANDAMENTO, CONCLUIDO, REPROVADO, EM_ESTAGIO, CANCELADO, TRANCADO
  criadoEm?: string;
  observacoes?: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    cpf?: string;
    codUsuario?: string;
    status?: string;
    tipoUsuario?: string;
    role?: string;
  };
}

export interface CreateInscricaoPayload {
  alunoId: string;
  observacoes?: string;
}

// Alunos com inscrições (estrutura exata da API - atualizada 30/10/2025)
export interface AlunoComInscricao {
  id: string;
  codigo: string; // Código do aluno (ex: MAT0001, MAT0002, etc.)
  nomeCompleto: string;
  email: string;
  cpf?: string;
  status: string; // Status do usuário (ATIVO, INATIVO, etc.)
  cidade?: string;
  estado?: string;
  ultimoLogin?: string | null;
  criadoEm: string;
  ultimoCurso?: {
    // Última inscrição do aluno (pode ser undefined se não tiver inscrições)
    inscricaoId: string;
    statusInscricao: string; // Status da inscrição (INSCRITO, EM_ANDAMENTO, CONCLUIDO, REPROVADO, EM_ESTAGIO, CANCELADO, TRANCADO)
    progresso?: number;
    dataInscricao: string;
    turma: {
      id: string;
      nome: string;
      codigo: string;
      status: string;
    };
    curso: {
      id: number; // ID numérico do curso
      nome: string;
      codigo: string;
    };
  };
}

export interface ListAlunosComInscricaoParams {
  page?: number;
  limit?: number;
  status?: string; // Status da INSCRIÇÃO (statusInscricao): INSCRITO, EM_ANDAMENTO, CONCLUIDO, REPROVADO, EM_ESTAGIO, CANCELADO, TRANCADO
  search?: string;
  cursoId?: number;
  turmaId?: string;
  cidade?: string;
}

export interface ListAlunosComInscricaoResponse {
  data: AlunoComInscricao[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface CursoAlunoEndereco {
  id: string;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  criadoEm?: string;
}

export interface CursoAlunoTurmaResumo {
  id: string;
  nome: string;
  codigo: string;
  status: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface CursoAlunoCursoResumo {
  id: number;
  nome: string;
  codigo: string;
  descricao?: string;
  cargaHoraria?: number;
  imagemUrl?: string | null;
}

export interface CursoAlunoInscricao {
  id: string;
  statusInscricao: string;
  progresso?: number;
  criadoEm: string;
  turma: CursoAlunoTurmaResumo;
  curso: CursoAlunoCursoResumo;
}

export interface CursoAlunoEstatisticas {
  cursosAtivos: number;
  cursosConcluidos: number;
  cursosCancelados: number;
}

export interface CursoAlunoDetalhes {
  id: string;
  codigo: string;
  nomeCompleto: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  status: string;
  genero?: string | null;
  dataNasc?: string | null;
  descricao?: string | null;
  avatarUrl?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  ultimoLogin?: string | null;
  enderecos: CursoAlunoEndereco[];
  inscricoes: CursoAlunoInscricao[];
  totalInscricoes: number;
  estatisticas?: CursoAlunoEstatisticas;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
  };
}

export interface CursoAlunoDetalhesResponse {
  success: boolean;
  data: CursoAlunoDetalhes;
}

// Provas
export interface TurmaProva {
  id: string;
  titulo?: string;
  nome?: string;
  descricao?: string;
  tipo?: string;
  status?: string;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
}

// Certificados
export interface TurmaCertificado {
  id: string;
  alunoId?: string;
  codigo?: string;
  numero?: string;
  emitidoEm?: string;
  status?: string;
  aluno?: {
    id: string;
    nome?: string;
    email?: string;
  };
}

// Estágios
export interface TurmaEstagio {
  id: string;
  alunoId?: string;
  status?: string;
  empresa?: string;
  cargo?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  aluno?: {
    id: string;
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

export interface Pagination {
  requestedPage: number;
  page: number;
  isPageAdjusted: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface StatusFilterSummary {
  value?: string; // Valor do status (PUBLICADO, RASCUNHO, etc)
  label: string;
  total: number;
  selected?: boolean;
}

export interface FiltersSummary {
  statusPadrao?: StatusFilterSummary[];
}

export interface AppliedFilters {
  search?: string;
  statusPadrao?: string[];
  categoriaId?: number;
  subcategoriaId?: number;
  instrutorId?: number;
}

export interface Filters {
  summary?: FiltersSummary;
  applied?: AppliedFilters;
}

export interface Meta {
  empty: boolean;
}

export interface CursosListResponse {
  data: Curso[];
  pagination: Pagination;
  filters?: Filters;
  meta?: Meta;
}

export interface CreateCursoPayload {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  categoriaId: number;
  subcategoriaId?: number;
  estagioObrigatorio?: boolean;
  statusPadrao: "PUBLICADO" | "RASCUNHO";
  imagemUrl?: string;
}

export type UpdateCursoPayload = Partial<CreateCursoPayload>;
