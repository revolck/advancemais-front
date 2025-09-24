/**
 * API de Usuários - Cliente Frontend
 * Implementação completa baseada na documentação da API v7.0.0
 *
 * Funcionalidades:
 * - Gerenciamento de contas e autenticação
 * - Registro, login, refresh, logout
 * - Perfil e recuperação de senha
 * - Verificação de email
 * - Informações do módulo
 */

import { apiFetch } from "@/api/client";
import { usuarioRoutes } from "@/api/routes";
import { apiConfig } from "@/lib/env";

import type {
  // Tipos base
  UsuarioResponseBase,
  UsuarioErrorResponse,

  // Recuperação de senha
  UsuarioPasswordRecoveryRequestPayload,
  UsuarioPasswordRecoveryResponse,
  UsuarioPasswordRecoveryValidationResponse,
  UsuarioPasswordResetPayload,
  UsuarioPasswordResetResponse,

  // Registro
  UsuarioRegisterPayload,
  UsuarioRegisterResponse,

  // Login e autenticação
  UsuarioLoginPayload,
  UsuarioLoginResponse,
  UsuarioRefreshPayload,
  UsuarioRefreshResponse,
  UsuarioLogoutResponse,

  // Perfil
  UsuarioProfileResponse,

  // Informações do módulo
  UsuarioModuleInfoResponse,

  // Verificação de email
  UsuarioEmailVerificationPayload,
  UsuarioEmailVerificationResponse,
  UsuarioResendVerificationPayload,
  UsuarioResendVerificationResponse,
  UsuarioVerificationStatusResponse,

  // Tipos de resposta da API
  UsuarioModuleInfoApiResponse,
  UsuarioPasswordRecoveryApiResponse,
  UsuarioPasswordRecoveryValidationApiResponse,
  UsuarioPasswordResetApiResponse,
  UsuarioRegisterApiResponse,
  UsuarioLoginApiResponse,
  UsuarioRefreshApiResponse,
  UsuarioLogoutApiResponse,
  UsuarioProfileApiResponse,
} from "./types";

// ============================================================================
// CONFIGURAÇÕES E UTILITÁRIOS
// ============================================================================

const ACCEPT_HEADER = { Accept: apiConfig.headers.Accept } as const;
const JSON_HEADERS = {
  ...ACCEPT_HEADER,
  "Content-Type": apiConfig.headers["Content-Type"],
} as const;

/**
 * Lê o token JWT do cookie do navegador
 */
function readBrowserToken(): string | undefined {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

/**
 * Constrói headers de autenticação com token JWT
 */
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

// ============================================================================
// INFORMAÇÕES DO MÓDULO
// ============================================================================

/**
 * GET /api/v1/usuarios
 * Obtém informações do módulo de usuários
 *
 * @returns Informações sobre o módulo, versão, features e endpoints disponíveis
 */
export async function getUsuarioModuleInfo(): Promise<UsuarioModuleInfoApiResponse> {
  return apiFetch<UsuarioModuleInfoApiResponse>(usuarioRoutes.base(), {
    init: {
      method: "GET",
      headers: ACCEPT_HEADER,
    },
    cache: "no-cache",
    skipLogoutOn401: true,
  });
}

// ============================================================================
// RECUPERAÇÃO DE SENHA
// ============================================================================

/**
 * POST /api/v1/usuarios/recuperar-senha
 * Solicita recuperação de senha por email, CPF ou CNPJ
 *
 * @param payload - Dados para identificação do usuário
 * @returns Resposta da solicitação de recuperação
 */
export async function requestPasswordRecovery(
  payload: UsuarioPasswordRecoveryRequestPayload
): Promise<UsuarioPasswordRecoveryApiResponse> {
  return apiFetch<UsuarioPasswordRecoveryApiResponse>(
    usuarioRoutes.recovery.request(),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

/**
 * GET /api/v1/usuarios/recuperar-senha/validar/{token}
 * Valida token de recuperação de senha
 *
 * @param token - Token de recuperação
 * @returns Validação do token e informações do usuário
 */
export async function validatePasswordRecoveryToken(
  token: string
): Promise<UsuarioPasswordRecoveryValidationApiResponse> {
  return apiFetch<UsuarioPasswordRecoveryValidationApiResponse>(
    usuarioRoutes.recovery.validate(token),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

/**
 * POST /api/v1/usuarios/recuperar-senha/redefinir
 * Redefine senha utilizando token de recuperação
 *
 * @param payload - Token e nova senha
 * @returns Confirmação da redefinição de senha
 */
export async function resetPasswordWithToken(
  payload: UsuarioPasswordResetPayload
): Promise<UsuarioPasswordResetApiResponse> {
  return apiFetch<UsuarioPasswordResetApiResponse>(
    usuarioRoutes.recovery.reset(),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

// ============================================================================
// REGISTRO DE USUÁRIO
// ============================================================================

/**
 * POST /api/v1/usuarios/registrar
 * Registra novo usuário no sistema
 *
 * @param payload - Dados do usuário para registro
 * @returns Dados do usuário criado
 */
export async function registerUser(
  payload: UsuarioRegisterPayload
): Promise<UsuarioRegisterApiResponse> {
  return apiFetch<UsuarioRegisterApiResponse>(usuarioRoutes.register(), {
    init: {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
    skipLogoutOn401: true,
  });
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

/**
 * POST /api/v1/usuarios/login
 * Autentica usuário e gera tokens JWT
 *
 * @param payload - Credenciais de login
 * @returns Tokens de autenticação e dados do usuário
 */
export async function loginUser(
  payload: UsuarioLoginPayload
): Promise<UsuarioLoginApiResponse> {
  return apiFetch<UsuarioLoginApiResponse>(usuarioRoutes.login(), {
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

/**
 * POST /api/v1/usuarios/refresh
 * Renova tokens JWT usando refresh token
 *
 * @param payload - Refresh token (opcional, pode vir do cookie)
 * @returns Novos tokens de autenticação
 */
export async function refreshUserToken(
  payload: UsuarioRefreshPayload = {}
): Promise<UsuarioRefreshApiResponse> {
  return apiFetch<UsuarioRefreshApiResponse>(usuarioRoutes.refresh(), {
    init: {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

/**
 * POST /api/v1/usuarios/logout
 * Revoga sessão do usuário e limpa tokens
 *
 * @param token - Token JWT (opcional)
 * @returns Confirmação do logout
 */
export async function logoutUserSession(
  token?: string
): Promise<UsuarioLogoutApiResponse> {
  return apiFetch<UsuarioLogoutApiResponse>(usuarioRoutes.logout(), {
    init: {
      method: "POST",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// PERFIL DO USUÁRIO
// ============================================================================

/**
 * GET /api/v1/usuarios/perfil
 * Obtém perfil completo do usuário autenticado
 *
 * @param token - Token JWT (opcional)
 * @returns Dados completos do perfil e estatísticas
 */
export async function getUserProfile(
  token?: string
): Promise<UsuarioProfileApiResponse> {
  return apiFetch<UsuarioProfileApiResponse>(usuarioRoutes.profile.get(), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

/**
 * PUT /api/v1/usuarios/perfil
 * Atualiza perfil do usuário autenticado
 *
 * @param payload - Dados atualizados do perfil
 * @param token - Token JWT (opcional)
 * @returns Dados atualizados do perfil
 */
export async function updateUserProfile(
  payload: Partial<UsuarioProfileResponse["usuario"]>,
  token?: string
): Promise<UsuarioProfileApiResponse> {
  return apiFetch<UsuarioProfileApiResponse>(usuarioRoutes.profile.update(), {
    init: {
      method: "PUT",
      headers: {
        ...buildAuthHeaders(token),
        "Content-Type": apiConfig.headers["Content-Type"],
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// VERIFICAÇÃO DE EMAIL
// ============================================================================

/**
 * GET /api/v1/brevo/verificar-email?token=xxx
 * Verifica email usando token de verificação
 *
 * @param payload - Token de verificação
 * @returns Status da verificação de email
 */
export async function verifyUserEmail(
  payload: UsuarioEmailVerificationPayload
): Promise<UsuarioEmailVerificationResponse> {
  return apiFetch<UsuarioEmailVerificationResponse>(
    usuarioRoutes.verification.verify(payload.token),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

/**
 * POST /api/v1/brevo/reenviar-verificacao
 * Reenvia email de verificação
 *
 * @param payload - Email ou ID do usuário
 * @returns Status do reenvio
 */
export async function resendEmailVerification(
  payload: UsuarioResendVerificationPayload
): Promise<UsuarioResendVerificationResponse> {
  return apiFetch<UsuarioResendVerificationResponse>(
    usuarioRoutes.verification.resend(),
    {
      init: {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

/**
 * GET /api/v1/brevo/status-verificacao/{userId}
 * Obtém status de verificação de email do usuário
 *
 * @param userId - ID do usuário
 * @returns Status detalhado da verificação
 */
export async function getEmailVerificationStatus(
  userId: string
): Promise<UsuarioVerificationStatusResponse> {
  return apiFetch<UsuarioVerificationStatusResponse>(
    usuarioRoutes.verification.status(userId),
    {
      init: {
        method: "GET",
        headers: ACCEPT_HEADER,
      },
      cache: "no-cache",
      skipLogoutOn401: true,
    }
  );
}

// ============================================================================
// ALIASES E FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Alias para getUsuarioModuleInfo
 */
export const getModuleInfo = getUsuarioModuleInfo;

/**
 * Alias para requestPasswordRecovery
 */
export const requestPasswordReset = requestPasswordRecovery;

/**
 * Alias para validatePasswordRecoveryToken
 */
export const validateRecoveryToken = validatePasswordRecoveryToken;

/**
 * Alias para resetPasswordWithToken
 */
export const resetPassword = resetPasswordWithToken;

/**
 * Alias para registerUser
 */
export const register = registerUser;

/**
 * Alias para loginUser
 */
export const login = loginUser;

/**
 * Alias para refreshUserToken
 */
export const refresh = refreshUserToken;

/**
 * Alias para logoutUserSession
 */
export const logout = logoutUserSession;

/**
 * Alias para getUserProfile
 */
export const getProfile = getUserProfile;

/**
 * Alias para updateUserProfile
 */
export const updateProfile = updateUserProfile;

/**
 * Alias para verifyUserEmail
 */
export const verifyEmail = verifyUserEmail;

/**
 * Alias para resendEmailVerification
 */
export const resendVerification = resendEmailVerification;

/**
 * Alias para getEmailVerificationStatus
 */
export const getVerificationStatus = getEmailVerificationStatus;

// ============================================================================
// EXPORTS
// ============================================================================

export * from "./types";

// Exporta todas as funções principais
export const usuarioApi = {
  // Informações do módulo
  getModuleInfo,

  // Recuperação de senha
  requestPasswordRecovery,
  validatePasswordRecoveryToken,
  resetPasswordWithToken,

  // Registro
  registerUser,

  // Autenticação
  loginUser,
  refreshUserToken,
  logoutUserSession,

  // Perfil
  getUserProfile,
  updateUserProfile,

  // Verificação de email
  verifyUserEmail,
  resendEmailVerification,
  getEmailVerificationStatus,

  // Aliases
  requestPasswordReset,
  validateRecoveryToken,
  resetPassword,
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerification,
  getVerificationStatus,
} as const;
