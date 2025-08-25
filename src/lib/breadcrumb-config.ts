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
  
  '/dashboard/admin/website/pagina-inicial': {
    title: 'Configuração Página Inicial',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { label: 'Admin', href: '/dashboard/admin', icon: 'Settings' },
      { label: 'Website', href: '/dashboard/admin/website', icon: 'Globe' },
      { label: 'Página Inicial', icon: 'Layout' }
    ]
  },
};