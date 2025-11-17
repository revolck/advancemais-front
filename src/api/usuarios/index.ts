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
// ADMIN - CANDIDATOS/ALUNOS
// ============================================================================

/**
 * GET /api/v1/usuarios/candidatos
 * Lista todos os alunos/candidatos com paginação e filtros
 *
 * @param params - Parâmetros de filtro e paginação
 * @param token - Token JWT (opcional)
 * @returns Lista paginada de alunos
 */
export async function listAlunos(
  params?: import("./types").ListAlunosParams,
  token?: string
): Promise<import("./types").ListAlunosResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.status) queryParams.set("status", params.status);
  if (params?.tipoUsuario) queryParams.set("tipoUsuario", params.tipoUsuario);
  if (params?.search) queryParams.set("search", params.search);

  const url = usuarioRoutes.admin.candidatos.list();
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  return apiFetch<import("./types").ListAlunosResponse>(fullUrl, {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

/**
 * GET /api/v1/usuarios/candidatos/dashboard
 * Lista alunos/candidatos para dashboard (otimizado, 10 por página)
 *
 * @param params - Parâmetros de filtro
 * @param token - Token JWT (opcional)
 * @returns Lista paginada de alunos (máx 10 por página)
 */
export async function listAlunosDashboard(
  params?: Omit<import("./types").ListAlunosParams, "limit">,
  token?: string
): Promise<import("./types").ListAlunosResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.status) queryParams.set("status", params.status);
  if (params?.tipoUsuario) queryParams.set("tipoUsuario", params.tipoUsuario);
  if (params?.search) queryParams.set("search", params.search);

  const url = usuarioRoutes.admin.candidatos.dashboard();
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  return apiFetch<import("./types").ListAlunosResponse>(fullUrl, {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

/**
 * GET /api/v1/usuarios/candidatos/{userId}
 * Busca um aluno/candidato específico por ID
 *
 * @param userId - ID do aluno
 * @param token - Token JWT (opcional)
 * @returns Dados completos do aluno
 */
export async function getAlunoById(
  userId: string,
  token?: string
): Promise<import("./types").GetAlunoResponse> {
  return apiFetch<import("./types").GetAlunoResponse>(
    usuarioRoutes.admin.candidatos.get(userId),
    {
      init: {
        method: "GET",
        headers: buildAuthHeaders(token),
      },
      cache: "no-cache",
    }
  );
}

/**
 * GET /api/v1/usuarios/candidatos/{userId}/logs
 * Busca logs de um aluno/candidato específico
 *
 * @param userId - ID do aluno
 * @param token - Token JWT (opcional)
 * @returns Logs do aluno
 */
export async function getAlunoLogs(
  userId: string,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.admin.candidatos.logs(userId), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// Alunos - Bloqueios (módulo Usuários)
// ============================================================================

export async function createAlunoBloqueio(
  alunoId: string,
  payload: import("./types").CreateAlunoBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.alunos.bloqueios.create(alunoId), {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        "Content-Type": apiConfig.headers["Content-Type"],
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

export async function revokeAlunoBloqueio(
  alunoId: string,
  payload?: import("./types").RevokeAlunoBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.alunos.bloqueios.revoke(alunoId), {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        "Content-Type": apiConfig.headers["Content-Type"],
      },
      body: payload ? JSON.stringify(payload) : undefined,
    },
    cache: "no-cache",
  });
}

export async function listAlunoBloqueios(
  alunoId: string,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.alunos.bloqueios.list(alunoId), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// ADMIN - INSTRUTORES
// ============================================================================

/**
 * GET /api/v1/usuarios/instrutores
 * Lista todos os instrutores com paginação e filtros
 *
 * @param params - Parâmetros de filtro e paginação
 * @param token - Token JWT (opcional)
 * @returns Lista paginada de instrutores
 */
export async function listInstrutores(
  params?: import("./types").ListInstrutoresParams,
  token?: string
): Promise<import("./types").ListInstrutoresResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);

  const url = usuarioRoutes.instrutores.list();
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  return apiFetch<import("./types").ListInstrutoresResponse>(fullUrl, {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

/**
 * GET /api/v1/usuarios/instrutores/:instrutorId
 * Busca um instrutor específico por ID
 *
 * @param instrutorId - ID do instrutor
 * @param token - Token JWT (opcional)
 * @returns Dados completos do instrutor
 */
export async function getInstrutorById(
  instrutorId: string,
  token?: string
): Promise<import("./types").GetInstrutorResponse> {
  return apiFetch<import("./types").GetInstrutorResponse>(
    usuarioRoutes.instrutores.get(instrutorId),
    {
      init: {
        method: "GET",
        headers: buildAuthHeaders(token),
      },
      cache: "no-cache",
    }
  );
}

/**
 * PUT /api/v1/usuarios/instrutores/:instrutorId
 * Atualiza dados do instrutor
 *
 * @param instrutorId - ID do instrutor
 * @param payload - Dados para atualização
 * @param token - Token JWT (opcional)
 * @returns Dados atualizados do instrutor
 */
export async function updateInstrutor(
  instrutorId: string,
  payload: import("./types").UpdateInstrutorPayload,
  token?: string
): Promise<import("./types").GetInstrutorResponse> {
  return apiFetch<import("./types").GetInstrutorResponse>(
    usuarioRoutes.instrutores.update(instrutorId),
    {
      init: {
        method: "PUT",
        headers: {
          ...buildAuthHeaders(token),
          "Content-Type": apiConfig.headers["Content-Type"],
        },
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

/**
 * POST /api/v1/usuarios/instrutores/:userId/bloqueios
 * Aplica bloqueio a um instrutor
 *
 * @param instrutorId - ID do instrutor
 * @param payload - Dados do bloqueio
 * @param token - Token JWT (opcional)
 * @returns Confirmação do bloqueio
 */
export async function createInstrutorBloqueio(
  instrutorId: string,
  payload: import("./types").CreateInstrutorBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(
    usuarioRoutes.instrutores.bloqueios.create(instrutorId),
    {
      init: {
        method: "POST",
        headers: {
          ...buildAuthHeaders(token),
          "Content-Type": apiConfig.headers["Content-Type"],
        },
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

/**
 * POST /api/v1/usuarios/instrutores/:userId/bloqueios/revogar
 * Revoga bloqueio de um instrutor
 *
 * @param instrutorId - ID do instrutor
 * @param payload - Observações sobre a revogação (opcional)
 * @param token - Token JWT (opcional)
 * @returns Confirmação da revogação
 */
export async function revokeInstrutorBloqueio(
  instrutorId: string,
  payload?: import("./types").RevokeInstrutorBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(
    usuarioRoutes.instrutores.bloqueios.revoke(instrutorId),
    {
      init: {
        method: "POST",
        headers: {
          ...buildAuthHeaders(token),
          "Content-Type": apiConfig.headers["Content-Type"],
        },
        body: payload ? JSON.stringify(payload) : undefined,
      },
      cache: "no-cache",
    }
  );
}

/**
 * GET /api/v1/usuarios/instrutores/:userId/bloqueios
 * Lista histórico de bloqueios de um instrutor
 *
 * @param instrutorId - ID do instrutor
 * @param token - Token JWT (opcional)
 * @returns Histórico de bloqueios
 */
export async function listInstrutorBloqueios(
  instrutorId: string,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.instrutores.bloqueios.list(instrutorId), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

// ============================================================================
// ADMIN - USUARIOS GERAIS
// ============================================================================

/**
 * GET /api/v1/usuarios/usuarios
 * Lista todos os usuários gerais com paginação e filtros
 *
 * @param params - Parâmetros de filtro e paginação
 * @param token - Token JWT (opcional)
 * @returns Lista paginada de usuários
 */
export async function listUsuarios(
  params?: import("./types").ListUsuariosParams,
  token?: string
): Promise<import("./types").ListUsuariosResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.status) queryParams.set("status", params.status);
  if (params?.role) queryParams.set("role", params.role);
  if (params?.tipoUsuario) queryParams.set("tipoUsuario", params.tipoUsuario);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.cidade) queryParams.set("cidade", params.cidade);
  if (params?.estado) queryParams.set("estado", params.estado);

  const url = usuarioRoutes.admin.usuarios.list();
  const fullUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;

  return apiFetch<import("./types").ListUsuariosResponse>(fullUrl, {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
}

/**
 * GET /api/v1/usuarios/usuarios/:userId
 * Busca um usuário específico por ID
 *
 * @param userId - ID do usuário
 * @param token - Token JWT (opcional)
 * @returns Dados completos do usuário
 */
export async function getUsuarioById(
  userId: string,
  token?: string
): Promise<import("./types").GetUsuarioResponse> {
  return apiFetch<import("./types").GetUsuarioResponse>(
    usuarioRoutes.admin.usuarios.get(userId),
    {
      init: {
        method: "GET",
        headers: buildAuthHeaders(token),
      },
      cache: "no-cache",
    }
  );
}

/**
 * PUT /api/v1/usuarios/usuarios/:userId
 * Atualiza informações de um usuário
 *
 * @param userId - ID do usuário
 * @param payload - Dados para atualização
 * @param token - Token JWT (opcional)
 * @returns Dados atualizados do usuário
 */
export async function updateUsuario(
  userId: string,
  payload: import("./types").UpdateUsuarioPayload,
  token?: string
): Promise<import("./types").GetUsuarioResponse> {
  return apiFetch<import("./types").GetUsuarioResponse>(
    usuarioRoutes.admin.usuarios.update(userId),
    {
      init: {
        method: "PUT",
        headers: {
          ...buildAuthHeaders(token),
          ...JSON_HEADERS,
        },
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

/**
 * POST /api/v1/usuarios/usuarios
 * Cria um novo usuário no sistema (admin)
 *
 * @param payload - Dados do novo usuário
 * @param token - Token JWT (opcional)
 * @returns Dados do usuário criado
 */
export async function createUsuario(
  payload: import("./types").CreateUsuarioPayload,
  token?: string
): Promise<import("./types").CreateUsuarioResponse> {
  return apiFetch<import("./types").CreateUsuarioResponse>(
    usuarioRoutes.admin.usuarios.create(),
    {
      init: {
        method: "POST",
        headers: {
          ...buildAuthHeaders(token),
          ...JSON_HEADERS,
        },
        body: JSON.stringify(payload),
      },
      cache: "no-cache",
    }
  );
}

/**
 * POST /api/v1/usuarios/usuarios/:userId/bloqueios
 * Aplica um bloqueio em um usuário
 *
 * @param userId - ID do usuário
 * @param payload - Dados do bloqueio
 * @param token - Token JWT (opcional)
 * @returns Confirmação do bloqueio
 */
export async function createUsuarioBloqueio(
  userId: string,
  payload: import("./types").CreateUsuarioBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.admin.usuarios.bloqueios.create(userId), {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        ...JSON_HEADERS,
      },
      body: JSON.stringify(payload),
    },
    cache: "no-cache",
  });
}

/**
 * POST /api/v1/usuarios/usuarios/:userId/bloqueios/revogar
 * Revoga um bloqueio ativo de um usuário
 *
 * @param userId - ID do usuário
 * @param payload - Observações da revogação (opcional)
 * @param token - Token JWT (opcional)
 * @returns Confirmação da revogação
 */
export async function revokeUsuarioBloqueio(
  userId: string,
  payload?: import("./types").RevokeUsuarioBloqueioPayload,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.admin.usuarios.bloqueios.revoke(userId), {
    init: {
      method: "POST",
      headers: {
        ...buildAuthHeaders(token),
        ...JSON_HEADERS,
      },
      body: JSON.stringify(payload || {}),
    },
    cache: "no-cache",
  });
}

/**
 * GET /api/v1/usuarios/usuarios/:userId/bloqueios
 * Lista histórico de bloqueios de um usuário
 *
 * @param userId - ID do usuário
 * @param token - Token JWT (opcional)
 * @returns Histórico de bloqueios
 */
export async function listUsuarioBloqueios(
  userId: string,
  token?: string
): Promise<any> {
  return apiFetch<any>(usuarioRoutes.admin.usuarios.bloqueios.list(userId), {
    init: {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    cache: "no-cache",
  });
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

  // Admin - Candidatos/Alunos
  listAlunos,
  listAlunosDashboard,
  getAlunoById,
  getAlunoLogs,

  // Admin - Instrutores
  listInstrutores,
  getInstrutorById,
  updateInstrutor,
  createInstrutorBloqueio,
  revokeInstrutorBloqueio,
  listInstrutorBloqueios,

  // Admin - Usuarios Gerais
  listUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  createUsuarioBloqueio,
  revokeUsuarioBloqueio,
  listUsuarioBloqueios,

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
