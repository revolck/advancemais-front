export interface BrevoSuccessResponse {
  success: true;
  message: string;
}

export type BrevoErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "ALREADY_VERIFIED"
  | "MISSING_EMAIL"
  | "INVALID_EMAIL"
  | "USER_NOT_FOUND"
  | "ACCOUNT_INACTIVE"
  | "MISSING_PHONE"
  | "PRODUCTION_BLOCKED"
  | "SEND_ERROR"
  | "INTERNAL_ERROR";

export interface BrevoErrorResponse {
  success: false;
  message: string;
  code?: BrevoErrorCode;
  error?: string;
}

export interface BrevoVerificationSuccess extends BrevoSuccessResponse {
  redirectUrl: string;
  userId: string;
}

export type BrevoVerificationResponse =
  | BrevoVerificationSuccess
  | BrevoErrorResponse;

export interface BrevoResendVerificationSuccess extends BrevoSuccessResponse {
  simulated: boolean;
  messageId: string;
}

export type BrevoResendVerificationResponse =
  | BrevoResendVerificationSuccess
  | BrevoErrorResponse;

export interface BrevoResendVerificationPayload {
  email: string;
}

export interface BrevoVerificationStatus {
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

export interface BrevoStatusSuccessResponse {
  success: true;
  data: BrevoVerificationStatus;
  message?: string;
}

export type BrevoStatusResponse =
  | BrevoStatusSuccessResponse
  | BrevoErrorResponse;

// ----------------------------------------------------------------------------
// Informações do módulo (GET /api/v1/brevo)
// ----------------------------------------------------------------------------

export interface BrevoModuleInfoResponse extends BrevoSuccessResponse {
  module: string;
  version: string;
  timestamp: string;
  environment: string;
  features?: {
    emailVerification?: boolean;
    welcomeEmail?: boolean;
    sms?: boolean;
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
      sms?: string;
    };
  };
}

// ----------------------------------------------------------------------------
// Health check (GET /api/v1/brevo/health)
// ----------------------------------------------------------------------------

export interface BrevoHealthSuccess extends BrevoSuccessResponse {
  status: "HEALTHY" | "DEGRADED";
  uptime?: number;
  timestamp?: string;
  module?: string;
}

export type BrevoHealthResponse = BrevoHealthSuccess | BrevoErrorResponse;

// ----------------------------------------------------------------------------
// Config (GET /api/v1/brevo/config) - somente dev
// ----------------------------------------------------------------------------

export interface BrevoConfigStatusResponse {
  module: string;
  timestamp: string;
  configuration: {
    isConfigured: boolean;
    environment: string;
    apiKeyProvided: boolean;
    fromEmailConfigured: boolean;
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

export type BrevoConfigResponse =
  | BrevoConfigStatusResponse
  | BrevoErrorResponse;

// ----------------------------------------------------------------------------
// Testes (POST /api/v1/brevo/test/email, /api/v1/brevo/test/sms)
// ----------------------------------------------------------------------------

export interface BrevoTestEmailPayload {
  email: string;
  name?: string;
  type?: string;
}

export interface BrevoTestSuccessResponse {
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

export type BrevoTestEmailResponse =
  | BrevoTestSuccessResponse
  | BrevoErrorResponse;

export interface BrevoTestSmsPayload {
  to: string;
  message?: string;
}

export type BrevoTestSmsResponse =
  | BrevoTestSuccessResponse
  | BrevoErrorResponse;
