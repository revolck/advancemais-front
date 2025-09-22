import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

import type {
  UsuarioLoginPayload,
  UsuarioLoginResponse,
  UsuarioLogoutResponse,
  UsuarioPasswordRecoveryRequestPayload,
  UsuarioPasswordRecoveryResponse,
  UsuarioPasswordRecoveryValidationResponse,
  UsuarioPasswordResetPayload,
  UsuarioPasswordResetResponse,
  UsuarioProfileResponse,
  UsuarioRefreshPayload,
  UsuarioRefreshResponse,
  UsuarioRegisterPayload,
  UsuarioRegisterResponse,
} from "./types";

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

function readBrowserToken(): string | undefined {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

function buildAuthHeaders(token?: string): Record<string, string> {
  const resolvedToken = token ?? readBrowserToken();

  if (!resolvedToken) {
    return { ...ACCEPT_HEADER };
  }

  return {
    ...ACCEPT_HEADER,
    Authorization: `Bearer ${resolvedToken}`,
  };
}

export async function requestPasswordRecovery(
  payload: UsuarioPasswordRecoveryRequestPayload,
): Promise<UsuarioPasswordRecoveryResponse> {
  return apiFetch<UsuarioPasswordRecoveryResponse>(
    usuarioRoutes.recovery.request(),
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

export async function validatePasswordRecoveryToken(
  token: string,
): Promise<UsuarioPasswordRecoveryValidationResponse> {
  return apiFetch<UsuarioPasswordRecoveryValidationResponse>(
    usuarioRoutes.recovery.validate(token),
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

export async function resetPasswordWithToken(
  payload: UsuarioPasswordResetPayload,
): Promise<UsuarioPasswordResetResponse> {
  return apiFetch<UsuarioPasswordResetResponse>(
    usuarioRoutes.recovery.reset(),
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

export async function registerUser(
  payload: UsuarioRegisterPayload,
): Promise<UsuarioRegisterResponse> {
  return apiFetch<UsuarioRegisterResponse>(usuarioRoutes.register(), {
    init: {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    skipLogoutOn401: true,
  });
}

export async function loginUser(
  payload: UsuarioLoginPayload,
): Promise<UsuarioLoginResponse> {
  return apiFetch<UsuarioLoginResponse>(usuarioRoutes.login(), {
    init: {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    retries: 1,
    skipLogoutOn401: true,
  });
}

export async function refreshUserToken(
  payload: UsuarioRefreshPayload,
): Promise<UsuarioRefreshResponse> {
  return apiFetch<UsuarioRefreshResponse>(usuarioRoutes.refresh(), {
    init: {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function logoutUserSession(
  token?: string,
): Promise<UsuarioLogoutResponse> {
  return apiFetch<UsuarioLogoutResponse>(usuarioRoutes.logout(), {
    init: {
      method: "POST",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

export async function getUserProfile(
  token?: string,
): Promise<UsuarioProfileResponse> {
  return apiFetch<UsuarioProfileResponse>(usuarioRoutes.profile.get(), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

export * from "./types";
