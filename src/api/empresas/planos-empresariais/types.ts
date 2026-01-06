export interface PlanoEmpresarialBackendResponse {
  id: string;
  icon: string;
  nome: string;
  descricao?: string | null;
  valor: string;
  desconto: number;
  quantidadeVagas: number;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreatePlanoEmpresarialPayload {
  icon: string;
  nome: string;
  descricao?: string;
  valor: string;
  desconto: number;
  quantidadeVagas: number;
  vagaEmDestaque: boolean;
  quantidadeVagasDestaque: number;
}

export interface UpdatePlanoEmpresarialPayload {
  icon?: string;
  nome?: string;
  descricao?: string;
  valor?: string;
  desconto?: number;
  quantidadeVagas?: number;
  vagaEmDestaque?: boolean;
  quantidadeVagasDestaque?: number;
}

// Error response types
export interface PlanoEmpresarialErrorResponse {
  success: false;
  message: string;
  code: string;
  error?: string;
}

export interface PlanoEmpresarialValidationError
  extends PlanoEmpresarialErrorResponse {
  code: "VALIDATION_ERROR";
  issues: Record<string, string[]>;
}

export interface PlanoEmpresarialNotFoundError
  extends PlanoEmpresarialErrorResponse {
  code: "VALIDATION_ERROR";
}

export interface PlanoEmpresarialLimitReachedError
  extends PlanoEmpresarialErrorResponse {
  code: "PLANOS_EMPRESARIAIS_LIMIT_REACHED";
  limite: number;
}

export interface PlanoEmpresarialUnauthorizedError
  extends PlanoEmpresarialErrorResponse {
  message: "Token de autorização necessário";
  error: "Token inválido ou expirado";
}

export interface PlanoEmpresarialForbiddenError
  extends PlanoEmpresarialErrorResponse {
  message: "Acesso negado: permissões insuficientes";
  requiredRoles: string[];
  userRole: string;
}

// Union types for API responses
export type PlanoEmpresarialListApiResponse =
  | PlanoEmpresarialBackendResponse[]
  | PlanoEmpresarialErrorResponse;

export type PlanoEmpresarialDetailApiResponse =
  | PlanoEmpresarialBackendResponse
  | PlanoEmpresarialNotFoundError
  | PlanoEmpresarialErrorResponse;

export type PlanoEmpresarialCreateApiResponse =
  | PlanoEmpresarialBackendResponse
  | PlanoEmpresarialValidationError
  | PlanoEmpresarialUnauthorizedError
  | PlanoEmpresarialForbiddenError
  | PlanoEmpresarialLimitReachedError
  | PlanoEmpresarialErrorResponse;

export type PlanoEmpresarialUpdateApiResponse =
  | PlanoEmpresarialBackendResponse
  | PlanoEmpresarialValidationError
  | PlanoEmpresarialNotFoundError
  | PlanoEmpresarialUnauthorizedError
  | PlanoEmpresarialForbiddenError
  | PlanoEmpresarialErrorResponse;

export type PlanoEmpresarialDeleteApiResponse =
  | void
  | PlanoEmpresarialNotFoundError
  | PlanoEmpresarialUnauthorizedError
  | PlanoEmpresarialForbiddenError
  | PlanoEmpresarialErrorResponse;
