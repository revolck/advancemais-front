/**
 * Rotas para API de Categorias de Vagas Corporativas
 */

const BASE_PATH = "/api/v1/empresas/vagas";

export const empresaVagasCategoriasRoutes = {
  list: () => `${BASE_PATH}/categorias`,
  detail: (categoriaId: string) => `${BASE_PATH}/categorias/${categoriaId}`,
  create: () => `${BASE_PATH}/categorias`,
  update: (categoriaId: string) => `${BASE_PATH}/categorias/${categoriaId}`,
  delete: (categoriaId: string) => `${BASE_PATH}/categorias/${categoriaId}`,
  subcategorias: {
    list: (categoriaId: string) =>
      `${BASE_PATH}/categorias/${categoriaId}/subcategorias`,
    create: (categoriaId: string) =>
      `${BASE_PATH}/categorias/${categoriaId}/subcategorias`,
    detail: (subcategoriaId: string) =>
      `${BASE_PATH}/subcategorias/${subcategoriaId}`,
    update: (subcategoriaId: string) =>
      `${BASE_PATH}/subcategorias/${subcategoriaId}`,
    delete: (subcategoriaId: string) =>
      `${BASE_PATH}/subcategorias/${subcategoriaId}`,
  },
} as const;

