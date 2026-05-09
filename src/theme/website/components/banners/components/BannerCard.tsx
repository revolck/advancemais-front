"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { BannerCardProps } from "../types";

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  priority = false,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  const hasLink = Boolean(banner.linkUrl && banner.linkUrl !== "#");
  const hasValidImage = Boolean(banner.imagemUrl?.trim());

  useEffect(() => {
    setHasError(false);
    setIsLoading(hasValidImage);
  }, [hasValidImage, banner.imagemUrl]);

  const baseClasses = `
    ${hasLink ? "group" : ""} relative block w-full
    aspect-[2/3] rounded-2xl overflow-hidden
    bg-gradient-to-br from-gray-100 to-gray-200
    transition-transform duration-300 ease-out
    ${hasLink ? "hover:scale-[1.02] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/20" : ""}
    ${className}
  `;

  const Content = (
    <>
      {/* Loading State */}
      {hasValidImage && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State usando o novo ImageNotFound */}
      {(!hasValidImage || hasError) && (
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="portrait"
          message="Banner indisponível"
          icon="ImageOff"
          className="absolute inset-0 rounded-2xl border-0"
          showMessage={true}
        />
      )}

      {/* Main Image */}
      {hasValidImage && !hasError && (
        // As imagens dos banners ja chegam como URLs finais do storage/CDN.
        // Usar <img> evita falso erro do otimizador do Next para assets externos.
        <img
          src={banner.imagemUrl}
          alt={banner.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`
            absolute inset-0 h-full w-full object-cover
            transition-all duration-500 ease-out
            ${hasLink ? "group-hover:scale-105" : ""}
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Overlay com efeito hover (apenas quando há link) */}
      {hasLink && (
        <div
          className="
          absolute inset-0 
          bg-gradient-to-t from-black/20 via-transparent to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "
        />
      )}

      {/* Indicador de interação (apenas quando há link) */}
      {hasLink && (
        <div
          className="
          absolute bottom-4 right-4
          w-8 h-8 bg-white/90 backdrop-blur-sm
          rounded-full flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transform translate-x-2 group-hover:translate-x-0
          transition-all duration-300
        "
        >
          <svg
            className="w-4 h-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </>
  );

  if (hasLink) {
    return (
      <Link
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        aria-label={banner.alt}
      >
        {Content}
      </Link>
    );
  }

  return (
    <div className={baseClasses} aria-label={banner.alt} role="img">
      {Content}
    </div>
  );
};
