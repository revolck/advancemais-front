export interface UsuarioResponseBase {
  success?: boolean;
  message?: string;
  code?: string;
}

export interface UsuarioPasswordRecoveryRequestPayload {
  identificador?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
}

export type UsuarioPasswordRecoveryResponse = UsuarioResponseBase;

export type UsuarioPasswordRecoveryValidationResponse = UsuarioResponseBase;

export interface UsuarioPasswordResetPayload {
  token: string;
  novaSenha: string;
}

export type UsuarioPasswordResetResponse = UsuarioResponseBase;

export interface UsuarioRegisterPayload {
  nomeCompleto: string;
  documento: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  supabaseId?: string;
  tipoUsuario: "PESSOA_FISICA" | "PESSOA_JURIDICA" | string;
}

export interface UsuarioRegisterResponse extends UsuarioResponseBase {
  usuario?: {
    id: string;
    email: string;
    nomeCompleto: string;
  };
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

export interface UsuarioLoginResponse extends UsuarioResponseBase {
  token: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: string;
  rememberMe?: boolean;
  refreshTokenExpiresIn?: string;
  refreshTokenExpiresAt?: string;
  session?: UsuarioSessionInfo;
  correlationId?: string;
  timestamp?: string;
}

export interface UsuarioRefreshPayload {
  refreshToken?: string;
}

export interface UsuarioRefreshResponse extends UsuarioResponseBase {
  token: string;
  refreshToken: string;
  rememberMe?: boolean;
  refreshTokenExpiresAt?: string;
  session?: UsuarioSessionInfo;
  correlationId?: string;
  timestamp?: string;
}

export interface UsuarioLogoutResponse extends UsuarioResponseBase {
  correlationId?: string;
  timestamp?: string;
}

export interface UsuarioEmailVerificationState {
  verified: boolean;
  verifiedAt: string | null;
  tokenExpiration: string | null;
  attempts: number;
  lastAttemptAt: string | null;
}

export interface UsuarioProfileResponse {
  id: string;
  email: string;
  nomeCompleto: string;
  role?: string;
  roles?: string[];
  tipoUsuario?: string;
  supabaseId?: string;
  emailVerificado?: boolean;
  emailVerificadoEm?: string | null;
  emailVerification?: UsuarioEmailVerificationState;
  ultimoLogin?: string | null;
  imagemPerfil?: string | null;
  plano?: string | null;
}
