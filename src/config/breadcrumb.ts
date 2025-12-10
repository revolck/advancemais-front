"use client";

import { usePathname } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/config/roles";

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
  | "Tag"
  | "GraduationCap"
  | "CreditCard";

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
  "/dashboard/empresas": {
    title: "Empresas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Empresas", icon: "Building2" },
    ],
  },
  "/dashboard/empresas/vagas": {
    title: "Vagas",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
      { label: "Vagas", icon: "Briefcase" },
    ],
  },
  "/dashboard/empresas/vagas/cadastrar": {
    title: "Cadastrar Vaga",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
      { label: "Vagas", href: "/dashboard/empresas/vagas", icon: "Briefcase" },
      { label: "Cadastrar", icon: "FileText" },
    ],
  },
  "/dashboard/empresas/candidatos": {
    title: "Candidatos",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
      { label: "Candidatos", icon: "Users" },
    ],
  },
  "/dashboard/empresas/pagamentos": {
    title: "Assinatura",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
      { label: "Assinatura", icon: "CreditCard" },
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
      { label: "Cadastrar", icon: "FileText" },
    ],
  },
  // Detalhes de turma: /dashboard/cursos/turmas/[turmaId]
  // Nota: Esta configuração estática não funciona para rotas dinâmicas
  // O breadcrumb é resolvido dinamicamente pelo regex abaixo
  "/dashboard/cursos/turmas/[turmaId]": {
    title: "Detalhes da Turma",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
      { label: "Turmas", href: "/dashboard/cursos/turmas", icon: "Users" },
      { label: "Detalhes da Turma", icon: "Eye" },
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
      { label: "Instrutores", icon: "GraduationCap" },
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
      { label: "Agenda", icon: "Calendar" },
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
  "/dashboard/financeiro": {
    title: "Financeiro",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Financeiro", icon: "Briefcase" },
    ],
  },
  "/dashboard/notificacoes": {
    title: "Notificações",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Notificações" },
    ],
  },
  "/dashboard/usuarios/cadastrar": {
    title: "Cadastrar Usuário",
    items: [
      { label: "Dashboard", href: "/", icon: "Home" },
      { label: "Usuários", href: "/dashboard/usuarios", icon: "Users" },
      { label: "Cadastrar", icon: "FileText" },
    ],
  },
};

// Hook para filtrar "Empresas" do breadcrumb para role EMPRESA
function filterBreadcrumbForEmpresa(
  config: BreadcrumbConfig,
  isEmpresaRole: boolean
): BreadcrumbConfig {
  if (!isEmpresaRole) return config;

  // Remove o item "Empresas" do breadcrumb para role EMPRESA
  const filteredItems = config.items.filter(
    (item) => item.label !== "Empresas"
  );

  return {
    ...config,
    items: filteredItems,
  };
}

// Hook centralizado que consome a configuração acima
export function useBreadcrumb(): BreadcrumbConfig {
  const pathname = usePathname() || "/";
  const role = useUserRole();
  const isEmpresaRole = role === UserRole.EMPRESA;

  // Remove query strings e hash do pathname para garantir correspondência exata
  const cleanPathname = pathname.split("?")[0].split("#")[0];

  // Busca a configuração exata da rota
  const config = breadcrumbConfig[cleanPathname];

  if (config) {
    return filterBreadcrumbForEmpresa(config, isEmpresaRole);
  }

  // Regras dinâmicas específicas
  // Detalhes de candidato: /dashboard/empresas/candidatos/[id]
  if (cleanPathname.match(/^\/dashboard\/empresas\/candidatos\/[^/]+$/)) {
    return filterBreadcrumbForEmpresa({
      title: "Detalhes do Candidato",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
        { label: "Candidatos", href: "/dashboard/empresas/candidatos", icon: "Users" },
        { label: "Detalhes do Candidato", icon: "Eye" },
      ],
    }, isEmpresaRole);
  }

  // Detalhes de vaga: /dashboard/empresas/vagas/[id]
  if (cleanPathname.match(/^\/dashboard\/empresas\/vagas\/[^/]+$/)) {
    return filterBreadcrumbForEmpresa({
      title: "Detalhes da Vaga",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
        { label: "Vagas", href: "/dashboard/empresas/vagas", icon: "Briefcase" },
        { label: "Detalhes da Vaga", icon: "Eye" },
      ],
    }, isEmpresaRole);
  }

  // Detalhes de empresa: /dashboard/empresas/[id] (deve vir após verificações de candidatos/vagas)
  if (cleanPathname.match(/^\/dashboard\/empresas\/[^/]+$/)) {
    return filterBreadcrumbForEmpresa({
      title: "Detalhes da Empresa",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
        { label: "Detalhes da Empresa", icon: "Eye" },
      ],
    }, isEmpresaRole);
  }

  // Detalhes de empresa (rota antiga): /empresas/[id]
  if (cleanPathname.startsWith("/empresas/") && !cleanPathname.startsWith("/dashboard/empresas/")) {
    return filterBreadcrumbForEmpresa({
      title: "Empresa",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Empresas", href: "/dashboard/empresas", icon: "Building2" },
        { label: "Visualizando empresa", icon: "Eye" },
      ],
    }, isEmpresaRole);
  }

  // Detalhes de usuário: /dashboard/usuarios/[id]
  if (cleanPathname.match(/^\/dashboard\/usuarios\/[^/]+$/)) {
    return {
      title: "Detalhes do Usuário",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Usuários", href: "/dashboard/usuarios", icon: "Users" },
        { label: "Detalhes do Usuário", icon: "Eye" },
      ],
    };
  }

  // Detalhes de aluno: /dashboard/cursos/alunos/[id] (deve vir antes da verificação de curso)
  if (cleanPathname.match(/^\/dashboard\/cursos\/alunos\/[^/]+$/)) {
    return {
      title: "Detalhes do Aluno",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Alunos", href: "/dashboard/cursos/alunos", icon: "Users" },
        { label: "Detalhes do Aluno", icon: "Eye" },
      ],
    };
  }

  // Detalhes de instrutor: /dashboard/cursos/instrutores/[id]
  if (cleanPathname.match(/^\/dashboard\/cursos\/instrutores\/[^/]+$/)) {
    return {
      title: "Detalhes do Instrutor",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Instrutores", href: "/dashboard/cursos/instrutores", icon: "GraduationCap" },
        { label: "Detalhes do Instrutor", icon: "Eye" },
      ],
    };
  }

  // Detalhes de turma: /dashboard/cursos/turmas/[turmaId] (nova rota)
  if (cleanPathname.match(/^\/dashboard\/cursos\/turmas\/[^/]+$/)) {
    return {
      title: "Detalhes da Turma",
      items: [
        { label: "Dashboard", href: "/", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Turmas", href: "/dashboard/cursos/turmas", icon: "Users" },
        { label: "Detalhes da Turma", icon: "Eye" },
      ],
    };
  }

  // Rota antiga de turma (mantida para compatibilidade): /dashboard/cursos/[id]/turmas/[turmaId]
  if (cleanPathname.match(/^\/dashboard\/cursos\/\d+\/turmas\/[^/]+$/)) {
    return {
      title: "Detalhes da Turma",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Turma", icon: "Users" },
      ],
    };
  }

  // Edição de curso: /dashboard/cursos/[id]/editar (deve vir antes dos detalhes do curso)
  if (cleanPathname.match(/^\/dashboard\/cursos\/[^/]+\/editar$/)) {
    return {
      title: "Editar Curso",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Editar Curso", icon: "Edit" },
      ],
    };
  }

  // Detalhes de curso: /dashboard/cursos/[id] (aceita números ou UUIDs)
  // Deve vir por último para não capturar rotas de alunos/turmas
  if (cleanPathname.match(/^\/dashboard\/cursos\/[^/]+$/)) {
    return {
      title: "Detalhes do Curso",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "Home" },
        { label: "Cursos", href: "/dashboard/cursos", icon: "BookOpen" },
        { label: "Detalhes do Curso", icon: "Eye" },
      ],
    };
  }

  // Fallback: tenta encontrar a rota mais próxima
  const pathSegments = cleanPathname.split("/").filter(Boolean);
  let currentPath = "";

  for (let i = pathSegments.length; i > 0; i--) {
    currentPath = "/" + pathSegments.slice(0, i).join("/");
    if (breadcrumbConfig[currentPath]) {
      return filterBreadcrumbForEmpresa(breadcrumbConfig[currentPath], isEmpresaRole);
    }
  }

  // Fallback padrão
  return {
    title: "Dashboard",
    items: [{ label: "Dashboard", href: "/" }],
  };
}
