export interface BrevoSuccessResponse {
  success: true;
  message: string;
}

export interface BrevoErrorResponse {
  success: false;
  message: string;
  code?: string;
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

export interface BrevoStatusSuccessResponse extends BrevoSuccessResponse {
  data: BrevoVerificationStatus;
}

export type BrevoStatusResponse =
  | BrevoStatusSuccessResponse
  | BrevoErrorResponse;
