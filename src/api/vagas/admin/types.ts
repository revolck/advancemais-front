// ============================================================================
// TIPOS BASE
// ============================================================================

export type VagaStatus =
  | "RASCUNHO"
  | "EM_ANALISE"
  | "PUBLICADO"
  | "DESPUBLICADA"
  | "PAUSADA"
  | "ENCERRADA"
  | "EXPIRADO";

export type RegimeTrabalho = "CLT" | "PJ" | "ESTAGIO" | "TRAINEE" | "FREELANCE";
export type ModalidadeTrabalho = "PRESENCIAL" | "REMOTO" | "HIBRIDO";
export type JornadaTrabalho = "INTEGRAL" | "MEIO_PERIODO" | "FLEXIVEL";
export type Senioridade =
  | "JUNIOR"
  | "PLENO"
  | "SENIOR"
  | "ESPECIALISTA"
  | "COORDENADOR"
  | "GERENTE"
  | "DIRETOR";

// ============================================================================
// ESTRUTURAS DE DADOS
// ============================================================================

export interface VagaLocalizacao {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
  referencia?: string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}

export interface VagaRequisitos {
  obrigatorios: string[];
  desejaveis: string[];
}

export interface VagaAtividades {
  principais: string[];
  extras: string[];
}

export interface VagaBeneficios {
  lista: string[];
  observacoes?: string;
}

export interface VagaAreaInteresse {
  id: number;
  categoria: string;
}

export interface VagaSubareaInteresse {
  id: number;
  nome: string;
  areaId: number;
}

export interface VagaEmpresaSocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

export interface VagaEmpresaInformacoes {
  telefone?: string;
  genero?: string;
  dataNasc?: string;
  inscricao?: string;
  avatarUrl?: string;
  descricao?: string;
  aceitarTermos?: boolean;
}

export interface VagaEmpresa {
  id: string;
  nome: string;
  avatarUrl?: string;
  cidade: string;
  estado: string;
  descricao?: string;
  socialLinks?: VagaEmpresaSocialLinks;
  codUsuario: string;
  informacoes?: VagaEmpresaInformacoes;
}

// ============================================================================
// ITEM DE LISTA
// ============================================================================

export interface VagaListItem {
  id: string;
  codigo: string;
  slug: string;
  usuarioId: string;
  empresa: VagaEmpresa;
  modoAnonimo: boolean;
  regimeDeTrabalho: RegimeTrabalho;
  modalidade: ModalidadeTrabalho;
  titulo: string;
  paraPcd: boolean;
  numeroVagas: number;
  descricao: string;
  requisitos: VagaRequisitos;
  atividades: VagaAtividades;
  beneficios: VagaBeneficios;
  observacoes?: string;
  jornada: JornadaTrabalho;
  senioridade: Senioridade;
  localizacao: VagaLocalizacao;
  inscricoesAte: string;
  inseridaEm: string;
  atualizadoEm: string;
  status: VagaStatus;
  salarioMin?: string;
  salarioMax?: string;
  salarioConfidencial: boolean;
  maxCandidaturasPorUsuario: number;
  areaInteresseId: number;
  subareaInteresseId: number;
  areaInteresse: VagaAreaInteresse;
  subareaInteresse: VagaSubareaInteresse;
  nomeExibicao?: string;
  logoExibicao?: string;
  mensagemAnonimato?: string;
  descricaoExibicao?: string;
}

// ============================================================================
// DETALHES COMPLETOS
// ============================================================================

export type VagaDetail = VagaListItem;

// ============================================================================
// PAGINAÇÃO
// ============================================================================

export interface VagaPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// PARÂMETROS DE LISTAGEM
// ============================================================================

export interface VagaListParams {
  page?: number;
  pageSize?: number;
  status?: VagaStatus | VagaStatus[];
  usuarioId?: string;
}

// ============================================================================
// PAYLOADS DE ATUALIZAÇÃO
// ============================================================================

export interface UpdateVagaPayload {
  usuarioId?: string;
  areaInteresseId?: number;
  subareaInteresseId?: number;
  modoAnonimo?: boolean;
  regimeDeTrabalho?: RegimeTrabalho;
  modalidade?: ModalidadeTrabalho;
  titulo?: string;
  slug?: string;
  paraPcd?: boolean;
  vagaEmDestaque?: boolean;
  numeroVagas?: number;
  descricao?: string;
  requisitos?: VagaRequisitos;
  atividades?: VagaAtividades;
  beneficios?: VagaBeneficios;
  observacoes?: string;
  jornada?: JornadaTrabalho;
  senioridade?: Senioridade;
  inscricoesAte?: string;
  inseridaEm?: string;
  status?: VagaStatus;
  localizacao?: VagaLocalizacao;
  salarioMin?: number;
  salarioMax?: number;
  salarioConfidencial?: boolean;
  maxCandidaturasPorUsuario?: number;
}

// ============================================================================
// RESPOSTAS DA API
// ============================================================================

export interface VagaListResponse {
  data: VagaListItem[];
  pagination: VagaPagination;
}

export interface VagaDetailResponse {
  data: VagaDetail;
}

// ============================================================================
// RESPOSTAS TIPADAS DA API
// ============================================================================

export type VagaListApiResponse = VagaListItem[] | VagaListResponse;
export type VagaDetailApiResponse = VagaDetail | VagaDetailResponse;
export type VagaUpdateApiResponse = VagaDetail | VagaDetailResponse;
export type VagaDeleteApiResponse = void;

// ============================================================================
// RESPOSTAS DE ERRO
// ============================================================================

export interface VagaErrorResponse {
  success: false;
  message: string;
  code?: string;
  error?: string;
}

export interface VagaValidationError extends VagaErrorResponse {
  code: "VALIDATION_ERROR";
  issues?: Record<string, string[]>;
}

export interface VagaNotFoundError extends VagaErrorResponse {
  code: "NOT_FOUND";
  message: "Vaga não encontrada";
}

export interface VagaUnauthorizedError {
  message: "Token de autorização necessário";
  error: "Token inválido ou expirado";
}

export interface VagaForbiddenError {
  message: "Acesso negado: permissões insuficientes";
  requiredRoles: string[];
  userRole: string;
}

export interface VagaLimitReachedError extends VagaErrorResponse {
  code: "PLANO_EMPRESARIAL_LIMIT_DESTAQUE";
  message: "O limite de vagas em destaque do plano foi atingido.";
  limite: number;
}
