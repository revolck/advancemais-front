// src/theme/sidebar/config/menuConfig.ts
import { MenuSection } from "../types/sidebar.types";
import { getRoutePermissions } from "@/config/dashboardRoutes";

/**
 * Permissões compartilhadas por itens administrativos.
 * Definidas como somente leitura para evitar mutações acidentais.
 */
const ADMIN_PERMISSIONS = getRoutePermissions("/admin");
const ADMIN_ONLY_PERMISSIONS = getRoutePermissions("/admin/financeiro");
const PEDAGOGICO_PERMISSIONS = getRoutePermissions("/pedagogico");
const EMPRESA_PERMISSIONS = (() => {
  const dashboardPermissions = getRoutePermissions("/dashboard/empresa");
  return dashboardPermissions.length > 0
    ? dashboardPermissions
    : getRoutePermissions("/empresa");
})();
const SETOR_DE_VAGAS_PERMISSIONS = getRoutePermissions("/setor-de-vagas");
const INSTRUTOR_PERMISSIONS = getRoutePermissions("/instrutor");
const ALUNO_PERMISSIONS = getRoutePermissions("/aluno");
const RECRUTADOR_PERMISSIONS = getRoutePermissions("/recrutador");
const FINANCEIRO_PERMISSIONS = getRoutePermissions("/financeiro");

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
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/dashboard",
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
            route: "/dashboard/cursos/visao-geral",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Cursos",
            route: "/dashboard/cursos",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Turmas",
            route: "/dashboard/cursos/turmas",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Alunos",
            route: "/dashboard/cursos/alunos",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Instrutores",
            route: "/dashboard/cursos/instrutores",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Provas",
            route: "/dashboard/cursos/provas",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Certificados",
            route: "/dashboard/cursos/certificados",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Estágios",
            route: "/dashboard/cursos/estagios",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Agenda",
            route: "/dashboard/cursos/agenda",
            permissions: ADMIN_PERMISSIONS,
          },
        ],
      },
      {
        icon: "Users",
        label: "Usuários",
        route: "/dashboard/usuarios",
        permissions: ADMIN_ONLY_PERMISSIONS,
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
            label: "Empresas",
            route: "/empresas",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Vagas",
            route: "/dashboard/vagas",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Candidatos",
            route: "/dashboard/candidatos",
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
        permissions: ADMIN_PERMISSIONS,
        submenu: [
          {
            icon: null,
            label: "Website",
            route: "/admin/website",
            permissions: ADMIN_PERMISSIONS,
            submenu: [
              {
                icon: null,
                label: "Página Inicial",
                route: "/config/website/pagina-inicial",
                permissions: ADMIN_PERMISSIONS,
              },
              {
                icon: null,
                label: "Sobre",
                route: "/config/website/sobre",
                permissions: ADMIN_PERMISSIONS,
              },
              {
                icon: null,
                label: "Recrutamento",
                route: "/config/website/recrutamento",
                permissions: ADMIN_PERMISSIONS,
              },
              {
                icon: null,
                label: "Treinamento",
                route: "/config/website/treinamento",
                permissions: ADMIN_PERMISSIONS,
              },
              {
                icon: null,
                label: "Geral",
                route: "/config/website/geral",
                permissions: ADMIN_PERMISSIONS,
              },
            ],
          },
          {
            icon: null,
            label: "Empresas",
            route: "/config/empresas",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Cursos",
            route: "/config/cursos",
            permissions: ADMIN_PERMISSIONS,
          },
          {
            icon: null,
            label: "Candidatos",
            route: "/config/candidatos",
            permissions: ADMIN_PERMISSIONS,
          },
        ],
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
            label: "Alunos",
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
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão Geral",
        route: "/setor-de-vagas/overview",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas Pendentes",
        route: "/setor-de-vagas/jobs",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/setor-de-vagas/candidates",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/setor-de-vagas/agenda",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "UserCheck",
        label: "Entrevistas",
        route: "/setor-de-vagas/interviews",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Settings",
        label: "Configurações",
        route: "/setor-de-vagas/settings",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/instrutor/overview",
        permissions: INSTRUTOR_PERMISSIONS,
      },
      {
        icon: "GraduationCap",
        label: "Alunos",
        route: "/instrutor/students",
        permissions: INSTRUTOR_PERMISSIONS,
      },
      {
        icon: "ClipboardList",
        label: "Provas",
        route: "/instrutor/exams",
        permissions: INSTRUTOR_PERMISSIONS,
      },
      {
        icon: "ClipboardCheck",
        label: "Notas",
        route: "/instrutor/grades",
        permissions: INSTRUTOR_PERMISSIONS,
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        route: "/instrutor/courses",
        permissions: INSTRUTOR_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/aluno/overview",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        route: "/aluno/courses",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "ClipboardCheck",
        label: "Notas",
        route: "/aluno/grades",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "CalendarCheck",
        label: "Frequência",
        route: "/aluno/attendance",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/aluno/agenda",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas de empregos",
        route: "/aluno/jobs",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "FileText",
        label: "Currículo",
        route: "/aluno/resume",
        permissions: ALUNO_PERMISSIONS,
      },
      {
        icon: "Award",
        label: "Certificados",
        route: "/aluno/certificates",
        permissions: ALUNO_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/recrutador/overview",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/recrutador/candidates",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas",
        route: "/recrutador/jobs",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "BarChart2",
        label: "Relatórios",
        route: "/recrutador/reports",
        permissions: RECRUTADOR_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "Wallet",
        label: "Financeiro",
        route: "/financeiro/overview",
        permissions: FINANCEIRO_PERMISSIONS,
      },
    ],
  },
];

export const menuSections: ReadonlyArray<MenuSection> =
  deepFreeze(rawMenuSections);
