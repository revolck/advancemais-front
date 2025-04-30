'use client';
import React from 'react';

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh w-full flex-col bg-default-100 dark:bg-backgroundr">
      {children}
    </div>
  );
};

export default LayoutProvider;
