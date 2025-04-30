'use client';
import React from 'react';
import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

const HeaderContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="top-0 z-50 sticky">
      {/* <div
        className={cn(
          'flex-none    bg-header backdrop-blur-lg md:px-6 px-[15px] py-3    xl:ms-[248px]  flex items-center justify-between relative',
          headerTheme,
          {
            'xl:ms-[72px]': config.collapsed,
            'border-b': config.skin === 'bordered' && config.layout !== 'semi-box',
            border: config.skin === 'bordered' && config.layout === 'semi-box',
            'shadow-base': config.skin === 'default',
            'xl:ms-0': config.menuHidden || config.layout === 'horizontal',
            'top-6 rounded-md': config.layout === 'semi-box',
            'xl:ms-28': config.sidebar === 'compact' && config.layout !== 'horizontal',
            'rounded-md': config.navbar === 'floating',
          }
        )}
      >
        {children}
      </div> */}
      <div className="flex-none bg-header backdrop-blur-lg md:px-6 px-[15px] py-3 xl:ms-[248px] flex items-center justify-between relative theme-light shadow-base">
        {children}
      </div>
    </header>
  );
};

export default HeaderContent;
