import { usePathname } from 'next/navigation';
import { breadcrumbConfig } from '@/lib/breadcrumb-config';
import type { BreadcrumbConfig } from '@/config/breadcrumb';

export function useBreadcrumb(): BreadcrumbConfig {
  const pathname = usePathname() || "/";
  
  // Busca a configuração exata da rota
  const config = breadcrumbConfig[pathname];
  
  if (config) {
    return config;
  }
  
  // Fallback: tenta encontrar a rota mais próxima
  const pathSegments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  for (let i = pathSegments.length; i > 0; i--) {
    currentPath = '/' + pathSegments.slice(0, i).join('/');
    if (breadcrumbConfig[currentPath]) {
      return breadcrumbConfig[currentPath];
    }
  }
  
  // Fallback padrão
  return {
    title: 'Dashboard',
    items: [{ label: 'Dashboard', href: '/dashboard' }]
  };
}