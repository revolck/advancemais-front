"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { SliderSlideProps } from "../types";

export const SliderSlide: React.FC<SliderSlideProps> = ({
  slide,
  index,
  isMobile,
  height,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Função para gerar alt text seguro
  const getAltText = (slide: { alt?: string }, index: number): string => {
    if (slide.alt) return slide.alt;
    return `Slide ${index + 1}`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const fitClass = isMobile ? "object-contain" : "object-cover";
  const hasValidImage = Boolean(slide.image?.trim());

  useEffect(() => {
    setHasError(false);
    setIsLoading(hasValidImage);
  }, [hasValidImage, slide.image]);

  const content = (
    <>
      {/* Loading State */}
      {hasValidImage && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State usando ImageNotFound */}
      {(!hasValidImage || hasError) && (
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="landscape"
          message="Slide indisponível"
          icon="ImageOff"
          className="absolute inset-0 !rounded-none !border-0 !bg-transparent"
          showMessage={true}
        />
      )}

      {/* Main Image */}
      {hasValidImage && !hasError && (
        // As imagens do slider ja chegam como URLs finais do storage/CDN.
        // Usar <img> evita falso erro do otimizador do Next para assets externos.
        <img
          src={slide.image}
          alt={getAltText(slide, index)}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`
            absolute inset-0 h-full w-full
            ${fitClass} object-center
            transition-opacity duration-500
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Overlay para melhor legibilidade do texto */}
      {slide.overlay && !hasError && (
        <div className="absolute inset-0 bg-black/20" />
      )}
    </>
  );

  return (
    <div
      className="flex-none w-full h-full relative"
      style={
        height ? { height, minHeight: height, maxHeight: height } : undefined
      }
    >
      {slide.link ? (
        <a
          href={slide.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block w-full h-full"
          style={height ? { height: "100%" } : undefined}
        >
          {content}
        </a>
      ) : (
        <div
          className="relative w-full h-full"
          style={height ? { height: "100%" } : undefined}
        >
          {content}
        </div>
      )}
    </div>
  );
};
