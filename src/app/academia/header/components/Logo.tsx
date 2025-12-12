"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

export const Logo: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Link href="/academia" className="flex items-center flex-shrink-0">
      <Image
        src="/images/logos/logo_branco.webp"
        alt={`Logo Academia Advance+ ${isMobile ? "Mobile" : "Desktop"}`}
        width={isMobile ? 120 : 200}
        height={40}
        quality={100}
        className={isMobile ? "h-3 w-auto" : "h-4 w-auto opacity-90"}
      />
    </Link>
  );
};

