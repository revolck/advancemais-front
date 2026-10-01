export interface EmailSuccessResponse {
  success: true;
  message: string;
}

export type EmailErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "ALREADY_VERIFIED"
  | "MISSING_EMAIL"
  | "INVALID_EMAIL"
  | "USER_NOT_FOUND"
  | "ACCOUNT_INACTIVE"
  | "MISSING_PASSWORD"
  | "PRODUCTION_BLOCKED"
  | "INSUFFICIENT_PERMISSIONS"
  | "INVALID_PASSWORD"
  | "INVALID_SANDBOX_ROUTINE"
  | "EMAIL_DELIVERY_FAILED"
  | "SEND_ERROR"
  | "INTERNAL_ERROR";

export interface EmailErrorResponse {
  success: false;
  message: string;
  code?: EmailErrorCode;
  error?: string;
}

export interface EmailVerificationSuccess extends EmailSuccessResponse {
  redirectUrl: string;
  userId: string;
}

export type EmailVerificationResponse =
  | EmailVerificationSuccess
  | EmailErrorResponse;

export interface EmailResendVerificationSuccess extends EmailSuccessResponse {
  simulated: boolean;
  messageId: string;
}

export type EmailResendVerificationResponse =
  | EmailResendVerificationSuccess
  | EmailErrorResponse;

export interface EmailResendVerificationPayload {
  email: string;
}

export interface EmailVerificationStatus {
  userId: string;
  email: string;
  emailVerified: boolean;
  accountStatus: string;
  hasValidToken: boolean;
  tokenExpiration: string | null;
  emailVerification: {
    verified: boolean;
    verifiedAt: string | null;
    tokenExpiration: string | null;
    attempts: number;
    lastAttemptAt: string | null;
  };
}

export interface EmailStatusSuccessResponse {
  success: true;
  data: EmailVerificationStatus;
  message?: string;
}

export type EmailStatusResponse =
  | EmailStatusSuccessResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Informações do módulo (GET /api/v1/email)
// ----------------------------------------------------------------------------

export interface EmailModuleInfoResponse extends EmailSuccessResponse {
  module: string;
  version: string;
  timestamp: string;
  environment: string;
  features?: {
    emailVerification?: boolean;
    welcomeEmail?: boolean;
    testEndpoints?: boolean;
  };
  endpoints?: {
    base?: string;
    health?: string;
    config?: string;
    verification?: {
      verify?: string;
      resend?: string;
      statusByUserId?: string;
      statusByEmail?: string;
      alias?: {
        verify?: string;
        resend?: string;
      };
    };
    test?: {
      email?: string;
    };
  };
}

// ----------------------------------------------------------------------------
// Health check (GET /api/v1/email/health)
// ----------------------------------------------------------------------------

export interface EmailHealthSuccess extends EmailSuccessResponse {
  status: "HEALTHY" | "DEGRADED";
  uptime?: number;
  timestamp?: string;
  module?: string;
}

export type EmailHealthResponse = EmailHealthSuccess | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Config (GET /api/v1/email/config) - somente dev
// ----------------------------------------------------------------------------

export interface EmailConfigStatusResponse {
  module: string;
  timestamp: string;
  configuration: {
    isConfigured: boolean;
    environment: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPasswordProvided: boolean;
    fromEmail: string;
    fromName: string;
  };
  emailVerification: {
    enabled: boolean;
    tokenExpirationHours: number;
    maxResendAttempts: number;
    resendCooldownMinutes: number;
  };
  urls: {
    frontend: string;
    verification: string;
    passwordRecovery: string;
  };
  client: {
    operational: boolean;
    simulated: boolean;
  };
  healthInfo: any;
}

export type EmailConfigResponse =
  | EmailConfigStatusResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Testes (POST /api/v1/email/test/email)
// ----------------------------------------------------------------------------

export interface EmailTestEmailPayload {
  email: string;
  name?: string;
  type?: string;
}

export interface EmailTestSuccessResponse {
  success: true;
  message: string;
  data: {
    recipient: string;
    simulated: boolean;
    messageId: string;
    error: string | null;
  };
  timestamp: string;
}

export type EmailTestEmailResponse =
  | EmailTestSuccessResponse
  | EmailErrorResponse;

// ----------------------------------------------------------------------------
// Sandbox de emails (produção, somente ADMIN)
// ----------------------------------------------------------------------------

export type EmailSandboxEmailRotina =
  | "NOVO_CADASTRO"
  | "RECUPERACAO_SENHA"
  | "CREDENCIAIS_EMPRESA_ADMIN"
  | "PLANO_ATIVADO"
  | "PLANO_PAGAMENTO_RECUSADO"
  | "PLANO_UPGRADE"
  | "PLANO_DOWNGRADE"
  | "CURSO_PAGAMENTO_PENDENTE"
  | "CURSO_PAGAMENTO_PROCESSANDO"
  | "CURSO_PAGAMENTO_APROVADO"
  | "CURSO_PAGAMENTO_RECUSADO"
  | "CURSO_PAGAMENTO_CANCELADO"
  | "CURSO_PAGAMENTO_ESTORNADO"
  | "CURSO_PAGAMENTO_CONTESTADO"
  | "ESTAGIO_CONVOCACAO"
  | "ESTAGIO_ENCERRAMENTO"
  | "USUARIO_BLOQUEADO"
  | "USUARIO_DESBLOQUEADO";

export interface EmailSandboxEmailRotinaItem {
  value: EmailSandboxEmailRotina;
  label: string;
  group: string;
  description?: string;
}

export interface EmailSandboxEmailRotinasResponse {
  success: true;
  data: EmailSandboxEmailRotinaItem[];
}

export interface EmailSandboxEmailPayload {
  rotina: EmailSandboxEmailRotina;
  destinatarioEmail: string;
  senha: string;
}

export interface EmailSandboxEmailSuccessResponse {
  success: true;
  message: string;
  data: {
    rotina: EmailSandboxEmailRotina;
    recipient: string;
    simulated?: boolean;
    messageId?: string;
  };
}

export type EmailSandboxEmailResponse =
  | EmailSandboxEmailSuccessResponse
  | EmailErrorResponse;
