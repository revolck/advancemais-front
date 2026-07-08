"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

export const Logo: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Link
      href="/"
      data-popup-target="website-logo"
      aria-label="Ir para a página inicial"
      className="flex flex-shrink-0 items-center"
    >
      <Image
        src="/images/logos/logo_branco.webp"
        alt={`Logo ${isMobile ? "Mobile" : "Desktop"}`}
        width={isMobile ? 120 : 240}
        height={40}
        quality={100}
        className={isMobile ? "h-3 w-auto" : "h-5 w-auto"}
      />
    </Link>
  );
};
