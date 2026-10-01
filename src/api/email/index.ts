import { apiFetch } from "@/api/client";
import { emailRoutes } from "@/api/routes";
import { buildAuthHeaders } from "@/lib/auth-utils";
import { apiConfig } from "@/lib/env";

import type {
  EmailResendVerificationPayload,
  EmailResendVerificationResponse,
  EmailStatusResponse,
  EmailVerificationResponse,
  EmailModuleInfoResponse,
  EmailHealthResponse,
  EmailConfigResponse,
  EmailTestEmailPayload,
  EmailTestEmailResponse,
  EmailSandboxEmailPayload,
  EmailSandboxEmailResponse,
  EmailSandboxEmailRotinasResponse,
} from "./types";

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

export async function verifyEmail(
  token: string,
): Promise<EmailVerificationResponse> {
  return apiFetch<EmailVerificationResponse>(
    emailRoutes.verification.verifyEmail(token),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    },
  );
}

export async function verifyEmailAlias(
  token: string,
): Promise<EmailVerificationResponse> {
  return apiFetch<EmailVerificationResponse>(
    emailRoutes.verification.alias.verifyEmail(token),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    },
  );
}

export async function resendVerificationEmail(
  payload: EmailResendVerificationPayload,
): Promise<EmailResendVerificationResponse> {
  return apiFetch<EmailResendVerificationResponse>(
    emailRoutes.verification.resendVerification(),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    },
  );
}

export async function resendVerificationEmailAlias(
  payload: EmailResendVerificationPayload,
): Promise<EmailResendVerificationResponse> {
  return apiFetch<EmailResendVerificationResponse>(
    emailRoutes.verification.alias.resendVerification(),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    },
  );
}

export async function getVerificationStatusByUserId(
  userId: string,
): Promise<EmailStatusResponse> {
  return apiFetch<EmailStatusResponse>(
    emailRoutes.verification.statusByUserId(userId),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
    },
  );
}

export async function getVerificationStatusByEmail(
  email: string,
): Promise<EmailStatusResponse> {
  return apiFetch<EmailStatusResponse>(
    emailRoutes.verification.statusByEmail(email),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
    },
  );
}

// ----------------------------------------------------------------------------
// Module info, health, config
// ----------------------------------------------------------------------------

export async function getModuleInfo(): Promise<EmailModuleInfoResponse> {
  return apiFetch<EmailModuleInfoResponse>(emailRoutes.info(), {
    init: {
      method: "GET",
      headers: ACCEPT_HEADER,
    },
    cache: "no-cache",
  });
}

export async function getHealthStatus(): Promise<EmailHealthResponse> {
  return apiFetch<EmailHealthResponse>(emailRoutes.health(), {
    init: {
      method: "GET",
      headers: ACCEPT_HEADER,
    },
    cache: "no-cache",
  });
}

export async function getConfigStatus(): Promise<EmailConfigResponse> {
  return apiFetch<EmailConfigResponse>(emailRoutes.config(), {
    init: {
      method: "GET",
      headers: {
        ...ACCEPT_HEADER,
        ...buildAuthHeaders(),
      },
    },
    cache: "no-cache",
  });
}

// ----------------------------------------------------------------------------
// Test endpoints (dev only)
// ----------------------------------------------------------------------------

export async function sendTestEmail(
  payload: EmailTestEmailPayload,
): Promise<EmailTestEmailResponse> {
  return apiFetch<EmailTestEmailResponse>(emailRoutes.test.email(), {
    init: {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        ...buildAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    silence403: true,
    retries: 1,
  });
}

// ----------------------------------------------------------------------------
// Sandbox de emails (produção, somente ADMIN)
// ----------------------------------------------------------------------------

export async function getSandboxEmailRotinas(): Promise<EmailSandboxEmailRotinasResponse> {
  return apiFetch<EmailSandboxEmailRotinasResponse>(
    emailRoutes.sandbox.emailRotinas(),
    {
      init: {
        method: "GET",
        headers: {
          ...ACCEPT_HEADER,
          ...buildAuthHeaders(),
        },
      },
      cache: "no-cache",
      retries: 1,
    },
  );
}

export async function sendSandboxEmail(
  payload: EmailSandboxEmailPayload,
): Promise<EmailSandboxEmailResponse> {
  return apiFetch<EmailSandboxEmailResponse>(emailRoutes.sandbox.email(), {
    init: {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        ...buildAuthHeaders(),
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    retries: 1,
  });
}
