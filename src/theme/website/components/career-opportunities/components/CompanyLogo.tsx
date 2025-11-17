"use client";

import Image from "next/image";
import React from "react";

interface CompanyLogoProps {
  src?: string | null;
  alt: string;
  size?: number;
}

export function CompanyLogo({ src, alt, size = 56 }: CompanyLogoProps) {
  const [hasError, setHasError] = React.useState(false);

  const effectiveSrc = !src || hasError ? "/images/company-placeholder.svg" : src;

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      width={size}
      height={size}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

