"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { LOGOS_CONFIG } from "../constants";
import type { LogoCardProps } from "../types";

export const LogoCard: React.FC<LogoCardProps> = ({ logo, onLogoClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  return (
    <div
      className={`
        mt-2 relative group
        flex items-center justify-center
        h-20 w-full
        rounded-xl bg-gray-100 border border-gray-200/60
        px-4 py-4 shadow-sm
        transition-all duration-200
        hover:shadow-md hover:border-gray-300
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
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
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
      {!hasError && (
        <Image
          src={logo.src}
          alt={logo.alt || logo.name}
          width={LOGOS_CONFIG.image.maxWidth}
          height={LOGOS_CONFIG.image.maxHeight}
          className={`
            transition-opacity duration-500
            ${isLoading ? "opacity-0" : "opacity-100"}
            object-contain max-h-10 w-auto
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          quality={LOGOS_CONFIG.image.quality}
          sizes={LOGOS_CONFIG.image.sizes}
        />
      )}
    </div>
  );
};
