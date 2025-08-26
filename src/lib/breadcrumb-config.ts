import type { BreadcrumbConfig } from '@/config/breadcrumb';

export const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  '/dashboard': {
    title: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' }
    ]
  },
  
  '/dashboard/admin': {
    title: 'Administração',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Admin', href: '/dashboard/admin', icon: 'Settings' }
    ]
  },
  
  '/dashboard/admin/website': {
    title: 'Gerenciar Website',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Admin', href: '/dashboard/admin', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/admin/website', icon: 'Globe' }
    ]
  },
  
  '/config/website/pagina-inicial': {
    title: 'Configuração Página Inicial',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Configurações', href: '/dashboard/config', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/config/website', icon: 'Globe' },
      { label: 'Página Inicial', icon: 'Layout' }
    ]
  },
  '/config/website/geral': {
    title: 'Configurações Gerais',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Configurações', href: '/dashboard/config', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/config/website', icon: 'Globe' },
      { label: 'Geral', icon: 'Settings' }
    ]
  },
  '/config/website/sobre': {
    title: 'Configuração Sobre',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Configurações', href: '/dashboard/config', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/config/website', icon: 'Globe' },
      { label: 'Sobre', icon: 'Info' }
    ]
  },
  '/config/website/recrutamento': {
    title: 'Configuração Recrutamento',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Configurações', href: '/dashboard/config', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/config/website', icon: 'Globe' },
      { label: 'Recrutamento', icon: 'Briefcase' }
    ]
  },
  '/config/website/treinamento': {
    title: 'Configuração Treinamento',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Configurações', href: '/dashboard/config', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/config/website', icon: 'Globe' },
      { label: 'Treinamento', icon: 'BookOpen' }
    ]
  },
};