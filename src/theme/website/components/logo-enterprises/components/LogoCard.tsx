"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { LogoCardProps } from "../types";

export const LogoCard: React.FC<LogoCardProps> = ({ logo, onLogoClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const hasValidImage = Boolean(logo.src?.trim());

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClick = () => {
    onLogoClick?.(logo);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  useEffect(() => {
    setHasError(false);
    setIsLoading(hasValidImage);

    if (!hasValidImage) return;

    const image = new Image();
    image.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    image.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    image.src = logo.src;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [hasValidImage, logo.src]);

  return (
    <div
      className={`
        mt-2 relative group
        flex items-center justify-center
        h-20 w-full
        rounded-xl bg-gray-100 border border-gray-200/60
        px-4 py-4
        transition-all duration-200
      hover:border-red-500/20 cursor-pointer hover:scale-95
      `}
      onClick={logo.website ? handleClick : undefined}
      onKeyDown={logo.website ? handleKeyDown : undefined}
      tabIndex={logo.website ? 0 : undefined}
      role={logo.website ? "button" : "img"}
      aria-label={
        logo.website ? `Visitar website da ${logo.name}` : logo.alt || logo.name
      }
      title={logo.name}
    >
      {/* Loading State */}
      {hasValidImage && isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {(!hasValidImage || hasError) && (
        <ImageNotFound
          size="xs"
          variant="muted"
          message=""
          icon="Building2"
          showMessage={false}
          className="w-full h-full border-0 bg-transparent"
        />
      )}

      {/* Main Image */}
      {hasValidImage && !hasError && (
        // As logos ja chegam como URLs finais do storage/CDN.
        // Usar <img> evita falso erro do otimizador do Next para assets externos.
        <img
          src={logo.src}
          alt={logo.alt || logo.name}
          loading="lazy"
          decoding="async"
          className={`
            transition-opacity duration-500
            ${isLoading ? "opacity-0" : "opacity-100"}
            object-contain max-h-10 max-w-[100px] w-auto
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};
