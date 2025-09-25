/**
 * Exportações da API de Cursos
 */

// Categorias
export {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "./categorias";

// Subcategorias
export {
  listSubcategorias,
  getSubcategoria,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
} from "./categorias";

// Tipos
export type {
  CategoriaCurso,
  SubcategoriaCurso,
  CreateCategoriaPayload,
  UpdateCategoriaPayload,
  CreateSubcategoriaPayload,
  UpdateSubcategoriaPayload,
  CategoriasListApiResponse,
  CategoriaDetailApiResponse,
  SubcategoriaDetailApiResponse,
  CategoriaCreateApiResponse,
  SubcategoriaCreateApiResponse,
  CategoriasListParams,
  SubcategoriasListParams,
} from "./categorias/types";
