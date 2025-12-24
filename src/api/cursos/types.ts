// Tipos básicos para Cursos
export interface Curso {
  id: string;
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
  valor: number;
  valorPromocional?: number;
  gratuito: boolean;
}

export interface CreateCursoPayload {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  categoriaId: number;
  statusPadrao?: "PUBLICADO" | "RASCUNHO";
  subcategoriaId?: number;
  estagioObrigatorio?: boolean;
  imagemUrl?: string;
  valor: number;
  valorPromocional?: number;
  gratuito?: boolean;
}

export type UpdateCursoPayload = Partial<CreateCursoPayload>;

export interface CursosListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  statusPadrao?: "PUBLICADO" | "RASCUNHO" | ("PUBLICADO" | "RASCUNHO")[];
  categoriaId?: number;
}

export interface CursosListResponse {
  data: Curso[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CursosModuleMeta {
  totalCursos: number;
  totalTurmas: number;
  totalInscricoes: number;
}

// Módulos
export interface CursoModulo {
  id: string;
  nome: string;
  descricao?: string;
  ordem?: number;
  turmaId: string;
  cursoId?: number | string;
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
  vagasDisponiveis?: number;
  inscricoesCount?: number;
  vagasOcupadas?: number;
  vagasDisponiveisCalculadas?: number;
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

// Inscrições
export interface TurmaInscricao {
  id: string;
  alunoId: string;
  status?: string;
  criadoEm?: string;
  observacoes?: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
  };
  curso?: {
    id: string;
    nome: string;
    codigo: string;
  };
}

export interface CreateInscricaoPayload {
  alunoId: string;
  status?: string;
  observacoes?: string;
}

export type StatusInscricao =
  | "INSCRITO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "REPROVADO"
  | "EM_ESTAGIO"
  | "CANCELADO"
  | "TRANCADO";

export interface InscricaoCurso {
  id: string;
  alunoId: string;
  statusInscricao: StatusInscricao;
  criadoEm: string;
  progresso: number;
  aluno: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}

// Provas
export type ProvaStatus =
  | "RASCUNHO"
  | "PUBLICADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "CANCELADA";

export interface TurmaProva {
  id: string;
  titulo?: string;
  nome?: string;
  descricao?: string;
  tipo?: string;
  status?: ProvaStatus;
  data?: string;
  dataInicio?: string;
  dataFim?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  etiqueta?: string;
  peso?: number;
  valeNota?: boolean;
  valePonto?: boolean;
  ativo?: boolean;
  localizacao?: "TURMA" | "MODULO";
  turmaId?: string;
  moduloId?: string;
  modalidade?: "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
  instrutorId?: string;
}

export interface CreateProvaPayload {
  titulo: string;
  etiqueta?: string;
  tipo?: "PROVA" | "ATIVIDADE";
  tipoAtividade?: "QUESTOES" | "TEXTO"; // Apenas para ATIVIDADE
  peso?: number;
  valeNota?: boolean;
  valePonto?: boolean;
  localizacao?: "TURMA" | "MODULO";
  moduloId?: string;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;
  horaFim?: string;
  duracaoMinutos?: number;
  modalidade?: "ONLINE" | "PRESENCIAL" | "AO_VIVO" | "SEMIPRESENCIAL";
  instrutorId?: string;
  obrigatoria?: boolean;
  status?: "RASCUNHO" | "PUBLICADA";
  // Dados específicos por tipo de atividade
  questoes?: Array<{
    id: string;
    titulo: string;
    alternativas: Array<{
      id: string;
      texto: string;
    }>;
    respostaCorreta: string | null;
  }>;
  texto?: {
    titulo: string;
  };
  arquivo?: {
    titulo: string;
    arquivoUrl?: string;
    arquivoNome?: string;
    arquivoTamanho?: number;
    arquivoMimeType?: string;
  };
}

export type UpdateProvaPayload = Partial<CreateProvaPayload>;

// Tokens Únicos para Provas/Atividades Online ou Ao Vivo
export interface ProvaToken {
  id: string;
  provaId: string;
  inscricaoId: string;
  token: string; // Token único gerado
  respondido: boolean; // Se o usuário já respondeu
  nota?: number | null; // Nota obtida (0-10)
  respondidoEm?: string | null; // Data/hora da resposta
  criadoEm: string;
  atualizadoEm: string;
  aluno?: {
    id: string;
    nome?: string;
    nomeCompleto?: string;
    email?: string;
  };
  inscricao?: {
    id: string;
    alunoId: string;
    status?: string;
  };
}

export interface CreateProvaTokenPayload {
  inscricaoId: string;
}

export interface ListProvaTokensParams {
  page?: number;
  pageSize?: number;
  inscricaoId?: string;
  respondido?: boolean;
}

export interface ListProvaTokensResponse {
  data: ProvaToken[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ProvaTokenResponse {
  data: ProvaToken;
}

// Certificados
export interface TurmaCertificado {
  id: string;
  turmaId: string;
  alunoId: string;
  emitidoEm: string;
}

// Alunos
export interface AlunoComInscricao {
  id: string;
  codigo?: string;
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  ultimoLogin?: string | null;
  criadoEm?: string;
  ultimoCurso?: {
    inscricaoId: string;
    statusInscricao: StatusInscricao | string;
    dataInscricao?: string;
    turma?: {
      id: string;
      nome: string;
      codigo?: string;
      status?: string;
    };
    curso?: {
      id: string;
      nome: string;
      codigo?: string;
    };
  } | null;
}

export interface ListAlunosComInscricaoParams {
  page?: number;
  limit?: number;
  status?: string | string[];
  search?: string;
  cursoId?: string | string[];
  turmaId?: string | string[];
  cidade?: string | string[];
}

export interface ListAlunosComInscricaoResponse {
  data: AlunoComInscricao[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Curso Aluno
export interface CursoAlunoDetalhes {
  id: string;
  nome: string;
  nomeCompleto?: string;
  codigo?: string;
  email: string;
  cpf?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  ultimoLogin?: string | null;
  criadoEm: string;
  ultimoCurso?: {
    inscricaoId: string;
    statusInscricao: string;
    progresso?: number;
  };
  descricao?: string | null;
  avatarUrl?: string | null;
  atualizadoEm?: string | null;
  enderecos: CursoAlunoEndereco[];
  inscricoes: CursoAlunoInscricao[];
  totalInscricoes: number;
}

export interface CursoAlunoEndereco {
  id: string;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export interface CursoAlunoInscricao {
  id: string;
  statusInscricao?: string;
  status?: string;
  progresso?: number;
  criadoEm?: string;
  dataInscricao?: string;
  turma?: CursoAlunoTurmaResumo;
  curso?: CursoAlunoCursoResumo;
}

export interface CursoAlunoTurmaResumo {
  id: string;
  nome: string;
  codigo?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface CursoAlunoCursoResumo {
  id: string;
  nome: string;
  codigo?: string;
  imagemUrl?: string | null;
}

export interface CursoAlunoEstatisticas {
  totalInscricoes: number;
  cursosConcluidos: number;
  cursosEmAndamento: number;
}

export interface CursoAlunoDetalhesResponse {
  success: boolean;
  data: CursoAlunoDetalhes;
}

// Visão Geral
export interface VisaoGeralResponse {
  success: boolean;
  data: VisaoGeralData;
}

export interface VisaoGeralData {
  metricasGerais: VisaoGeralMetricasGerais;
  faturamento: VisaoGeralFaturamento;
  performance: VisaoGeralPerformance;
  proximosInicios: CursosProximosInicio[];
}

export interface VisaoGeralMetricasGerais {
  totalCursos: number;
  totalTurmas: number;
  totalInscricoes: number;
  totalAlunos: number;
}

export interface VisaoGeralFaturamento {
  total: number;
  cursos: CursoFaturamento[];
}

export interface CursoFaturamento {
  cursoId: number;
  nome: string;
  faturamento: number;
}

export interface VisaoGeralPerformance {
  taxaConclusao: number;
  cursos: CursoPerformance[];
}

export interface CursoPerformance {
  cursoId: number;
  nome: string;
  taxaConclusao: number;
}

export interface CursosProximosInicio {
  cursoId: number;
  nome: string;
  turmas: TurmaProximoInicio[];
}

export interface TurmaProximoInicio {
  turmaId: string;
  nome: string;
  dataInicio: string;
}

export interface CursoTaxaConclusao {
  cursoId: number;
  nome: string;
  taxaConclusao: number;
}

// Inscrições Curso
export interface ListInscricoesCursoParams {
  page?: number;
  pageSize?: number;
  status?: string | string[];
  search?: string;
  turmaId?: string | string[];
  cidade?: string | string[];
}

export interface ListInscricoesCursoResponse {
  data: InscricaoCurso[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Auditoria
export interface CursoAuditoriaItem {
  id: string;
  campo: string;
  valorAntigo: any;
  valorNovo: any;
  descricao: string;
  criadoEm: string;
  alteradoPor: {
    id: string;
    nomeCompleto: string;
    email: string;
    role: string;
  };
}

export interface ListCursoAuditoriaParams {
  page?: number;
  pageSize?: number;
}

export interface ListCursoAuditoriaResponse {
  data: CursoAuditoriaItem[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Estágio
export interface TurmaEstagio {
  id: string;
  turmaId: string;
  alunoId: string;
  status: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  empresa?: string;
  cargo?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  aluno?: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}
