import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { acceptHeaders, authHeaders, publicHeaders } from "@/api/shared";

import type {
  UsuarioLoginPayload,
  UsuarioLoginResponse,
  UsuarioLogoutResponse,
  UsuarioModuleInfoResponse,
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

export async function getUsersModuleInfo(): Promise<UsuarioModuleInfoResponse> {
  return apiFetch<UsuarioModuleInfoResponse>(usuarioRoutes.info(), {
    init: {
      method: "GET",
      headers: acceptHeaders(),
    },
    cache: "short",
    skipLogoutOn401: true,
  });
}

export async function requestPasswordRecovery(
  payload: UsuarioPasswordRecoveryRequestPayload,
): Promise<UsuarioPasswordRecoveryResponse> {
  return apiFetch<UsuarioPasswordRecoveryResponse>(
    usuarioRoutes.recovery.request(),
    {
      init: {
        method: "POST",
        headers: publicHeaders(),
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
        headers: acceptHeaders(),
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
        headers: publicHeaders(),
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
      headers: publicHeaders(),
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
      headers: publicHeaders(),
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
      headers: publicHeaders(),
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
      headers: authHeaders(token),
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
      headers: authHeaders(token),
    },
    cache: "no-cache",
  });
}

export * from "./types";
