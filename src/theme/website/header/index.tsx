"use client";

import React from "react";
import { Header } from "./components/Header";

const HeaderWithBackground: React.FC = () => {
  return (
    <div className="pt-[80px] relative bg-[#00257D] text-gray-300 flex flex-col overflow-x-hidden">
      <Header />
    </div>
  );
};

export default HeaderWithBackground;
