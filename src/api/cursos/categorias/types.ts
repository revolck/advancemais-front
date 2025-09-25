/**
 * Tipos para API de Categorias de Cursos
 */

// ============================================================================
// TIPOS DE CATEGORIA
// ============================================================================

export interface CategoriaCurso {
  id: number;
  codCategoria: string;
  nome: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
  subcategorias?: SubcategoriaCurso[];
}

export interface SubcategoriaCurso {
  id: number;
  codSubcategoria: string;
  nome: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ============================================================================
// PAYLOADS DE REQUISIÇÃO
// ============================================================================

export interface CreateCategoriaPayload {
  nome: string;
  descricao: string;
}

export interface UpdateCategoriaPayload {
  nome?: string;
  descricao?: string;
}

export interface CreateSubcategoriaPayload {
  nome: string;
  descricao: string;
}

export interface UpdateSubcategoriaPayload {
  nome?: string;
  descricao?: string;
}

// ============================================================================
// RESPONSES DA API
// ============================================================================

// Union types for API responses
export type CategoriasListApiResponse =
  | CategoriaCurso[]
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type CategoriaDetailApiResponse =
  | CategoriaCurso
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type SubcategoriaDetailApiResponse =
  | SubcategoriaCurso
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type CategoriaCreateApiResponse =
  | CategoriaCurso
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

export type SubcategoriaCreateApiResponse =
  | SubcategoriaCurso
  | {
      success: false;
      message: string;
      code: string;
      error: string;
    };

// ============================================================================
// PARÂMETROS DE LISTAGEM
// ============================================================================

export interface CategoriasListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SubcategoriasListParams {
  categoriaId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
