"use client";

import React from "react";
import Image from "next/image";

export const FooterLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <Image
        src="/images/logos/logo_branco.webp"
        alt="Advance+ Logo"
        width={170}
        height={100}
        className="mb-4"
        priority={false}
        quality={90}
      />
    </div>
  );
};
