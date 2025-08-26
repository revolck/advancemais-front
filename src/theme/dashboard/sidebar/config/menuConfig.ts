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
const EMPRESA_PERMISSIONS = getRoutePermissions("/empresa");
const RECRUTADOR_PERMISSIONS = getRoutePermissions("/recrutador");
const PROFESSOR_PERMISSIONS = getRoutePermissions("/professor");
const ALUNO_PERMISSIONS = getRoutePermissions("/aluno");
const PSICOLOGO_PERMISSIONS = getRoutePermissions("/psicologo");
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
            label: "Alunos",
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
        permissions: ADMIN_PERMISSIONS,
        submenu: [
          {
            icon: "Globe",
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
            icon: "LayoutDashboard",
            label: "Dashboard",
            permissions: ADMIN_PERMISSIONS,
            submenu: [
              {
                icon: null,
                label: "Planos empresarial",
                route: "/admin/dashboard/enterprise-plans",
                permissions: ADMIN_PERMISSIONS,
              },
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
        label: "Visão geral",
        route: "/empresa/overview",
        permissions: EMPRESA_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Gerenciar Vagas",
        route: "/empresa/jobs",
        permissions: EMPRESA_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/empresa/candidates",
        permissions: EMPRESA_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/empresa/agenda",
        permissions: EMPRESA_PERMISSIONS,
      },
      {
        icon: "UserCheck",
        label: "Entrevistas",
        route: "/empresa/interviews",
        permissions: EMPRESA_PERMISSIONS,
      },
      {
        icon: "Settings",
        label: "Configurações",
        route: "/empresa/settings",
        permissions: EMPRESA_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão Geral",
        route: "/recrutador/overview",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas Pendentes",
        route: "/recrutador/jobs",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/recrutador/candidates",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Calendar",
        label: "Agenda",
        route: "/recrutador/agenda",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "UserCheck",
        label: "Entrevistas",
        route: "/recrutador/interviews",
        permissions: RECRUTADOR_PERMISSIONS,
      },
      {
        icon: "Settings",
        label: "Configurações",
        route: "/recrutador/settings",
        permissions: RECRUTADOR_PERMISSIONS,
      },
    ],
  },
  {
    title: "DASHBOARD",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Visão geral",
        route: "/professor/overview",
        permissions: PROFESSOR_PERMISSIONS,
      },
      {
        icon: "GraduationCap",
        label: "Alunos",
        route: "/professor/students",
        permissions: PROFESSOR_PERMISSIONS,
      },
      {
        icon: "ClipboardList",
        label: "Provas",
        route: "/professor/exams",
        permissions: PROFESSOR_PERMISSIONS,
      },
      {
        icon: "ClipboardCheck",
        label: "Notas",
        route: "/professor/grades",
        permissions: PROFESSOR_PERMISSIONS,
      },
      {
        icon: "BookOpen",
        label: "Cursos",
        route: "/professor/courses",
        permissions: PROFESSOR_PERMISSIONS,
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
        route: "/psicologo/overview",
        permissions: PSICOLOGO_PERMISSIONS,
      },
      {
        icon: "Users",
        label: "Candidatos",
        route: "/psicologo/candidates",
        permissions: PSICOLOGO_PERMISSIONS,
      },
      {
        icon: "Briefcase",
        label: "Vagas",
        route: "/psicologo/jobs",
        permissions: PSICOLOGO_PERMISSIONS,
      },
      {
        icon: "BarChart2",
        label: "Relatórios",
        route: "/psicologo/reports",
        permissions: PSICOLOGO_PERMISSIONS,
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

export const menuSections: ReadonlyArray<MenuSection> = deepFreeze(rawMenuSections);

