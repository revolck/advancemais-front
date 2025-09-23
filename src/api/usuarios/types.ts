export interface ApiMessageResponse {
  success?: boolean;
  message?: string;
  code?: string;
  correlationId?: string;
  duration?: string;
  timestamp?: string;
}

export interface UsuarioSummary {
  id: string;
  email: string;
  nomeCompleto: string;
  tipoUsuario?: string;
  role?: string;
  roles?: string[];
  status?: string;
  criadoEm?: string;
  codUsuario?: string;
  supabaseId?: string;
  emailVerificado?: boolean;
  emailVerificadoEm?: string | null;
  ultimoLogin?: string | null;
  socialLinks?: Record<string, unknown>;
  enderecos?: unknown[];
  imagemPerfil?: string | null;
  plano?: string | null;
}

export interface UsuarioModuleFeatures {
  emailVerification: boolean;
  registration: boolean;
  authentication: boolean;
  profileManagement: boolean;
  passwordRecovery: boolean;
}

export interface UsuarioModuleInfoResponse {
  module: string;
  version: string;
  timestamp: string;
  environment: string;
  features: UsuarioModuleFeatures;
  endpoints: {
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
  };
}

export interface UsuarioPasswordRecoveryRequestPayload {
  identificador?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
}

export interface UsuarioPasswordRecoveryResponse extends ApiMessageResponse {
  errors?: Array<{ path?: string; message: string }>;
  retryAfter?: number;
}

export interface UsuarioPasswordRecoveryValidationResponse
  extends ApiMessageResponse {
  usuario?: Pick<UsuarioSummary, "email" | "nomeCompleto">;
}

export interface UsuarioPasswordResetPayload {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface UsuarioPasswordResetResponse extends ApiMessageResponse {
  detalhes?: string[];
}

export interface UsuarioRegisterPayload {
  nomeCompleto: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  supabaseId?: string;
  tipoUsuario: "PESSOA_FISICA" | "PESSOA_JURIDICA" | string;
  cpf?: string;
  cnpj?: string;
  dataNasc?: string;
  genero?: string;
  role?: string;
}

export interface UsuarioRegisterResponse extends ApiMessageResponse {
  usuario?: UsuarioSummary;
}

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

export interface UsuarioLoginResponse extends ApiMessageResponse {
  usuario?: UsuarioSummary;
  token: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: string;
  rememberMe?: boolean;
  refreshTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
  session?: UsuarioSessionInfo;
}

export interface UsuarioRefreshPayload {
  refreshToken?: string;
}

export interface UsuarioRefreshResponse extends ApiMessageResponse {
  usuario?: UsuarioSummary;
  token: string;
  refreshToken: string;
  rememberMe?: boolean;
  refreshTokenExpiresAt?: string;
  session?: UsuarioSessionInfo;
}

export type UsuarioLogoutResponse = ApiMessageResponse;

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

export interface UsuarioProfileResponse extends ApiMessageResponse {
  usuario: UsuarioSummary;
  stats?: UsuarioProfileStats;
}
