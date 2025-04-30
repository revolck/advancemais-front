'use client';

import React from 'react';

const HeaderContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="top-0 z-50 sticky">
      <div className="flex-none bg-header backdrop-blur-lg md:px-6 px-[15px] py-3 xl:ms-[248px] flex items-center justify-between relative theme-light shadow-base">
        {children}
      </div>
    </header>
  );
};

export default HeaderContent;
