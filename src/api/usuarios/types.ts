/**
 * Tipos para a API de Usuários
 * Baseado na documentação completa da API v7.0.0
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export interface UsuarioResponseBase {
  success?: boolean;
  message?: string;
  code?: string;
  correlationId?: string;
  timestamp?: string;
}

export type UsuarioErrorCode =
  | "EMAIL_NOT_VERIFIED"
  | "ACCOUNT_INACTIVE"
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "USER_ALREADY_EXISTS"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_DOCUMENT"
  | "PASSWORD_MISMATCH"
  | "TERMS_NOT_ACCEPTED"
  | "INVALID_EMAIL_FORMAT"
  | "WEAK_PASSWORD"
  | "INVALID_REFRESH_TOKEN"
  | "REFRESH_TOKEN_EXPIRED"
  | "INTERNAL_ERROR";

export interface UsuarioErrorResponse extends UsuarioResponseBase {
  errors?: Array<{
    path: string;
    message: string;
  }>;
  detalhes?: string[];
  retryAfter?: number;
  data?: Record<string, any>;
  status?: string;
  code?: UsuarioErrorCode;
}

// ============================================================================
// TIPOS DE USUÁRIO
// ============================================================================

export type TipoUsuario = "PESSOA_FISICA" | "PESSOA_JURIDICA";

export type Genero =
  | "MASCULINO"
  | "FEMININO"
  | "OUTRO"
  | "PREFIRO_NAO_INFORMAR";

export type Role =
  | "ADMIN"
  | "ALUNO_CANDIDATO"
  | "EMPRESA"
  | "INSTRUTOR"
  | "MODERADOR"
  | "FINANCEIRO"
  | "PEDAGOGICO"
  | "SETOR_DE_VAGAS"
  | "RECRUTADOR";

export type StatusUsuario = "ATIVO" | "INATIVO" | "SUSPENSO" | "BLOQUEADO";

// ============================================================================
// RECUPERAÇÃO DE SENHA
// ============================================================================

export interface UsuarioPasswordRecoveryRequestPayload {
  identificador?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
}

export interface UsuarioPasswordRecoveryResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  data: {
    email: string;
    tokenExpirationMinutes: number;
    canResendInMinutes: number;
  };
}

export interface UsuarioPasswordRecoveryValidationResponse
  extends UsuarioResponseBase {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    expiresAt: string;
    remainingMinutes: number;
  };
}

export interface UsuarioPasswordResetPayload {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface UsuarioPasswordResetResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    passwordChangedAt: string;
  };
}

// ============================================================================
// REGISTRO DE USUÁRIO
// ============================================================================

export interface UsuarioRegisterPayload {
  nomeCompleto: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  supabaseId?: string;
  tipoUsuario: TipoUsuario;
  cpf?: string;
  cnpj?: string;
  dataNasc?: string;
  genero?: Genero;
  role?: Role;
}

export interface UsuarioRegisterResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  usuario?: {
    id: string;
    email: string;
    nomeCompleto: string;
    tipoUsuario: TipoUsuario;
    role: Role;
    status: StatusUsuario;
    criadoEm: string;
    codUsuario: string;
  };
  duration?: string;
}

// ============================================================================
// LOGIN E AUTENTICAÇÃO
// ============================================================================

export interface UsuarioLoginPayload {
  documento: string;
  senha: string;
  rememberMe?: boolean;
}

export interface UsuarioSessionInfo {
  id: string;
  rememberMe: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface UsuarioSocialLinks {
  [key: string]: string;
}

export interface UsuarioEndereco {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
}

export interface UsuarioLoginResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  usuario: {
    id: string;
    email: string;
    nomeCompleto: string;
    role: Role;
    tipoUsuario: TipoUsuario;
    supabaseId: string;
    emailVerificado: boolean;
    ultimoLogin: string;
    socialLinks: UsuarioSocialLinks;
    enderecos: UsuarioEndereco[];
  };
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  rememberMe: boolean;
  refreshTokenExpiresIn: string;
  refreshTokenExpiresAt: string;
  session: UsuarioSessionInfo;
}

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export interface UsuarioRefreshPayload {
  refreshToken?: string;
}

export interface UsuarioRefreshResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  usuario: {
    id: string;
    email: string;
    nomeCompleto: string;
    role: Role;
    tipoUsuario: TipoUsuario;
    emailVerificado: boolean;
    ultimoLogin: string;
    socialLinks: UsuarioSocialLinks;
    enderecos: UsuarioEndereco[];
  };
  token: string;
  refreshToken: string;
  rememberMe: boolean;
  refreshTokenExpiresAt: string;
  session: UsuarioSessionInfo;
}

// ============================================================================
// LOGOUT
// ============================================================================

export interface UsuarioLogoutResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
}

// ============================================================================
// PERFIL DO USUÁRIO
// ============================================================================

export interface UsuarioEmailVerificationState {
  verified: boolean;
  verifiedAt: string | null;
  tokenExpiration: string | null;
}

export interface UsuarioProfileStats {
  accountAge: number;
  hasCompletedProfile: boolean;
  hasAddress: boolean;
  totalOrders: number;
  totalSubscriptions: number;
  emailVerificationStatus: UsuarioEmailVerificationState;
}

export interface UsuarioProfileResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  usuario: {
    id: string;
    email: string;
    nomeCompleto: string;
    role: Role;
    tipoUsuario: TipoUsuario;
    supabaseId: string;
    emailVerificado: boolean;
    emailVerificadoEm: string | null;
    ultimoLogin: string | null;
    socialLinks: UsuarioSocialLinks;
    enderecos: UsuarioEndereco[];
  };
  stats: UsuarioProfileStats;
}

// ============================================================================
// INFORMAÇÕES DO MÓDULO
// ============================================================================

export interface UsuarioModuleFeatures {
  emailVerification: boolean;
  registration: boolean;
  authentication: boolean;
  profileManagement: boolean;
  passwordRecovery: boolean;
}

export interface UsuarioModuleEndpoints {
  auth: {
    register: string;
    login: string;
    logout: string;
    refresh: string;
  };
  profile: {
    get: string;
    update: string;
  };
  recovery: {
    request: string;
    validate: string;
    reset: string;
  };
  verification: {
    verify: string;
    resend: string;
    status: string;
  };
}

export interface UsuarioModuleInfoResponse extends UsuarioResponseBase {
  module: string;
  version: string;
  timestamp: string;
  environment: string;
  features: UsuarioModuleFeatures;
  endpoints: UsuarioModuleEndpoints;
  status?: string;
}

// ============================================================================
// VERIFICAÇÃO DE EMAIL
// ============================================================================

export interface UsuarioEmailVerificationPayload {
  token: string;
}

export interface UsuarioEmailVerificationResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  usuario?: {
    id: string;
    email: string;
    emailVerificado: boolean;
    emailVerificadoEm: string;
  };
}

export interface UsuarioResendVerificationPayload {
  email?: string;
  userId?: string;
}

export interface UsuarioResendVerificationResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  canResend: boolean;
  nextResendAt?: string;
}

export interface UsuarioVerificationStatusResponse extends UsuarioResponseBase {
  success: boolean;
  message: string;
  status: {
    verified: boolean;
    verifiedAt: string | null;
    tokenExpiration: string | null;
    attempts: number;
    lastAttemptAt: string | null;
  };
}

// ============================================================================
// TIPOS DE ERRO ESPECÍFICOS
// ============================================================================

export interface UsuarioRateLimitError extends UsuarioErrorResponse {
  code: "RATE_LIMIT_EXCEEDED";
  retryAfter: number;
}

export interface UsuarioEmailNotVerifiedError extends UsuarioErrorResponse {
  code: "EMAIL_NOT_VERIFIED";
  data: {
    email: string;
    canResendVerification: boolean;
    accountCreated: string;
    accountAgeDays: number;
  };
}

export interface UsuarioAccountInactiveError extends UsuarioErrorResponse {
  code: "ACCOUNT_INACTIVE";
  status: StatusUsuario;
}

export interface UsuarioInvalidRefreshTokenError extends UsuarioErrorResponse {
  code: "INVALID_REFRESH_TOKEN";
}

export interface UsuarioInternalError extends UsuarioErrorResponse {
  code: "INTERNAL_ERROR";
}

// ============================================================================
// ADMIN - CANDIDATOS/ALUNOS
// ============================================================================

export interface Aluno {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf?: string;
  codUsuario: string;
  status: StatusUsuario;
  tipoUsuario: TipoUsuario;
  role: Role;
  telefone?: string;
  celular?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface ListAlunosParams {
  page?: number;
  limit?: number;
  status?: StatusUsuario;
  tipoUsuario?: TipoUsuario;
  search?: string;
}

export interface ListAlunosResponse extends UsuarioResponseBase {
  data: Aluno[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface GetAlunoResponse extends UsuarioResponseBase {
  data: Aluno;
}

// ============================================================================
// ADMIN - INSTRUTORES
// ============================================================================

export interface Instrutor {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf?: string;
  codUsuario: string;
  status: StatusUsuario;
  tipoUsuario: TipoUsuario;
  role: Role;
  telefone?: string;
  celular?: string;
  cidade?: string;
  estado?: string;
  criadoEm: string;
  atualizadoEm?: string;
  ultimoLogin?: string | null;
  descricao?: string | null;
  genero?: string | null;
  dataNasc?: string | null;
  avatarUrl?: string | null;
  enderecos?: UsuarioEndereco[];
  socialLinks?: UsuarioSocialLinks;
}

export interface ListInstrutoresParams {
  page?: number;
  limit?: number;
  status?: StatusUsuario;
  search?: string;
}

export interface ListInstrutoresResponse extends UsuarioResponseBase {
  data: Instrutor[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface GetInstrutorResponse extends UsuarioResponseBase {
  data: Instrutor;
}

export interface UpdateInstrutorPayload {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  genero?: string;
  dataNasc?: string;
  descricao?: string;
  avatarUrl?: string;
  enderecos?: UsuarioEndereco[];
  socialLinks?: UsuarioSocialLinks;
  senha?: string;
  confirmarSenha?: string;
}

// ============================================================================
// ALUNOS - BLOQUEIOS
// ============================================================================

export type AlunoBloqueioTipo = "TEMPORARIO" | "PERMANENTE";

export interface CreateAlunoBloqueioPayload {
  tipo: AlunoBloqueioTipo;
  motivo: string;
  dias?: number; // obrigatório quando tipo = TEMPORARIO
  observacoes?: string;
}

export interface RevokeAlunoBloqueioPayload {
  observacoes?: string;
}

// ============================================================================
// INSTRUTORES - BLOQUEIOS
// ============================================================================

export type InstrutorBloqueioTipo =
  | "TEMPORARIO"
  | "PERMANENTE"
  | "RESTRICAO_DE_RECURSO";

export type InstrutorBloqueioMotivo =
  | "SPAM"
  | "VIOLACAO_POLITICAS"
  | "FRAUDE"
  | "ABUSO_DE_RECURSOS"
  | "OUTROS";

export interface CreateInstrutorBloqueioPayload {
  tipo: InstrutorBloqueioTipo;
  motivo: InstrutorBloqueioMotivo;
  dias?: number; // obrigatório quando tipo = TEMPORARIO
  observacoes?: string;
}

export interface RevokeInstrutorBloqueioPayload {
  observacoes?: string;
}

// ============================================================================
// ADMIN - USUARIOS GERAIS
// ============================================================================

export interface UsuarioGenerico {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  codUsuario?: string;
  status: StatusUsuario;
  tipoUsuario: TipoUsuario;
  role: Role;
  telefone?: string;
  celular?: string;
  cidade?: string;
  estado?: string;
  criadoEm: string;
  atualizadoEm?: string;
  ultimoLogin?: string | null;
  descricao?: string | null;
  genero?: string | null;
  dataNasc?: string | null;
  avatarUrl?: string | null;
  enderecos?: UsuarioEndereco[];
  socialLinks?: UsuarioSocialLinks;
  // Relações por role
  curriculos?: UsuarioCurriculo[];
  candidaturas?: UsuarioCandidatura[];
  cursosInscricoes?: UsuarioCursoInscricao[];
  vagas?: UsuarioVaga[];
}

// Tipos simplificados para relações
export interface UsuarioCurriculo {
  id: string;
  titulo: string;
  resumo?: string | null;
  principal: boolean;
  criadoEm: string;
}

export interface UsuarioCandidatura {
  id: string;
  vagaId: string;
  status: string;
  aplicadaEm: string;
  vaga?: {
    id: string;
    titulo: string;
  };
}

export interface UsuarioCursoInscricao {
  id: string;
  status: string;
  turma?: {
    id: string;
    nome: string;
    curso?: {
      id: number;
      nome: string;
    };
  };
}

export interface UsuarioVaga {
  id: string;
  titulo: string;
  status: string;
  modalidade?: string;
  senioridade?: string;
}

export interface ListUsuariosParams {
  page?: number;
  limit?: number;
  status?: StatusUsuario;
  role?: Role;
  tipoUsuario?: TipoUsuario;
  search?: string;
  cidade?: string;
  estado?: string;
}

export interface ListUsuariosResponse extends UsuarioResponseBase {
  usuarios: UsuarioGenerico[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GetUsuarioResponse extends UsuarioResponseBase {
  usuario: UsuarioGenerico;
}

export interface UpdateUsuarioPayload {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  genero?: string;
  dataNasc?: string;
  descricao?: string;
  avatarUrl?: string;
  enderecos?: UsuarioEndereco[];
  socialLinks?: UsuarioSocialLinks;
  senha?: string;
  confirmarSenha?: string;
}

// ============================================================================
// USUARIOS GERAIS - BLOQUEIOS
// ============================================================================

export type UsuarioBloqueioTipo =
  | "TEMPORARIO"
  | "PERMANENTE"
  | "RESTRICAO_DE_RECURSO";

export type UsuarioBloqueioMotivo =
  | "SPAM"
  | "VIOLACAO_POLITICAS"
  | "FRAUDE"
  | "ABUSO_DE_RECURSOS"
  | "OUTROS";

export interface CreateUsuarioBloqueioPayload {
  tipo: UsuarioBloqueioTipo;
  motivo: UsuarioBloqueioMotivo;
  dias?: number;
  observacoes?: string;
}

export interface RevokeUsuarioBloqueioPayload {
  observacoes?: string;
}

// ============================================================================
// TIPOS DE RESPOSTA PARA CADA ENDPOINT
// ============================================================================

// GET /api/v1/usuarios
export type UsuarioModuleInfoApiResponse =
  | UsuarioModuleInfoResponse
  | UsuarioInternalError;

// POST /api/v1/usuarios/recuperar-senha
export type UsuarioPasswordRecoveryApiResponse =
  | UsuarioPasswordRecoveryResponse
  | UsuarioErrorResponse
  | UsuarioRateLimitError;

// GET /api/v1/usuarios/recuperar-senha/validar/{token}
export type UsuarioPasswordRecoveryValidationApiResponse =
  | UsuarioPasswordRecoveryValidationResponse
  | UsuarioErrorResponse;

// POST /api/v1/usuarios/recuperar-senha/redefinir
export type UsuarioPasswordResetApiResponse =
  | UsuarioPasswordResetResponse
  | UsuarioErrorResponse;

// POST /api/v1/usuarios/registrar
export type UsuarioRegisterApiResponse =
  | UsuarioRegisterResponse
  | UsuarioErrorResponse
  | UsuarioRateLimitError;

// POST /api/v1/usuarios/login
export type UsuarioLoginApiResponse =
  | UsuarioLoginResponse
  | UsuarioErrorResponse
  | UsuarioEmailNotVerifiedError
  | UsuarioRateLimitError;

// POST /api/v1/usuarios/refresh
export type UsuarioRefreshApiResponse =
  | UsuarioRefreshResponse
  | UsuarioErrorResponse
  | UsuarioInvalidRefreshTokenError
  | UsuarioAccountInactiveError
  | UsuarioRateLimitError;

// POST /api/v1/usuarios/logout
export type UsuarioLogoutApiResponse =
  | UsuarioLogoutResponse
  | UsuarioErrorResponse;

// GET /api/v1/usuarios/perfil
export type UsuarioProfileApiResponse =
  | UsuarioProfileResponse
  | UsuarioErrorResponse;

// ============================================================================
// TIPOS DE HEADERS
// ============================================================================

export interface UsuarioAuthHeaders {
  Accept: string;
  Authorization?: string;
  "Content-Type"?: string;
}

export interface UsuarioSetCookieHeader {
  "Set-Cookie": string;
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

export interface UsuarioApiConfig {
  baseUrl: string;
  version: string;
  timeout: number;
  retries: number;
  headers: {
    Accept: string;
    "Content-Type": string;
  };
}
