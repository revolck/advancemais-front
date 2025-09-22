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
  consultoria: {
    list: () => `${prefix}/website/consultoria`,
    create: () => `${prefix}/website/consultoria`,
    get: (id: string) => `${prefix}/website/consultoria/${id}`,
    update: (id: string) => `${prefix}/website/consultoria/${id}`,
    delete: (id: string) => `${prefix}/website/consultoria/${id}`,
  },
  recrutamento: {
    list: () => `${prefix}/website/recrutamento`,
    create: () => `${prefix}/website/recrutamento`,
    get: (id: string) => `${prefix}/website/recrutamento/${id}`,
    update: (id: string) => `${prefix}/website/recrutamento/${id}`,
    delete: (id: string) => `${prefix}/website/recrutamento/${id}`,
  },
  treinamento: {
    list: () => `${prefix}/website/treinamento`,
    create: () => `${prefix}/website/treinamento`,
    get: (id: string) => `${prefix}/website/treinamento/${id}`,
    update: (id: string) => `${prefix}/website/treinamento/${id}`,
    delete: (id: string) => `${prefix}/website/treinamento/${id}`,
  },
  diferenciais: {
    list: () => `${prefix}/website/diferenciais`,
    create: () => `${prefix}/website/diferenciais`,
    get: (id: string) => `${prefix}/website/diferenciais/${id}`,
    update: (id: string) => `${prefix}/website/diferenciais/${id}`,
    delete: (id: string) => `${prefix}/website/diferenciais/${id}`,
  },
  planinhas: {
    list: () => `${prefix}/website/planinhas`,
    create: () => `${prefix}/website/planinhas`,
    get: (id: string) => `${prefix}/website/planinhas/${id}`,
    update: (id: string) => `${prefix}/website/planinhas/${id}`,
    delete: (id: string) => `${prefix}/website/planinhas/${id}`,
  },
  recrutamentoSelecao: {
    list: () => `${prefix}/website/recrutamento-selecao`,
    create: () => `${prefix}/website/recrutamento-selecao`,
    get: (id: string) => `${prefix}/website/recrutamento-selecao/${id}`,
    update: (id: string) => `${prefix}/website/recrutamento-selecao/${id}`,
    delete: (id: string) => `${prefix}/website/recrutamento-selecao/${id}`,
  },
  treinamentosInCompany: {
    list: () => `${prefix}/website/treinamentos-in-company`,
    create: () => `${prefix}/website/treinamentos-in-company`,
    get: (id: string) => `${prefix}/website/treinamentos-in-company/${id}`,
    update: (id: string) => `${prefix}/website/treinamentos-in-company/${id}`,
    delete: (id: string) => `${prefix}/website/treinamentos-in-company/${id}`,
  },
  treinamentoCompany: {
    list: () => `${prefix}/website/treinamento-company`,
    create: () => `${prefix}/website/treinamento-company`,
    get: (id: string) => `${prefix}/website/treinamento-company/${id}`,
    update: (id: string) => `${prefix}/website/treinamento-company/${id}`,
    delete: (id: string) => `${prefix}/website/treinamento-company/${id}`,
  },
  conexaoForte: {
    list: () => `${prefix}/website/conexao-forte`,
    create: () => `${prefix}/website/conexao-forte`,
    get: (id: string) => `${prefix}/website/conexao-forte/${id}`,
    update: (id: string) => `${prefix}/website/conexao-forte/${id}`,
    delete: (id: string) => `${prefix}/website/conexao-forte/${id}`,
  },
  advanceAjuda: {
    list: () => `${prefix}/website/advance-ajuda`,
    create: () => `${prefix}/website/advance-ajuda`,
    get: (id: string) => `${prefix}/website/advance-ajuda/${id}`,
    update: (id: string) => `${prefix}/website/advance-ajuda/${id}`,
    delete: (id: string) => `${prefix}/website/advance-ajuda/${id}`,
  },
  sistema: {
    list: () => `${prefix}/website/sistema`,
    create: () => `${prefix}/website/sistema`,
    get: (id: string) => `${prefix}/website/sistema/${id}`,
    update: (id: string) => `${prefix}/website/sistema/${id}`,
    delete: (id: string) => `${prefix}/website/sistema/${id}`,
  },
  sobreEmpresa: {
    list: () => `${prefix}/website/sobre-empresa`,
    create: () => `${prefix}/website/sobre-empresa`,
    get: (id: string) => `${prefix}/website/sobre-empresa/${id}`,
    update: (id: string) => `${prefix}/website/sobre-empresa/${id}`,
    delete: (id: string) => `${prefix}/website/sobre-empresa/${id}`,
  },
  slider: {
    list: () => `${prefix}/website/slider`,
    create: () => `${prefix}/website/slider`,
    get: (id: string) => `${prefix}/website/slider/${id}`,
    update: (id: string) => `${prefix}/website/slider/${id}`,
    delete: (id: string) => `${prefix}/website/slider/${id}`,
    reorder: (id: string) => `${prefix}/website/slider/${id}/reorder`,
  },
  banner: {
    list: () => `${prefix}/website/banner`,
    create: () => `${prefix}/website/banner`,
    get: (id: string) => `${prefix}/website/banner/${id}`,
    update: (id: string) => `${prefix}/website/banner/${id}`,
    delete: (id: string) => `${prefix}/website/banner/${id}`,
    reorder: (id: string) => `${prefix}/website/banner/${id}/reorder`,
  },
  logoEnterprises: {
    list: () => `${prefix}/website/logo-enterprises`,
    create: () => `${prefix}/website/logo-enterprises`,
    get: (id: string) => `${prefix}/website/logo-enterprises/${id}`,
    update: (id: string) => `${prefix}/website/logo-enterprises/${id}`,
    delete: (id: string) => `${prefix}/website/logo-enterprises/${id}`,
    reorder: (id: string) => `${prefix}/website/logo-enterprises/${id}/reorder`,
  },
  depoimentos: {
    list: () => `${prefix}/website/depoimentos`,
    create: () => `${prefix}/website/depoimentos`,
    get: (id: string) => `${prefix}/website/depoimentos/${id}`,
    update: (id: string) => `${prefix}/website/depoimentos/${id}`,
    delete: (id: string) => `${prefix}/website/depoimentos/${id}`,
    reorder: (id: string) => `${prefix}/website/depoimentos/${id}/reorder`,
  },
  team: {
    list: () => `${prefix}/website/team`,
    create: () => `${prefix}/website/team`,
    get: (id: string) => `${prefix}/website/team/${id}`,
    update: (id: string) => `${prefix}/website/team/${id}`,
    delete: (id: string) => `${prefix}/website/team/${id}`,
    reorder: (id: string) => `${prefix}/website/team/${id}/reorder`,
  },
  headerPages: {
    list: () => `${prefix}/website/header-pages`,
    create: () => `${prefix}/website/header-pages`,
    get: (id: string) => `${prefix}/website/header-pages/${id}`,
    update: (id: string) => `${prefix}/website/header-pages/${id}`,
    delete: (id: string) => `${prefix}/website/header-pages/${id}`,
  },
  loginImage: {
    list: () => `${prefix}/website/imagem-login`,
    create: () => `${prefix}/website/imagem-login`,
    get: (id: string) => `${prefix}/website/imagem-login/${id}`,
    update: (id: string) => `${prefix}/website/imagem-login/${id}`,
    delete: (id: string) => `${prefix}/website/imagem-login/${id}`,
  },
  informacoesGerais: {
    list: () => `${prefix}/website/informacoes-gerais`,
    create: () => `${prefix}/website/informacoes-gerais`,
    get: (id: string) => `${prefix}/website/informacoes-gerais/${id}`,
    update: (id: string) => `${prefix}/website/informacoes-gerais/${id}`,
    delete: (id: string) => `${prefix}/website/informacoes-gerais/${id}`,
  },
};

/**
 * Endpoints for empresas-related operations.
 */
export const empresasRoutes = {
  planosEmpresarial: {
    list: () => `${prefix}/empresas/planos-empresarial`,
    create: () => `${prefix}/empresas/planos-empresarial`,
    get: (id: string) => `${prefix}/empresas/planos-empresarial/${id}`,
    update: (id: string) => `${prefix}/empresas/planos-empresarial/${id}`,
    delete: (id: string) => `${prefix}/empresas/planos-empresarial/${id}`,
  },
  adminEmpresas: {
    list: () => `${prefix}/empresas/admin`,
    create: () => `${prefix}/empresas/admin`,
    get: (id: string) => `${prefix}/empresas/admin/${id}`,
    update: (id: string) => `${prefix}/empresas/admin/${id}`,
    pagamentos: {
      list: (id: string) => `${prefix}/empresas/admin/${id}/pagamentos`,
    },
    banimentos: {
      list: (id: string) => `${prefix}/empresas/admin/${id}/banimentos`,
      create: (id: string) => `${prefix}/empresas/admin/${id}/banimentos`,
    },
    vagas: {
      list: (id: string) => `${prefix}/empresas/admin/${id}/vagas`,
      emAnalise: (id: string) => `${prefix}/empresas/admin/${id}/vagas/em-analise`,
      aprovar: (id: string, vagaId: string) =>
        `${prefix}/empresas/admin/${id}/vagas/${vagaId}/aprovar`,
    },
  },
};

/**
 * Endpoints for Brevo email verification flows.
 * Centraliza aliases e variações utilizadas no front.
 */
export const brevoRoutes = {
  base: () => `${prefix}/brevo`,
  verification: {
    /**
     * GET /api/v1/brevo/verificar-email?token=...
     */
    verifyEmail: (token: string) =>
      `${prefix}/brevo/verificar-email?token=${encodeURIComponent(token)}`,
    /**
     * POST /api/v1/brevo/reenviar-verificacao
     */
    resendVerification: () => `${prefix}/brevo/reenviar-verificacao`,
    /**
     * GET /api/v1/brevo/status-verificacao/{userId}
     */
    statusByUserId: (userId: string) =>
      `${prefix}/brevo/status-verificacao/${encodeURIComponent(userId)}`,
    /**
     * GET /api/v1/brevo/status/{email}
     */
    statusByEmail: (email: string) =>
      `${prefix}/brevo/status/${encodeURIComponent(email)}`,
    alias: {
      /**
       * GET /api/v1/brevo/verificar?token=...
       */
      verifyEmail: (token: string) =>
        `${prefix}/brevo/verificar?token=${encodeURIComponent(token)}`,
      /**
       * POST /api/v1/brevo/reenviar
       */
      resendVerification: () => `${prefix}/brevo/reenviar`,
    },
  },
};

/**
 * Endpoints for user-related operations (usuarios).
 * Mirrors the backend users module and groups auth, profile
 * and password recovery helpers in one place.
 */
const usuarioBase = () => `${prefix}/usuarios`;
const usuarioRegister = () => `${prefix}/usuarios/registrar`;
const usuarioLogin = () => `${prefix}/usuarios/login`;
const usuarioLogout = () => `${prefix}/usuarios/logout`;
const usuarioRefresh = () => `${prefix}/usuarios/refresh`;

export const usuarioRoutes = {
  /**
   * Retorna o endpoint raiz do módulo de usuários.
   * Deve ser usado para recuperar as informações gerais do serviço
   * (GET /api/v1/usuarios).
   */
  base: usuarioBase,
  /**
   * Alias semântico para o endpoint de informações do módulo.
   */
  info: usuarioBase,
  register: usuarioRegister,
  login: usuarioLogin,
  logout: usuarioLogout,
  refresh: usuarioRefresh,
  auth: {
    register: usuarioRegister,
    login: usuarioLogin,
    logout: usuarioLogout,
    refresh: usuarioRefresh,
  },
  profile: {
    get: () => `${prefix}/usuarios/perfil`,
    update: () => `${prefix}/usuarios/perfil`,
  },
  recovery: {
    request: () => `${prefix}/usuarios/recuperar-senha`,
    validate: (token: string) =>
      `${prefix}/usuarios/recuperar-senha/validar/${encodeURIComponent(token)}`,
    reset: () => `${prefix}/usuarios/recuperar-senha/redefinir`,
  },
  verification: {
    verify: brevoRoutes.verification.verifyEmail,
    resend: brevoRoutes.verification.resendVerification,
    status: brevoRoutes.verification.statusByUserId,
    alias: brevoRoutes.verification.alias,
  },
};

/**
 * Minimal endpoints for other core services.
 * Extend these as the front-end begins to consume them.
 */
export const mercadoPagoRoutes = {
  base: () => `${prefix}/mercadopago`,
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
  empresas: empresasRoutes,
  usuarios: usuarioRoutes,
  mercadopago: mercadoPagoRoutes,
  brevo: brevoRoutes,
  upload: uploadRoutes,
};

export type Routes = typeof routes;

export default routes;
