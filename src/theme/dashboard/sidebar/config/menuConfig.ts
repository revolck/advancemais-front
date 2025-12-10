// src/theme/sidebar/config/menuConfig.ts
import { MenuSection } from "../types/sidebar.types";
import { getRoutePermissions } from "@/config/dashboardRoutes";
import { UserRole } from "@/config/roles";

/**
 * Permissões compartilhadas por itens administrativos.
 * Definidas como somente leitura para evitar mutações acidentais.
 */
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
        permissions: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.SETOR_DE_VAGAS],
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR],
        submenu: [
          {
            icon: null,
            label: "Visão geral",
            route: "/dashboard/cursos/visao-geral",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Cursos",
            route: "/dashboard/cursos",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Turmas",
            route: "/dashboard/cursos/turmas",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Alunos",
            route: "/dashboard/cursos/alunos",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Instrutores",
            route: "/dashboard/cursos/instrutores",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Provas",
            route: "/dashboard/cursos/provas",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Certificados",
            route: "/dashboard/cursos/certificados",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Estágios",
            route: "/dashboard/cursos/estagios",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Agenda",
            route: "/dashboard/cursos/agenda",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
        ],
      },
      {
        icon: "Building2",
        label: "Empresas",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR],
        submenu: [
          {
            icon: null,
            label: "Empresas",
            route: "/dashboard/empresas",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Vagas",
            route: "/dashboard/empresas/vagas",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Candidatos",
            route: "/dashboard/empresas/candidatos",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
        ],
      },
      {
        icon: "FileSearch",
        label: "Auditoria",
        permissions: [UserRole.ADMIN],
        submenu: [
          {
            icon: null,
            label: "Logs",
            route: "/admin/audit/logs",
            permissions: [UserRole.ADMIN],
          },
          {
            icon: null,
            label: "Histórico de Usuários",
            route: "/admin/audit/user-history",
            permissions: [UserRole.ADMIN],
          },
          {
            icon: null,
            label: "Scripts",
            route: "/admin/audit/scripts",
            permissions: [UserRole.ADMIN],
          },
          {
            icon: null,
            label: "Assinaturas",
            route: "/admin/audit/subscriptions",
            permissions: [UserRole.ADMIN],
          },
          {
            icon: null,
            label: "Transações",
            route: "/admin/audit/transactions",
            permissions: [UserRole.ADMIN],
          },
        ],
      },
      {
        icon: "Users",
        label: "Usuários",
        route: "/dashboard/usuarios",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR],
      },
      {
        icon: "Wallet",
        label: "Financeiro",
        route: "/dashboard/financeiro",
        permissions: [UserRole.ADMIN, UserRole.FINANCEIRO],
      },
      {
        icon: "Settings",
        label: "Configurações",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR],
        submenu: [
          {
            icon: null,
            label: "Website",
            route: "/admin/website",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
            submenu: [
              {
                icon: null,
                label: "Página Inicial",
                route: "/config/website/pagina-inicial",
                permissions: [UserRole.ADMIN, UserRole.MODERADOR],
              },
              {
                icon: null,
                label: "Sobre",
                route: "/config/website/sobre",
                permissions: [UserRole.ADMIN, UserRole.MODERADOR],
              },
              {
                icon: null,
                label: "Recrutamento",
                route: "/config/website/recrutamento",
                permissions: [UserRole.ADMIN, UserRole.MODERADOR],
              },
              {
                icon: null,
                label: "Treinamento",
                route: "/config/website/treinamento",
                permissions: [UserRole.ADMIN, UserRole.MODERADOR],
              },
              {
                icon: null,
                label: "Geral",
                route: "/config/website/geral",
                permissions: [UserRole.ADMIN, UserRole.MODERADOR],
              },
            ],
          },
          {
            icon: null,
            label: "Empresas",
            route: "/config/empresas",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Cursos",
            route: "/config/cursos",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
          },
          {
            icon: null,
            label: "Candidatos",
            route: "/config/candidatos",
            permissions: [UserRole.ADMIN, UserRole.MODERADOR],
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
        route: "/dashboard",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
        submenu: [
          {
            icon: null,
            label: "Visão geral",
            route: "/dashboard/cursos/visao-geral",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Cursos",
            route: "/dashboard/cursos",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Turmas",
            route: "/dashboard/cursos/turmas",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Alunos",
            route: "/dashboard/cursos/alunos",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Instrutores",
            route: "/dashboard/cursos/instrutores",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Provas",
            route: "/dashboard/cursos/provas",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Certificados",
            route: "/dashboard/cursos/certificados",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Estágios",
            route: "/dashboard/cursos/estagios",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
          {
            icon: null,
            label: "Agenda",
            route: "/dashboard/cursos/agenda",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
        ],
      },
      {
        icon: "Users",
        label: "Usuários",
        route: "/dashboard/usuarios",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
      },
      {
        icon: "Settings",
        label: "Configurações",
        permissions: [UserRole.ADMIN, UserRole.MODERADOR, UserRole.PEDAGOGICO],
        submenu: [
          {
            icon: null,
            label: "Cursos",
            route: "/config/cursos",
            permissions: [
              UserRole.ADMIN,
              UserRole.MODERADOR,
              UserRole.PEDAGOGICO,
            ],
          },
        ],
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "ClipboardList",
        label: "Solicitações",
        route: "/dashboard/empresas/solicitacoes",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Building2",
        label: "Empresas",
        route: "/dashboard/empresas",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas",
        route: "/dashboard/empresas/vagas",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/dashboard/empresas/candidatos",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "UserCheck",
        label: "Entrevistas",
        route: "/setor-de-vagas/interviews",
        permissions: SETOR_DE_VAGAS_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/setor-de-vagas/agenda",
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
  // Seção para EMPRESA
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/dashboard",
        permissions: [UserRole.EMPRESA],
      },
      {
        icon: "Briefcase",
        label: "Vagas",
        route: "/dashboard/empresas/vagas",
        permissions: [UserRole.EMPRESA],
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/dashboard/empresas/candidatos",
        permissions: [UserRole.EMPRESA],
      },
      {
        icon: "CreditCard",
        label: "Assinatura",
        route: "/dashboard/empresas/pagamentos",
        permissions: [UserRole.EMPRESA],
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/empresa/agenda",
        permissions: [UserRole.EMPRESA],
      },
      {
        icon: "UserCheck",
        label: "Entrevistas",
        route: "/empresa/entrevistas",
        permissions: [UserRole.EMPRESA],
      },
    ],
  },
];

export const menuSections: ReadonlyArray<MenuSection> =
  deepFreeze(rawMenuSections);
