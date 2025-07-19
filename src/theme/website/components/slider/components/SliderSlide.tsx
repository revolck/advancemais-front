"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { SliderSlideProps } from "../types";

export const SliderSlide: React.FC<SliderSlideProps> = ({
  slide,
  index,
  isMobile,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Função para gerar alt text seguro
  const getAltText = (
    slide: { title?: string; subtitle?: string },
    index: number
  ): string => {
    if (slide.title) return slide.title;
    if (slide.subtitle) return slide.subtitle;
    return `Slide ${index + 1}`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="flex-none w-full relative">
      <div
        className={`
        relative w-full
        ${
          isMobile
            ? "h-[300px] sm:h-[400px]"
            : "h-[400px] md:h-[500px] lg:h-[498px]"
        }
      `}
      >
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
            className="absolute inset-0"
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
            quality={90}
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

        {/* Conteúdo do slide - só mostra se não tiver erro */}
        {!hasError && (slide.title || slide.subtitle || slide.cta) && (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 px-4 sm:px-6 lg:px-8">
            {slide.title && (
              <h2
                className={`
                font-bold text-white mb-4 drop-shadow-lg
                ${
                  isMobile
                    ? "text-2xl sm:text-3xl"
                    : "text-4xl md:text-5xl lg:text-6xl"
                }
              `}
              >
                {slide.title}
              </h2>
            )}

            {slide.subtitle && (
              <p
                className={`
                text-white/90 mb-6 max-w-2xl mx-auto drop-shadow-lg
                ${isMobile ? "text-sm sm:text-base" : "text-lg md:text-xl"}
              `}
              >
                {slide.subtitle}
              </p>
            )}

            {slide.cta && (
              <a
                href={slide.cta.href}
                className={`
                  inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                  transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl
                  ${isMobile ? "px-6 py-3 text-sm" : "px-8 py-4 text-base"}
                `}
              >
                {slide.cta.text}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
