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

export interface UsuarioErrorResponse extends UsuarioResponseBase {
  errors?: Array<{
    path: string;
    message: string;
  }>;
  detalhes?: string[];
  retryAfter?: number;
  data?: Record<string, any>;
  status?: string;
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

export type Role = "ADMIN" | "ALUNO_CANDIDATO" | "EMPRESA" | "INSTRUTOR";

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
  message: string;
}

export interface UsuarioPasswordRecoveryValidationResponse
  extends UsuarioResponseBase {
  message: string;
  usuario?: {
    email: string;
    nomeCompleto: string;
  };
}

export interface UsuarioPasswordResetPayload {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface UsuarioPasswordResetResponse extends UsuarioResponseBase {
  message: string;
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
