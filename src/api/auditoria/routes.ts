/**
 * Rotas para API de Auditoria
 */

const BASE = "/api/v1/auditoria" as const;

export const auditoriaRoutes = {
  base: () => BASE,
  logs: {
    list: () => `${BASE}/logs`,
    get: (id: string) => `${BASE}/logs/${encodeURIComponent(id)}`,
    byEntidade: (entidadeId: string) =>
      `${BASE}/logs/entidade/${encodeURIComponent(entidadeId)}`,
    byUsuario: (usuarioId: string) =>
      `${BASE}/logs/usuario/${encodeURIComponent(usuarioId)}`,
    acesso: () => `${BASE}/logs/acesso`,
    alteracao: () => `${BASE}/logs/alteracao`,
    erro: () => `${BASE}/logs/erro`,
    estatisticas: () => `${BASE}/logs/estatisticas`,
    exportar: () => `${BASE}/logs/exportar`,
  },
  scripts: {
    list: () => `${BASE}/scripts`,
    create: () => `${BASE}/scripts`,
    get: (id: string) => `${BASE}/scripts/${encodeURIComponent(id)}`,
    update: (id: string) => `${BASE}/scripts/${encodeURIComponent(id)}`,
    estatisticas: () => `${BASE}/scripts/estatisticas`,
    executar: (id: string) => `${BASE}/scripts/${encodeURIComponent(id)}/executar`,
    cancelar: (id: string) => `${BASE}/scripts/${encodeURIComponent(id)}/cancelar`,
  },
  transacoes: {
    list: () => `${BASE}/transacoes`,
    create: () => `${BASE}/transacoes`,
    get: (id: string) => `${BASE}/transacoes/${encodeURIComponent(id)}`,
    update: (id: string) => `${BASE}/transacoes/${encodeURIComponent(id)}`,
    byEmpresa: (empresaId: string) =>
      `${BASE}/transacoes/empresa/${encodeURIComponent(empresaId)}`,
    byUsuario: (usuarioId: string) =>
      `${BASE}/transacoes/usuario/${encodeURIComponent(usuarioId)}`,
    estatisticas: () => `${BASE}/transacoes/estatisticas`,
    resumo: () => `${BASE}/transacoes/resumo`,
    status: (id: string) => `${BASE}/transacoes/${encodeURIComponent(id)}/status`,
  },
  assinaturas: {
    list: () => `${BASE}/assinaturas`,
    get: (id: string) => `${BASE}/assinaturas/${encodeURIComponent(id)}`,
    estatisticas: () => `${BASE}/assinaturas/estatisticas`,
    logs: () => `${BASE}/assinaturas/logs`,
    pagamentos: () => `${BASE}/assinaturas/pagamentos`,
    planos: () => `${BASE}/assinaturas/planos`,
    resumo: () => `${BASE}/assinaturas/resumo`,
  },
  usuarios: {
    historico: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/historico`,
    login: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/login`,
    perfil: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/perfil`,
    acoes: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/acoes`,
    acessos: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/acessos`,
    permissoes: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/permissoes`,
    estatisticas: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/estatisticas`,
    resumo: (usuarioId: string) =>
      `${BASE}/usuarios/${encodeURIComponent(usuarioId)}/resumo`,
  },
} as const;

export default auditoriaRoutes;

