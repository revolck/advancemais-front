import { match } from "path-to-regexp";
import { UserRole } from "./roles";

/** Regra individual de permissão de rota */
interface RouteRule {
  /** Padrão de rota compatível com path-to-regexp */
  pattern: string;
  /** Papeis autorizados */
  roles: readonly UserRole[];
  /** Validação adicional para rotas dinâmicas específicas */
  validatePath?: (path: string) => boolean;
}

/** Lista imutável de regras de acesso do dashboard */
export const DASHBOARD_ROUTE_RULES: readonly RouteRule[] = Object.freeze([
  { pattern: "/admin/financeiro{/*path}", roles: [UserRole.ADMIN] },
  { pattern: "/admin/audit{/*path}", roles: [UserRole.ADMIN] },
  { pattern: "/admin{/*path}", roles: [UserRole.ADMIN, UserRole.MODERADOR] },
  {
    pattern: "/dashboard/admin{/*path}",
    roles: [UserRole.ADMIN, UserRole.MODERADOR],
  },
  {
    pattern: "/dashboard/agenda{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
      UserRole.RECRUTADOR,
      UserRole.ALUNO_CANDIDATO,
    ],
  },
  {
    pattern: "/dashboard/cursos/agenda{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
      UserRole.RECRUTADOR,
      UserRole.ALUNO_CANDIDATO,
    ],
  },
  // Regras específicas do dashboard (devem vir antes da regra genérica)
  {
    pattern: "/dashboard/financeiro{/*path}",
    roles: [UserRole.ADMIN],
  },
  {
    pattern: "/dashboard/auditoria{/*path}",
    roles: [UserRole.ADMIN],
  },
  {
    pattern: "/dashboard/usuarios{/*path}",
    roles: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
  },
  {
    pattern: "/dashboard/cursos/alunos/:id",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
      UserRole.RECRUTADOR,
      UserRole.ALUNO_CANDIDATO,
    ],
    validatePath: (path) =>
      /^\/dashboard\/cursos\/alunos\/[0-9a-fA-F-]{36}(?:\/.*)?$/.test(path),
  },
  {
    pattern: "/dashboard/cursos/alunos{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/empresas/entrevistas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.EMPRESA,
      UserRole.RECRUTADOR,
    ],
  },
  {
    pattern: "/dashboard/cursos/frequencia{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/cursos/turmas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/cursos/aulas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/cursos/atividades-provas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/cursos/notas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.INSTRUTOR,
    ],
  },
  {
    pattern: "/dashboard/cursos{/*path}",
    roles: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
  },
  {
    pattern: "/dashboard/empresas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.SETOR_DE_VAGAS,
      UserRole.EMPRESA,
      UserRole.RECRUTADOR,
    ],
  },
  {
    pattern: "/dashboard/vagas{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
    ],
  },
  {
    pattern: "/dashboard/candidatos{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
      UserRole.RECRUTADOR,
    ],
  },
  // Regra genérica para visão geral do dashboard (deve vir depois das específicas)
  {
    pattern: "/dashboard{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
      UserRole.RECRUTADOR,
      UserRole.INSTRUTOR,
      UserRole.ALUNO_CANDIDATO,
      UserRole.FINANCEIRO,
    ],
  },
  // Regra específica para config/cursos (deve vir antes da regra genérica /config)
  {
    pattern: "/config/cursos{/*path}",
    roles: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
  },
  { pattern: "/config{/*path}", roles: [UserRole.ADMIN, UserRole.MODERADOR] },
  { pattern: "/pedagogico{/*path}", roles: [UserRole.PEDAGOGICO] },
  { pattern: "/empresa{/*path}", roles: [UserRole.EMPRESA] },
  { pattern: "/setor-de-vagas{/*path}", roles: [UserRole.SETOR_DE_VAGAS] },
  { pattern: "/instrutor{/*path}", roles: [UserRole.INSTRUTOR] },
  { pattern: "/aluno{/*path}", roles: [UserRole.ALUNO_CANDIDATO] },
  { pattern: "/recrutador{/*path}", roles: [UserRole.RECRUTADOR] },
  { pattern: "/financeiro{/*path}", roles: [UserRole.FINANCEIRO] },
  // Rota de perfil - acessível para todos os usuários autenticados
  {
    pattern: "/perfil{/*path}",
    roles: [
      UserRole.ADMIN,
      UserRole.MODERADOR,
      UserRole.PEDAGOGICO,
      UserRole.EMPRESA,
      UserRole.SETOR_DE_VAGAS,
      UserRole.RECRUTADOR,
      UserRole.INSTRUTOR,
      UserRole.ALUNO_CANDIDATO,
      UserRole.FINANCEIRO,
    ],
  },
]);

const matchers = DASHBOARD_ROUTE_RULES.map((rule) => {
  const matcher = match(rule.pattern, {
    decode: decodeURIComponent,
    end: false,
  });

  return {
    roles: rule.roles,
    match: (path: string) =>
      Boolean(matcher(path)) &&
      (rule.validatePath ? rule.validatePath(path) : true),
  };
});

/**
 * Retorna os papéis permitidos para uma determinada rota.
 */
export function getRoutePermissions(path: string): readonly UserRole[] {
  const normalized = path.split("?")[0];
  const rule = matchers.find((r) => r.match(normalized));
  return rule?.roles ?? [];
}

/** Verifica se um papel possui acesso à rota informada */
export function canAccessRoute(path: string, role: UserRole): boolean {
  return getRoutePermissions(path).includes(role);
}

/** Lista de módulos de primeiro nível do dashboard */
export const SYSTEM_MODULES = Array.from(
  new Set(DASHBOARD_ROUTE_RULES.map((rule) => rule.pattern.split("/")[1]))
);

/** Mapeamento inverso: módulos permitidos por papel */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = Object.values(
  UserRole
).reduce((acc, role) => {
  acc[role] = SYSTEM_MODULES.filter((module) =>
    canAccessRoute(`/${module}`, role)
  );
  return acc;
}, {} as Record<UserRole, string[]>);
