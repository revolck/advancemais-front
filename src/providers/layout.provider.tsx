'use client';
import React from 'react';
import { cn } from '@/lib/utils';

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className={cn('flex min-h-svh w-full flex-col bg-gray-50')}>{children}</div>;
};

export default LayoutProvider;
