"use client";

import React, { useState } from "react";
import Image from "next/image";
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

  const content = (
    <>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State usando ImageNotFound */}
      {hasError && (
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
      {!hasError && (
        <Image
          src={slide.image}
          alt={getAltText(slide, index)}
          fill
          className={`
            object-cover object-center
            transition-opacity duration-500
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
          priority={index === 0}
          quality={80}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes={
            isMobile ? "(max-width: 768px) 100vw" : "(min-width: 769px) 100vw"
          }
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
