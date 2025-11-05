export interface CandidatoOverview {
  id: string;
  codUsuario: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  cnpj: string | null;
  role: string;
  tipoUsuario: string;
  status: string;
  criadoEm: string;
  ultimoLogin: string | null;
  telefone: string | null;
  genero: string | null;
  dataNasc: string | null;
  inscricao: string | null;
  avatarUrl: string | null;
  descricao: string | null;
  aceitarTermos: boolean;
  cidade: string | null;
  estado: string | null;
  enderecos: Endereco[];
  socialLinks: SocialLinks;
  informacoes: InformacoesCandidato;
  curriculos: Curriculo[];
  candidaturas: Candidatura[];
  curriculosResumo: CurriculosResumo;
  candidaturasResumo: CandidaturasResumo;
}

export interface Endereco {
  id: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface SocialLinks {
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  twitter: string | null;
  tiktok: string | null;
}

export interface InformacoesCandidato {
  telefone: string | null;
  genero: string | null;
  dataNasc: string | null;
  inscricao: string | null;
  avatarUrl: string | null;
  descricao: string | null;
  aceitarTermos: boolean;
}

export interface Curriculo {
  id: string;
  usuarioId: string;
  titulo: string;
  resumo: string | null;
  objetivo: string | null;
  principal: boolean;
  areasInteresse: {
    primaria: string;
  };
  preferencias: any | null;
  habilidades: {
    tecnicas: string[];
  };
  idiomas: Idioma[];
  experiencias: any[];
  formacao: any[];
  cursosCertificacoes: any[];
  premiosPublicacoes: any[];
  acessibilidade: any | null;
  consentimentos: any | null;
  ultimaAtualizacao: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

export interface Candidatura {
  id: string;
  vagaId: string;
  candidatoId: string;
  curriculoId: string;
  empresaUsuarioId: string;
  status: CandidaturaStatus;
  origem: string;
  aplicadaEm: string;
  atualizadaEm: string;
  consentimentos: any;
  curriculo: Curriculo | null;
  vaga: VagaInfo | null;
  empresa: EmpresaInfo | null;
}

export interface VagaInfo {
  id: string;
  codigo: string;
  slug: string;
  usuarioId: string;
  titulo: string;
  status: string;
  inseridaEm: string;
  atualizadoEm: string;
  inscricoesAte: string | null;
  modoAnonimo: boolean;
  modalidade: string;
  regimeDeTrabalho: string;
  paraPcd: boolean;
  senioridade: string;
  jornada: string;
  numeroVagas: number;
  descricao: string | null;
  requisitos: string | null;
  atividades: string | null;
  beneficios: string | null;
  observacoes: string | null;
  localizacao: any | null;
  salarioMin: number | null;
  salarioMax: number | null;
  salarioConfidencial: boolean;
  areaInteresseId: string | null;
  subareaInteresseId: string | null;
  areaInteresse: any | null;
  subareaInteresse: any | null;
  empresa: any | null;
}

export interface EmpresaInfo {
  id: string;
  nome: string;
  cnpj: string;
  descricao: string | null;
  website: string | null;
  logoUrl: string | null;
}

export interface CurriculosResumo {
  total: number;
  principais: number;
}

export interface CandidaturasResumo {
  total: number;
  porStatus: Record<string, number>;
  vagasDistintas: number;
}

export interface CandidatosOverviewResponse {
  data: CandidatoOverview[];
  pagination: PaginationInfo;
  summary: SummaryInfo;
  filters: FilterInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SummaryInfo {
  candidatos: number;
  curriculos: number;
  candidaturas: number;
}

export interface FilterInfo {
  scope: string;
  empresaUsuarioId?: string;
  vagaId?: string;
  status?: string[];
  search?: string;
  onlyWithCandidaturas?: boolean;
  viewerRole: string;
}

export interface CandidaturaSimples {
  id: string;
  vagaId: string;
  candidatoId: string;
  curriculoId: string;
  empresaUsuarioId: string;
  status: CandidaturaStatus;
  origem: string;
  aplicadaEm: string;
  atualizadaEm: string;
  consentimentos: any;
}

export interface AplicarVagaPayload {
  vagaId: string;
  curriculoId: string;
  consentimentos?: Record<string, any>;
  cartaApresentacao?: string;
}

export interface AplicarVagaResponse {
  id: string;
  vagaId: string;
  candidatoId: string;
  curriculoId: string;
  empresaUsuarioId: string;
  status: CandidaturaStatus;
  origem: string;
  aplicadaEm: string;
  atualizadaEm: string;
  consentimentos?: Record<string, any>;
  cartaApresentacao?: string;
}

export type CandidaturaStatus =
  | "RECEBIDA"
  | "EM_ANALISE"
  | "EM_TRIAGEM"
  | "ENTREVISTA"
  | "DESAFIO"
  | "DOCUMENTACAO"
  | "CONTRATADO"
  | "RECUSADO"
  | "DESISTIU"
  | "NAO_COMPARECEU"
  | "ARQUIVADO"
  | "CANCELADO";

export interface CandidatosFilters {
  page?: number;
  pageSize?: number;
  empresaUsuarioId?: string;
  vagaId?: string;
  status?: CandidaturaStatus[];
  search?: string;
  onlyWithCandidaturas?: boolean;
  criadoDe?: string;
  criadoAte?: string;
}

export interface CandidaturasFilters {
  vagaId?: string;
  status?: CandidaturaStatus[];
}


// ========================
// ÁREAS E SUBÁREAS DE INTERESSE
// ========================

export interface CandidatoSubareaInteresse {
  id: number;
  areaId: number;
  nome: string;
  vagasRelacionadas?: string[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CandidatoAreaInteresse {
  id: number;
  categoria: string;
  subareas?: CandidatoSubareaInteresse[];
  vagasRelacionadas?: string[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface CandidatoAreaInteresseCreateInput {
  categoria: string;
  subareas?: string[];
}

export interface CandidatoAreaInteresseUpdateInput {
  categoria?: string;
  subareas?: string[];
}

export interface CandidatoSubareaInteresseCreateInput {
  nome: string;
}

export interface CandidatoSubareaInteresseUpdateInput {
  nome?: string;
}

// ========================
// CURRÍCULOS
// ========================

export type CreateCurriculoPayload = {
  titulo: string;
} & Partial<Curriculo>;

export type UpdateCurriculoPayload = Partial<Curriculo>;

// ========================
// VAGAS PÚBLICAS (CANDIDATOS)
// ========================

export interface VagaPublicaPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface VagaPublicaListFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  modalidade?: string; // 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO'
  regime?: string; // 'CLT' | 'TEMPORARIO' | 'ESTAGIO' | 'PJ' | 'HOME_OFFICE' | 'JOVEM_APRENDIZ'
  senioridade?: string; // 'ABERTO' | 'ESTAGIARIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA' | 'LIDER'
  areaInteresseId?: number;
  subareaInteresseId?: number;
  cidade?: string;
  estado?: string;
  empresaId?: string;
  codUsuario?: string;
  period?: string; // '24h' | '7d' | '30d'
}

export interface VagaPublicaItem {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  status: string;
  modalidade: string;
  regimeDeTrabalho: string;
  senioridade: string;
  inscricoesAte?: string | null;
  cidade?: string | null;
  estado?: string | null;
  empresa?: {
    nome?: string;
    logoUrl?: string | null;
    modoAnonimo?: boolean;
  } | null;
}

export interface VagasPublicasListResponse {
  data: VagaPublicaItem[];
  pagination: VagaPublicaPagination;
}

// ========================
// INFO DO MÓDULO
// ========================

export interface CandidatosModuleInfoResponse {
  message: string;
  version: string;
  timestamp: string;
  endpoints: {
    areasInteresse: string;
    subareasInteresse: string;
    curriculos: string;
    aplicar: string;
    vagas: string;
  };
  status?: string;
}

// ========================
// DETALHE DE CANDIDATURA
// ========================

export interface CandidaturaDetalhe {
  id: string;
  vagaId: string;
  vaga: {
    titulo: string;
    empresa?: string;
    localizacao?: string;
    descricao?: string;
  };
  candidato: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
  curriculo?: {
    id: string;
    titulo: string;
    resumo?: string;
    experiencias?: Array<{ empresa: string; cargo: string; periodo: string; descricao?: string }>;
    formacoes?: Array<{ curso: string; instituicao: string; periodo: string }>;
  };
  status: CandidaturaStatus;
  origem: string;
  cartaApresentacao?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}











