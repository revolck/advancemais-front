"use client";

import React from "react";
import { Header } from "./components/Header";

const HeaderWithBackground: React.FC = () => {
  return (
    <div className="pt-[80px] relative bg-[var(--color-blue)] flex flex-col overflow-x-hidden">
      <Header />
    </div>
  );
};

export default HeaderWithBackground;
