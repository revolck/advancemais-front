/**
 * Tipos para API de Categorias de Vagas Corporativas
 */

// ============================================================================
// TIPOS DE CATEGORIA E SUBCATEGORIA
// ============================================================================

export interface EmpresaVagaSubcategoria {
  id: string;
  codSubcategoria: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EmpresaVagaCategoria {
  id: string;
  codCategoria: string;
  nome: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
  subcategorias?: EmpresaVagaSubcategoria[];
}

// ============================================================================
// PAYLOADS DE REQUISIÇÃO
// ============================================================================

export interface CreateEmpresaVagaCategoriaPayload {
  nome: string;
  descricao: string;
}

export interface UpdateEmpresaVagaCategoriaPayload {
  nome?: string;
  descricao?: string;
}

export interface CreateEmpresaVagaSubcategoriaPayload {
  nome: string;
  descricao: string;
}

export interface UpdateEmpresaVagaSubcategoriaPayload {
  nome?: string;
  descricao?: string;
}

// ============================================================================
// RESPONSES DA API
// ============================================================================

export interface EmpresaVagaErrorResponse {
  success: false;
  message: string;
  code: string;
  error?: string;
  issues?: Record<string, string[]>;
}

export type EmpresaVagaCategoriasListApiResponse =
  | EmpresaVagaCategoria[]
  | EmpresaVagaErrorResponse;

export type EmpresaVagaCategoriaDetailApiResponse =
  | EmpresaVagaCategoria
  | EmpresaVagaErrorResponse;

export type EmpresaVagaSubcategoriaDetailApiResponse =
  | EmpresaVagaSubcategoria
  | EmpresaVagaErrorResponse;

export type EmpresaVagaCategoriaCreateApiResponse =
  | EmpresaVagaCategoria
  | EmpresaVagaErrorResponse;

export type EmpresaVagaSubcategoriaCreateApiResponse =
  | EmpresaVagaSubcategoria
  | EmpresaVagaErrorResponse;

// ============================================================================
// PARÂMETROS DE LISTAGEM
// ============================================================================

export interface EmpresaVagaCategoriasListParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

