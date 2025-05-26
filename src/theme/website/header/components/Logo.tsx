"use client";

import React from "react";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

export const Logo: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center flex-shrink-0">
      <Image
        src="/images/logos/logo_branco.webp"
        alt={`Logo ${isMobile ? "Mobile" : "Desktop"}`}
        width={isMobile ? 120 : 240}
        height={40}
        priority={true}
        quality={100}
        className={isMobile ? "h-3 w-auto" : "h-5 w-auto"}
      />
    </div>
  );
};
