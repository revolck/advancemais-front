/**
 * Rotas para API de Categorias de Cursos
 */

const BASE_PATH = "/api/v1/cursos";

export const categoriasRoutes = {
  // Categorias
  list: () => `${BASE_PATH}/categorias`,
  detail: (id: number) => `${BASE_PATH}/categorias/${id}`,
  create: () => `${BASE_PATH}/categorias`,
  update: (id: number) => `${BASE_PATH}/categorias/${id}`,
  delete: (id: number) => `${BASE_PATH}/categorias/${id}`,

  // Subcategorias
  subcategorias: {
    list: (categoriaId: number) =>
      `${BASE_PATH}/categorias/${categoriaId}/subcategorias`,
    create: (categoriaId: number) =>
      `${BASE_PATH}/categorias/${categoriaId}/subcategorias`,
    detail: (id: number) => `${BASE_PATH}/subcategorias/${id}`,
    update: (id: number) => `${BASE_PATH}/subcategorias/${id}`,
    delete: (id: number) => `${BASE_PATH}/subcategorias/${id}`,
  },
} as const;
