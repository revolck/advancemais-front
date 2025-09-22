import { apiFetch } from "@/api/client";
import { brevoRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

import type {
  BrevoResendVerificationPayload,
  BrevoResendVerificationResponse,
  BrevoStatusResponse,
  BrevoVerificationResponse,
} from "./types";

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

export async function verifyEmail(
  token: string,
): Promise<BrevoVerificationResponse> {
  return apiFetch<BrevoVerificationResponse>(
    brevoRoutes.verification.verifyEmail(token),
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
): Promise<BrevoVerificationResponse> {
  return apiFetch<BrevoVerificationResponse>(
    brevoRoutes.verification.alias.verifyEmail(token),
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
  payload: BrevoResendVerificationPayload,
): Promise<BrevoResendVerificationResponse> {
  return apiFetch<BrevoResendVerificationResponse>(
    brevoRoutes.verification.resendVerification(),
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
  payload: BrevoResendVerificationPayload,
): Promise<BrevoResendVerificationResponse> {
  return apiFetch<BrevoResendVerificationResponse>(
    brevoRoutes.verification.alias.resendVerification(),
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
): Promise<BrevoStatusResponse> {
  return apiFetch<BrevoStatusResponse>(
    brevoRoutes.verification.statusByUserId(userId),
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
): Promise<BrevoStatusResponse> {
  return apiFetch<BrevoStatusResponse>(
    brevoRoutes.verification.statusByEmail(email),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
    },
  );
}
