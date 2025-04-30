'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  // Simple sidebar wrapper with no dynamic config
  return (
    <aside className={cn('fixed z-50 w-[248px] bg-sidebar shadow-base xl:block hidden')}>
      <div className="relative flex flex-col h-full">{children}</div>
    </aside>
  );
};

export default SidebarContent;
