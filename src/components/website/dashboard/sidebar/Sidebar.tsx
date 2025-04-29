'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NavItem } from '@/configs/dashboard';

interface SidebarProps {
  items: NavItem[];
  className?: string;
}

export default function Sidebar({ items, className }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  // Inicializa os grupos abertos com base na rota atual
  useEffect(() => {
    const newOpenGroups: { [key: string]: boolean } = {};

    items.forEach(item => {
      if ('children' in item) {
        // Verifica se algum item filho está na rota atual
        const isActiveGroup = item.children.some(
          child => pathname === child.href || pathname.startsWith(`${child.href}/`)
        );

        newOpenGroups[item.title] = isActiveGroup;
      }
    });

    setOpenGroups(newOpenGroups);
  }, [pathname, items]);

  // Alterna a abertura/fechamento de um grupo
  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Renderização dos itens
  const renderItems = () => {
    return items.map((item, index) => {
      // Item com filhos (grupo)
      if ('children' in item) {
        const isOpen = openGroups[item.title] || false;
        const hasActiveChild = item.children.some(
          child => pathname === child.href || pathname.startsWith(`${child.href}/`)
        );

        return (
          <div key={index} className="space-y-1">
            <button
              onClick={() => toggleGroup(item.title)}
              className={cn(
                'flex items-center justify-between w-full rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                hasActiveChild ? 'font-medium text-foreground' : 'text-muted-foreground',
                item.disabled && 'pointer-events-none opacity-60'
              )}
              disabled={item.disabled}
            >
              <div className="flex items-center gap-2">
                {item.icon && renderIcon(item.icon)}
                <span>{item.title}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isOpen && (
              <div className="grid grid-flow-row auto-rows-max gap-1 pl-6">
                {item.children
                  .filter(child => typeof child.href === 'string' && child.href)
                  .map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      href={child.href as string}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
                        pathname === child.href || pathname.startsWith(`${child.href}/`)
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground',
                        child.disabled && 'pointer-events-none opacity-60'
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        );
      }

      // Item simples (sem filhos)
      return (
        <Link
          key={index}
          href={item.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground',
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? 'font-medium text-foreground'
              : 'text-muted-foreground',
            item.disabled && 'pointer-events-none opacity-60'
          )}
          aria-disabled={item.disabled}
        >
          {item.icon && renderIcon(item.icon)}
          <span>{item.title}</span>
          {item.label && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {item.label}
            </span>
          )}
        </Link>
      );
    });
  };

  // Renderiza o ícone com base na string fornecida
  const renderIcon = (iconName: string) => {
    // Simplificação - apenas alguns ícones mais comuns
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        {iconName === 'LayoutDashboard' && (
          <>
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </>
        )}
        {iconName === 'BarChart' && (
          <>
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </>
        )}
        {iconName === 'Users' && (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        )}
        {iconName === 'ShoppingCart' && (
          <>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </>
        )}
        {iconName === 'DollarSign' && (
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>
        )}
        {iconName === 'Megaphone' && (
          <>
            <path d="M3 11l18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </>
        )}
        {iconName === 'Settings' && (
          <>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    );
  };

  return <div className={cn('flex flex-col gap-4', className)}>{renderItems()}</div>;
}
