'use client';

import { useBreadcrumb } from '@/config/breadcrumb';
import { DashboardBreadcrumb } from './dashboard-breadcrumb';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  showBreadcrumb?: boolean; // permite ocultar o breadcrumb
}

export function DashboardHeader({ 
  title: customTitle, 
  className,
  children,
  showBreadcrumb = true,
}: DashboardHeaderProps) {
  const { title, items } = useBreadcrumb();
  const displayTitle = customTitle || title;
  
  return (
    <header className={cn(
      'flex items-center justify-between pb-6',
      className
    )}>
      {/* Lado esquerdo - Título */}
      <div className="flex items-center">
        <h1 className="!text-2xl font-semibold text-gray-800 tracking-tight">
          {displayTitle}
        </h1>
      </div>
      
      {/* Lado direito - Breadcrumb e conteúdo customizável */}
      <div className="flex items-center gap-6">
        {/* Breadcrumb */}
        {showBreadcrumb && <DashboardBreadcrumb items={items} />}
        
        {/* Conteúdo customizável */}
        {children && (
          <>
            <div className="h-6 w-px" />
            <div className="flex items-center gap-4">
              {children}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
