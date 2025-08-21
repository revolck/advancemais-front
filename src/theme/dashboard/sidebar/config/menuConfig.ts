// src/theme/sidebar/config/menuConfig.ts
import { MenuSection } from "../types/sidebar.types";
import { UserRole } from "@/config/roles";

/**
 * Permissões compartilhadas por itens administrativos.
 * Definidas como somente leitura para evitar mutações acidentais.
 */
const ADMIN_PERMISSIONS: readonly UserRole[] = Object.freeze([
  UserRole.ADMIN,
  UserRole.MODERADOR,
]);

/** Permissões exclusivas para o administrador */
const ADMIN_ONLY_PERMISSIONS: readonly UserRole[] = Object.freeze([
  UserRole.ADMIN,
]);

/** Permissões exclusivas para o papel pedagógico */
const PEDAGOGICO_PERMISSIONS: readonly UserRole[] = Object.freeze([
  UserRole.PEDAGOGICO,
]);

/**
 * Congela recursivamente um objeto, garantindo sua imutabilidade.
 * Isso evita alterações em tempo de execução que possam comprometer
 * regras de navegação ou permissões.
 */
function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as Record<string, unknown>)[prop];
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj;
}

/**
 * Configuração centralizada do menu do sidebar
 * Facilita a manutenção e extensão futura
 */
const rawMenuSections: MenuSection[] = [
  {
    title: "ADMINISTRAÇÃO",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/admin/overview",
        permissions: ADMIN_PERMISSIONS,
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        permissions: ADMIN_PERMISSIONS,
        submenu: [
          {
            icon: null,
            label: "Visão geral",
            route: "/admin/courses/overview",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Listagem",
            route: "/admin/courses/list",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Matrículas",
            route: "/admin/courses/enrollments",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Instrutores",
            route: "/admin/courses/instructors",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Provas",
            route: "/admin/courses/exams",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Certificados",
            route: "/admin/courses/certificates",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Estágios",
            route: "/admin/courses/internships",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Agenda",
            route: "/admin/courses/schedule",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Configurações",
            route: "/admin/courses/settings",
            permissions: ADMIN_PERMISSIONS,
          },
        ],
      },
      {
        icon: "Building2",
        label: "Empresas",
        permissions: ADMIN_PERMISSIONS,
        submenu: [
          {
            icon: null,
            label: "Visão Geral",
            route: "/admin/companies/overview",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Vagas",
            route: "/admin/companies/jobs",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Candidatos",
            route: "/admin/companies/candidates",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Configurações",
            route: "/admin/companies/settings",
            permissions: ADMIN_PERMISSIONS,
          },
        ],
      },
      {
        icon: "Wallet",
        label: "Financeiro",
        route: "/admin/financeiro",
        permissions: ADMIN_ONLY_PERMISSIONS,
      },
      {
        icon: "FileSearch",
        label: "Auditoria",
        permissions: ADMIN_ONLY_PERMISSIONS,
        submenu: [
          {
            icon: null,
            label: "Logs",
            route: "/admin/audit/logs",
            permissions: ADMIN_ONLY_PERMISSIONS,
          },
          {
            icon: null,
            label: "Histórico de Usuários",
            route: "/admin/audit/user-history",
            permissions: ADMIN_ONLY_PERMISSIONS,
          },
          {
            icon: null,
            label: "Scripts",
            route: "/admin/audit/scripts",
            permissions: ADMIN_ONLY_PERMISSIONS,
          },
          {
            icon: null,
            label: "Assinaturas",
            route: "/admin/audit/subscriptions",
            permissions: ADMIN_ONLY_PERMISSIONS,
          },
          {
            icon: null,
            label: "Transações",
            route: "/admin/audit/transactions",
            permissions: ADMIN_ONLY_PERMISSIONS,
          },
        ],
      },
      {
        icon: "Settings",
        label: "Configurações",
        route: "/admin/settings",
        permissions: ADMIN_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/pedagogico/overview",
        permissions: PEDAGOGICO_PERMISSIONS,
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        permissions: PEDAGOGICO_PERMISSIONS,
        submenu: [
          {
            icon: null,
            label: "Listagem",
            route: "/pedagogico/courses/list",
            permissions: PEDAGOGICO_PERMISSIONS,
          },
          {
            icon: null,
            label: "Matrículas",
            route: "/pedagogico/courses/enrollments",
            permissions: PEDAGOGICO_PERMISSIONS,
          },
          {
            icon: null,
            label: "Provas",
            route: "/pedagogico/courses/exams",
            permissions: PEDAGOGICO_PERMISSIONS,
          },
          {
            icon: null,
            label: "Agenda",
            route: "/pedagogico/courses/schedule",
            permissions: PEDAGOGICO_PERMISSIONS,
          },
        ],
      },
    ],
  },
];

export const menuSections: ReadonlyArray<MenuSection> = deepFreeze(rawMenuSections);

