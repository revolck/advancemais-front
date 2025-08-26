import { env } from "@/lib/env";

// Prefix common to all internal API routes
const prefix = `/api/${env.apiVersion}`;

/**
 * Endpoints for website-related operations.
 * Each function returns the path relative to the Next.js app,
 * which is then proxied to the external service.
 * Nested objects group component-specific endpoints.
 */
export const websiteRoutes = {
  get: () => `${prefix}/website`,
  put: () => `${prefix}/website`,
  update: (id: string) => `${prefix}/website/${id}`,
  delete: (id: string) => `${prefix}/website/${id}`,
  about: {
    list: () => `${prefix}/website/sobre`,
    create: () => `${prefix}/website/sobre`,
    get: (id: string) => `${prefix}/website/sobre/${id}`,
    update: (id: string) => `${prefix}/website/sobre/${id}`,
    delete: (id: string) => `${prefix}/website/sobre/${id}`,
  },
  home: {
    slide: () => `${prefix}/website/slide`,
    banner: () => `${prefix}/website/banner`,
  },
};

/**
 * Endpoints for user-related operations (usuarios).
 * Mirrors the backend users module and groups auth, profile
 * and password recovery helpers in one place.
 */
export const usuarioRoutes = {
  base: () => `${prefix}/usuarios`,
  register: () => `${prefix}/usuarios/registrar`,
  login: () => `${prefix}/usuarios/login`,
  logout: () => `${prefix}/usuarios/logout`,
  refresh: () => `${prefix}/usuarios/refresh`,
  profile: {
    get: () => `${prefix}/usuarios/perfil`,
    update: () => `${prefix}/usuarios/perfil`,
  },
  recovery: {
    request: () => `${prefix}/usuarios/recuperar-senha`,
    validate: (token: string) =>
      `${prefix}/usuarios/recuperar-senha/validar/${token}`,
    reset: () => `${prefix}/usuarios/recuperar-senha/redefinir`,
  },
  verification: {
    verify: (token: string) =>
      `${prefix}/brevo/verificar-email?token=${token}`,
    resend: () => `${prefix}/brevo/reenviar-verificacao`,
    status: (userId: string) =>
      `${prefix}/brevo/status-verificacao/${userId}`,
  },
};

/**
 * Minimal endpoints for other core services.
 * Extend these as the front-end begins to consume them.
 */
export const mercadoPagoRoutes = {
  base: () => `${prefix}/mercadopago`,
};

export const brevoRoutes = {
  base: () => `${prefix}/brevo`,
};

/**
 * Endpoints for uploading files.
 * Allows pages to specify the correct destination for each upload.
 */
export const uploadRoutes = {
  base: () => `${prefix}/upload`,
};

/**
 * Collection of all API route groups.
 * Extend this object as new microservices are added.
 */
export const routes = {
  website: websiteRoutes,
  usuarios: usuarioRoutes,
  mercadopago: mercadoPagoRoutes,
  brevo: brevoRoutes,
  upload: uploadRoutes,
};

export type Routes = typeof routes;

export default routes;
