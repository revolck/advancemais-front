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

// Cursos (core)
export {
  getCursosMeta,
  listCursos,
  createCurso,
  getCursoById,
  updateCurso,
  despublicarCurso,
  listTurmas,
  getTurmaById,
  createTurma,
  listInscricoes,
  createInscricao,
  deleteInscricao,
  listProvas,
  listCertificados,
  listAlunosComInscricao,
  getCursoAlunoDetalhes,
  updateCursoAluno,
} from "./core";
export type {
  CursosModuleMeta as CursosModuleInfoResponse,
  CursosListParams,
  CursosListResponse,
  CreateCursoPayload,
  UpdateCursoPayload,
  Curso,
  CreateTurmaPayload,
  CursoTurma,
  TurmaInscricao,
  CreateInscricaoPayload,
  TurmaProva,
  TurmaCertificado,
  TurmaEstagio,
  AlunoComInscricao,
  ListAlunosComInscricaoParams,
  ListAlunosComInscricaoResponse,
  CursoAlunoDetalhes,
  CursoAlunoDetalhesResponse,
  CursoAlunoInscricao,
  CursoAlunoEndereco,
  CursoAlunoEstatisticas,
  CursoAlunoCursoResumo,
  CursoAlunoTurmaResumo,
} from "./types";
