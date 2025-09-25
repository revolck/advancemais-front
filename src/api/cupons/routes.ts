/**
 * Rotas para API de Cupons de Desconto
 */

const BASE_PATH = "/api/v1/cupons";

export const cuponsRoutes = {
  // Cupons
  list: () => `${BASE_PATH}`,
  detail: (id: string) => `${BASE_PATH}/${id}`,
  create: () => `${BASE_PATH}`,
  update: (id: string) => `${BASE_PATH}/${id}`,
  delete: (id: string) => `${BASE_PATH}/${id}`,
} as const;
