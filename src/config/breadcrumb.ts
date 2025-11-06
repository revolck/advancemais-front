"use client";

import { usePathname } from "next/navigation";

export type IconName =
  | "Home"
  | "Settings"
  | "Globe"
  | "Layout"
  | "LayoutDashboard"
  | "ChevronRight"
  | "Save"
  | "User"
  | "Users"
  | "FileText"
  | "Image"
  | "Folder"
  | "Search"
  | "Plus"
  | "Edit"
  | "Trash2"
  | "Eye"
  | "Download"
  | "Upload"
  | "Calendar"
  | "Clock"
  | "Mail"
  | "Phone"
  | "MapPin"
  | "Star"
  | "Heart"
  | "Share"
  | "Filter"
  | "SortAsc"
  | "SortDesc"
  | "MoreHorizontal"
  | "MoreVertical"
  | "X"
  | "Check"
  | "AlertCircle"
  | "Info"
  | "HelpCircle"
  | "Briefcase"
  | "BookOpen"
  | "Building2"
  | "ExternalLink"
  | "Tag";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbConfig {
  items: BreadcrumbItem[];
  title: string;
}

// Centralized breadcrumb configuration
const EMPRESAS_BREADCRUMB: BreadcrumbConfig = {
  title: "Empresas",
  items: [
    { label: "Dashboard", href: "/", icon: "Home" },
    { label: "Empresas", href: "/empresas", icon: "Building2" },
  ],
};

export const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  "/": {
    title: "Dashboard",
    items: [{ label: "Dashboard", href: "/", icon: "Home" }],
  },

  "/dashboard/admin": {
    title: "Administração",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Admin", href: "/dashboard/admin", icon: "Settings" },
    ],
  },

  "/dashboard/admin/website": {
    title: "Gerenciar Website",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Admin", href: "/dashboard/admin", icon: "Settings" },
      { label: "Website", href: "/dashboard/admin/website", icon: "Globe" },
    ],
  },

  "/dashboard/admin/companies/list": EMPRESAS_BREADCRUMB,
  "/empresas": EMPRESAS_BREADCRUMB,
  // Rotas antigas removidas (/empresas/admin) – manter compatibilidade de breadcrumb
  "/dashboard/empresas/admin/list": EMPRESAS_BREADCRUMB,
  "/dashboard/empresas/admin/listagem": EMPRESAS_BREADCRUMB,
  // Novas rotas consolidadas
  "/dashboard/empresas/list": EMPRESAS_BREADCRUMB,
  "/dashboard/empresas/listagem": EMPRESAS_BREADCRUMB,

  "/config/website/pagina-inicial": {
    title: "Configuração Página Inicial",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Website", href: "/config/website", icon: "Globe" },
      { label: "Página Inicial", icon: "Layout" },
    ],
  },
  "/config/website/geral": {
    title: "Configurações Gerais",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Website", href: "/config/website", icon: "Globe" },
      { label: "Geral", icon: "Settings" },
    ],
  },
  "/config/website/sobre": {
    title: "Configuração Sobre",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Website", href: "/config/website", icon: "Globe" },
      { label: "Sobre", icon: "Info" },
    ],
  },
  "/config/website/recrutamento": {
    title: "Configuração Recrutamento",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Website", href: "/config/website", icon: "Globe" },
      { label: "Recrutamento", icon: "Briefcase" },
    ],
  },
  "/config/website/treinamento": {
    title: "Configuração Treinamento",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Website", href: "/config/website", icon: "Globe" },
      { label: "Treinamento", icon: "BookOpen" },
    ],
  },
  "/config/dashboard/geral": {
    title: "Configuração Dashboard",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      {
        label: "Dashboard",
        href: "/config/dashboard",
        icon: "LayoutDashboard",
      },
      { label: "Geral", icon: "Settings" },
    ],
  },
  "/config/dashboard/cursos": {
    title: "Configuração Cursos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      {
        label: "Dashboard",
        href: "/config/dashboard",
        icon: "LayoutDashboard",
      },
      { label: "Cursos", icon: "BookOpen" },
    ],
  },
  "/config/empresas": {
    title: "Configuração Empresas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Empresas", icon: "Building2" },
    ],
  },
  "/config/empresas/cupons": {
    title: "Cupons de Desconto",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Empresas", href: "/config/empresas", icon: "Building2" },
      { label: "Cupons", icon: "Tag" },
    ],
  },
  "/dashboard/candidatos": {
    title: "Candidatos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Candidatos", icon: "Users" },
    ],
  },
  "/dashboard/cursos": {
    title: "Cursos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
    ],
  },
  "/dashboard/cursos/visao-geral": {
    title: "Visão Geral de Cursos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Visão Geral de Cursos", icon: "LayoutDashboard" },
    ],
  },
  "/dashboard/cursos/turmas": {
    title: "Turmas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Turmas", icon: "Users" },
    ],
  },
  "/dashboard/cursos/turmas/cadastrar": {
    title: "Cadastrar Turma",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Turmas", href: "/dashboard/cursos/turmas", icon: "Users" },
      { label: "Cadastrar" },
    ],
  },
  // Detalhes de turma: /dashboard/cursos/turmas/[turmaId]
  "/dashboard/cursos/turmas/[turmaId]": {
    title: "Detalhes da Turma",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Turmas", href: "/dashboard/cursos/turmas", icon: "Users" },
      { label: "Detalhes", icon: "Eye" },
    ],
  },
  "/dashboard/cursos/alunos": {
    title: "Alunos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Alunos", icon: "Users" },
    ],
  },
  "/dashboard/cursos/instrutores": {
    title: "Instrutores",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Instrutores" },
    ],
  },
  "/dashboard/cursos/provas": {
    title: "Provas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Provas" },
    ],
  },
  "/dashboard/cursos/certificados": {
    title: "Certificados",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Certificados" },
    ],
  },
  "/dashboard/cursos/estagios": {
    title: "Estágios",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Estágios" },
    ],
  },
  "/dashboard/cursos/agenda": {
    title: "Agenda",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Agenda" },
    ],
  },
  "/dashboard/cursos/cadastrar": {
    title: "Novo Curso",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Cadastrar", icon: "FileText" },
    ],
  },
  "/config/candidatos": {
    title: "Configuração Candidatos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Candidatos", icon: "Users" },
    ],
  },
  "/config/candidatos/status-processos": {
    title: "Status de Processos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Configurações", href: "/config", icon: "Settings" },
      { label: "Candidatos", href: "/config/candidatos", icon: "Users" },
      { label: "Status de Processos", icon: "Settings" },
    ],
  },
  "/dashboard/usuarios": {
    title: "Usuários",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Usuários", icon: "Users" },
    ],
  },
};

// Hook centralizado que consome a configuração acima
export function useBreadcrumb(): BreadcrumbConfig {
  const pathname = usePathname() || "/";

  // Busca a configuração exata da rota
  const config = breadcrumbConfig[pathname];

  if (config) {
    return config;
  }

  // Regras dinâmicas específicas
  // Detalhes de empresa: /empresas/[id]
  if (pathname.startsWith("/empresas/")) {
    return {
      title: "Empresa",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Empresas", href: "/empresas", icon: "Building2" },
        { label: "Visualizando empresa", icon: "Eye" },
      ],
    };
  }

  // Detalhes de turma: /dashboard/cursos/turmas/[turmaId] (nova rota)
  if (pathname.match(/^\/dashboard\/cursos\/turmas\/[^/]+$/)) {
    return {
      title: "Detalhes da Turma",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Turmas", href: "/dashboard/cursos/turmas", icon: "Users" },
        { label: "Detalhes", icon: "Eye" },
      ],
    };
  }

  // Rota antiga de turma (mantida para compatibilidade): /dashboard/cursos/[id]/turmas/[turmaId]
  if (pathname.match(/^\/dashboard\/cursos\/\d+\/turmas\/[^/]+$/)) {
    return {
      title: "Detalhes da Turma",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Turma", icon: "Users" },
      ],
    };
  }

  // Detalhes de curso: /dashboard/cursos/[id]
  if (pathname.match(/^\/dashboard\/cursos\/\d+$/)) {
    return {
      title: "Detalhes do Curso",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Detalhes", icon: "Eye" },
      ],
    };
  }

  // Fallback: tenta encontrar a rota mais próxima
  const pathSegments = pathname.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = pathSegments.length; i > 0; i--) {
    currentPath = "/" + pathSegments.slice(0, i).join("/");
    if (breadcrumbConfig[currentPath]) {
      return breadcrumbConfig[currentPath];
    }
  }

  // Fallback padrão
  return {
    title: "Dashboard",
    items: [{ label: "Dashboard", href: "/" }],
  };
}
