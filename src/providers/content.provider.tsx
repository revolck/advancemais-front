'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const LayoutContentProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className={cn('flex-1 xl:ms-[228px] bg-gray-50')}>
        <div className={cn('mb-24 md:mb-0 p-5')}>{children}</div>
      </main>
    </>
  );
};

export default LayoutContentProvider;
