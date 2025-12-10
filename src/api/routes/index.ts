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
  info: () => `${prefix}/website`,
  put: () => `${prefix}/website`,
  update: (id: string) => `${prefix}/website/${id}`,
  delete: (id: string) => `${prefix}/website/${id}`,
  item: {
    get: (recurso: string, id: string) =>
      `${prefix}/website/${encodeURIComponent(recurso)}/${encodeURIComponent(
        id
      )}`,
    update: (recurso: string, id: string) =>
      `${prefix}/website/${encodeURIComponent(recurso)}/${encodeURIComponent(
        id
      )}`,
    delete: (recurso: string, id: string) =>
      `${prefix}/website/${encodeURIComponent(recurso)}/${encodeURIComponent(
        id
      )}`,
  },
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
  scripts: {
    list: () => `${prefix}/website/scripts`,
    create: () => `${prefix}/website/scripts`,
    get: (id: string) => `${prefix}/website/scripts/${id}`,
    update: (id: string) => `${prefix}/website/scripts/${id}`,
    delete: (id: string) => `${prefix}/website/scripts/${id}`,
  },
};

/**
 * Endpoints for empresas-related operations.
 */
export const empresasRoutes = {
  planosEmpresariais: {
    list: () => `${prefix}/empresas/planos-empresariais`,
    create: () => `${prefix}/empresas/planos-empresariais`,
    get: (id: string) => `${prefix}/empresas/planos-empresariais/${id}`,
    update: (id: string) => `${prefix}/empresas/planos-empresariais/${id}`,
    delete: (id: string) => `${prefix}/empresas/planos-empresariais/${id}`,
  },
  clientes: {
    list: () => `${prefix}/empresas/clientes`,
    create: () => `${prefix}/empresas/clientes`,
    get: (id: string) =>
      `${prefix}/empresas/clientes/${encodeURIComponent(id)}`,
    update: (id: string) =>
      `${prefix}/empresas/clientes/${encodeURIComponent(id)}`,
    delete: (id: string) =>
      `${prefix}/empresas/clientes/${encodeURIComponent(id)}`,
  },
  adminEmpresas: {
    // Após unificação, não existe mais /empresas/admin.
    // Mantemos o namespace "adminEmpresas" no front para compatibilidade,
    // apontando para as novas rotas públicas do módulo Empresas.
    dashboard: () => `${prefix}/empresas/dashboard`,
    list: () => `${prefix}/empresas`,
    minha: () => `${prefix}/empresas/minha`, // Nova rota para empresa acessar seus próprios dados
    create: () => `${prefix}/empresas`,
    get: (id: string) => `${prefix}/empresas/${id}`,
    update: (id: string) => `${prefix}/empresas/${id}`,
    updatePlano: (id: string) => `${prefix}/empresas/${id}/plano`,
    createPlano: (id: string) => `${prefix}/empresas/${id}/plano`,
    validateCnpj: (cnpj: string) =>
      `${prefix}/empresas/validate-cnpj?cnpj=${cnpj}`,
    validateCpf: (cpf: string) => `${prefix}/empresas/validate-cpf?cpf=${cpf}`,
    pagamentos: {
      list: (id: string) => `${prefix}/empresas/${id}/pagamentos`,
    },
    banimentos: {
      // Backward-compat: map "banimentos" para as novas rotas de "bloqueios".
      list: (id: string) => `${prefix}/empresas/${id}/bloqueios`,
      create: (id: string) => `${prefix}/empresas/${id}/bloqueios`,
      revogar: (id: string) => `${prefix}/empresas/${id}/bloqueios/revogar`,
    },
    bloqueios: {
      list: (id: string) => `${prefix}/empresas/${id}/bloqueios`,
      create: (id: string) => `${prefix}/empresas/${id}/bloqueios`,
      revogar: (id: string) => `${prefix}/empresas/${id}/bloqueios/revogar`,
    },
    vagas: {
      list: (id: string) => `${prefix}/empresas/${id}/vagas`,
      minhas: () => `${prefix}/empresas/vagas/minhas`, // Nova rota para empresa acessar suas próprias vagas
      get: (id: string) => `${prefix}/empresas/vagas/${id}`,
      update: (id: string) => `${prefix}/empresas/vagas/${id}`,
      delete: (id: string) => `${prefix}/empresas/vagas/${id}`,
      emAnalise: (id: string) => `${prefix}/empresas/${id}/vagas/em-analise`,
      aprovar: (id: string, vagaId: string) =>
        `${prefix}/empresas/${id}/vagas/${vagaId}/aprovar`,
    },
  },
};

export const dashboardRoutes = {
  scripts: {
    list: () => `${prefix}/website/scripts`,
    create: () => `${prefix}/website/scripts`,
    get: (id: string) => `${prefix}/website/scripts/${id}`,
    update: (id: string) => `${prefix}/website/scripts/${id}`,
    delete: (id: string) => `${prefix}/website/scripts/${id}`,
  },
  overview: () => `${prefix}/dashboard/overview`,
};

/**
 * Endpoints for Brevo email verification flows.
 * Centraliza aliases e variações utilizadas no front.
 */
export const brevoRoutes = {
  base: () => `${prefix}/brevo`,
  info: () => `${prefix}/brevo`,
  health: () => `${prefix}/brevo/health`,
  config: () => `${prefix}/brevo/config`,
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
  test: {
    email: () => `${prefix}/brevo/test/email`,
    sms: () => `${prefix}/brevo/test/sms`,
  },
};

/**
 * Endpoints for Permissions module (permissoes).
 * Covers resources, grants, my permissions and audit logs.
 */
export const permissoesRoutes = {
  base: () => `${prefix}/permissoes`,
  recursos: {
    list: () => `${prefix}/permissoes/recursos`,
    create: () => `${prefix}/permissoes/recursos`,
  },
  grants: {
    list: () => `${prefix}/permissoes/grants`,
    create: () => `${prefix}/permissoes/grants`,
    get: (id: string) =>
      `${prefix}/permissoes/grants/${encodeURIComponent(id)}`,
    update: (id: string) =>
      `${prefix}/permissoes/grants/${encodeURIComponent(id)}`,
    delete: (id: string) =>
      `${prefix}/permissoes/grants/${encodeURIComponent(id)}`,
  },
  minhas: () => `${prefix}/permissoes/minhas`,
  auditoria: {
    list: () => `${prefix}/permissoes/auditoria`,
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
  admin: {
    candidatos: {
      list: () => `${prefix}/usuarios/candidatos`,
      dashboard: () => `${prefix}/usuarios/candidatos/dashboard`,
      get: (userId: string) =>
        `${prefix}/usuarios/candidatos/${encodeURIComponent(userId)}`,
      logs: (userId: string) =>
        `${prefix}/usuarios/candidatos/${encodeURIComponent(userId)}/logs`,
    },
    usuarios: {
      list: () => `${prefix}/usuarios/usuarios`,
      create: () => `${prefix}/usuarios/usuarios`,
      get: (userId: string) =>
        `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}`,
      update: (userId: string) =>
        `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}`,
      updateRole: (userId: string) =>
        `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}/role`,
      updateStatus: (userId: string) =>
        `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}/status`,
      bloqueios: {
        list: (userId: string) =>
          `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}/bloqueios`,
        create: (userId: string) =>
          `${prefix}/usuarios/usuarios/${encodeURIComponent(userId)}/bloqueios`,
        revoke: (userId: string) =>
          `${prefix}/usuarios/usuarios/${encodeURIComponent(
            userId
          )}/bloqueios/revogar`,
      },
    },
  },
  alunos: {
    bloqueios: {
      list: (id: string) =>
        `${prefix}/usuarios/alunos/${encodeURIComponent(id)}/bloqueios`,
      create: (id: string) =>
        `${prefix}/usuarios/alunos/${encodeURIComponent(id)}/bloqueios`,
      revoke: (id: string) =>
        `${prefix}/usuarios/alunos/${encodeURIComponent(id)}/bloqueios/revogar`,
    },
  },
  instrutores: {
    list: () => `${prefix}/usuarios/instrutores`,
    get: (instrutorId: string) =>
      `${prefix}/usuarios/instrutores/${encodeURIComponent(instrutorId)}`,
    update: (instrutorId: string) =>
      `${prefix}/usuarios/instrutores/${encodeURIComponent(instrutorId)}`,
    bloqueios: {
      list: (instrutorId: string) =>
        `${prefix}/usuarios/instrutores/${encodeURIComponent(
          instrutorId
        )}/bloqueios`,
      create: (instrutorId: string) =>
        `${prefix}/usuarios/instrutores/${encodeURIComponent(
          instrutorId
        )}/bloqueios`,
      revoke: (instrutorId: string) =>
        `${prefix}/usuarios/instrutores/${encodeURIComponent(
          instrutorId
        )}/bloqueios/revogar`,
    },
  },
};

/**
 * Minimal endpoints for other core services.
 * Extend these as the front-end begins to consume them.
 */
export const mercadoPagoRoutes = {
  base: () => `${prefix}/mercadopago`,
  logs: {
    list: () => `${prefix}/mercadopago/logs`,
    get: (id: string) => `${prefix}/mercadopago/logs/${encodeURIComponent(id)}`,
  },
  // ========================================
  // Pagamentos Únicos (Checkout Pro)
  // ========================================
  pagamentos: {
    /** Cria uma preferência de pagamento único (Checkout Pro) */
    checkout: () => `${prefix}/mercadopago/pagamentos/checkout`,
    /** Consulta status de um pagamento */
    get: (paymentId: string) =>
      `${prefix}/mercadopago/pagamentos/${encodeURIComponent(paymentId)}`,
    /** Lista pagamentos de um usuário */
    list: () => `${prefix}/mercadopago/pagamentos`,
    /** Reembolsa um pagamento */
    refund: (paymentId: string) =>
      `${prefix}/mercadopago/pagamentos/${encodeURIComponent(paymentId)}/refund`,
    /** Webhook para notificações de pagamento */
    webhook: () => `${prefix}/mercadopago/pagamentos/webhook`,
  },
  // ========================================
  // Assinaturas (Pagamentos Recorrentes)
  // ========================================
  assinaturas: {
    checkout: () => `${prefix}/mercadopago/assinaturas/checkout`,
    cancelar: () => `${prefix}/mercadopago/assinaturas/cancelar`,
    upgrade: () => `${prefix}/mercadopago/assinaturas/upgrade`,
    downgrade: () => `${prefix}/mercadopago/assinaturas/downgrade`,
    remindPayment: () => `${prefix}/mercadopago/assinaturas/remind-payment`,
    reconcile: () => `${prefix}/mercadopago/assinaturas/reconcile`,
    webhook: () => `${prefix}/mercadopago/assinaturas/webhook`,
    /** Consulta status de uma assinatura */
    get: (subscriptionId: string) =>
      `${prefix}/mercadopago/assinaturas/${encodeURIComponent(subscriptionId)}`,
    admin: {
      remindPayment: () =>
        `${prefix}/mercadopago/assinaturas/admin/remind-payment`,
      syncPlan: () => `${prefix}/mercadopago/assinaturas/admin/sync-plan`,
      syncPlans: () => `${prefix}/mercadopago/assinaturas/admin/sync-plans`,
    },
  },
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
export const vagasRoutes = {
  list: () => `${prefix}/empresas/vagas`,
  get: (id: string) => `${prefix}/empresas/vagas/${id}`,
  update: (id: string) => `${prefix}/empresas/vagas/${id}`,
  delete: (id: string) => `${prefix}/empresas/vagas/${id}`,
  processos: {
    list: (vagaId: string) =>
      `${prefix}/empresas/vagas/${encodeURIComponent(vagaId)}/processos`,
    create: (vagaId: string) =>
      `${prefix}/empresas/vagas/${encodeURIComponent(vagaId)}/processos`,
    get: (vagaId: string, processoId: string) =>
      `${prefix}/empresas/vagas/${encodeURIComponent(
        vagaId
      )}/processos/${encodeURIComponent(processoId)}`,
    update: (vagaId: string, processoId: string) =>
      `${prefix}/empresas/vagas/${encodeURIComponent(
        vagaId
      )}/processos/${encodeURIComponent(processoId)}`,
    delete: (vagaId: string, processoId: string) =>
      `${prefix}/empresas/vagas/${encodeURIComponent(
        vagaId
      )}/processos/${encodeURIComponent(processoId)}`,
  },
};

/**
 * Endpoints for Status de Processo operations.
 */
export const statusProcessoRoutes = {
  list: () => `${prefix}/status-processo`,
  create: () => `${prefix}/status-processo`,
  get: (id: string) => `${prefix}/status-processo/${encodeURIComponent(id)}`,
  update: (id: string) => `${prefix}/status-processo/${encodeURIComponent(id)}`,
  delete: (id: string) => `${prefix}/status-processo/${encodeURIComponent(id)}`,
  reorder: (id: string) =>
    `${prefix}/status-processo/${encodeURIComponent(id)}/reorder`,
  checkUsage: (id: string) =>
    `${prefix}/status-processo/${encodeURIComponent(id)}/usage`,
  validateCodigo: (codigo: string) =>
    `${prefix}/status-processo/validate-codigo?codigo=${encodeURIComponent(
      codigo
    )}`,
  validateDefault: () => `${prefix}/status-processo/validate-default`,
};

export const routes = {
  website: websiteRoutes,
  empresas: empresasRoutes,
  vagas: vagasRoutes,
  usuarios: usuarioRoutes,
  mercadopago: mercadoPagoRoutes,
  brevo: brevoRoutes,
  permissoes: permissoesRoutes,
  upload: uploadRoutes,
  statusProcesso: statusProcessoRoutes,
};

export type Routes = typeof routes;

export default routes;
