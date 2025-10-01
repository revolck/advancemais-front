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
  "/dashboard/empresas/admin/list": EMPRESAS_BREADCRUMB,
  "/dashboard/empresas/admin/listagem": EMPRESAS_BREADCRUMB,

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

  "/dashboard/vagas": {
    title: "Vagas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Vagas", href: "/dashboard/vagas", icon: "Briefcase" },
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
        { label: "Visualizando empresa" },
      ],
    };
  }

  // Detalhes de vaga: /dashboard/vagas/[id]
  if (
    pathname.startsWith("/dashboard/vagas/") &&
    pathname !== "/dashboard/vagas"
  ) {
    return {
      title: "Detalhes da Vaga",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Vagas", href: "/dashboard/vagas", icon: "Briefcase" },
        { label: "Visualizando vaga" },
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
