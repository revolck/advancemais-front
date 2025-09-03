// src/theme/website/components/advance-ajuda/components/HighlightSection.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { HighlightSectionProps } from "../types";

const CONFIG = {
  animationStagger: 300,
  imageQuality: 90,
  imageSizes: "(max-width: 1024px) 100vw, 600px",
} as const;

export const HighlightSection: React.FC<HighlightSectionProps> = ({
  data,
  index,
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

  // Ordena os benefícios
  const sortedBenefits = [...data.benefits].sort((a, b) => a.order - b.order);

  return (
    <section
      className="pxResponsive container mx-auto py-14 grid lg:grid-cols-3 gap-16 items-center"
      style={{
        // Animação de entrada com stagger - aproveitando CSS existente
        animationDelay: `${index * CONFIG.animationStagger}ms`,
      }}
    >
      {/* Lado esquerdo: Texto */}
      <div className="lg:col-span-1">
        <h2 className="text-4xl text-[var(--primary-color)] sm:text-4xl mb-6 font-bold leading-tight text-center lg:text-left">
          {data.title}
        </h2>
        <p className="text-gray-600 leading-relaxed text-justify text-lg mb-4">
          {data.description}
        </p>
        {data.highlightText && (
          <p className="text-gray-600 leading-relaxed text-justify text-lg">
            <span className="text-red-500 font-bold">{data.highlightText}</span>
          </p>
        )}
      </div>

      {/* Imagem no meio */}
      <div className="lg:col-span-1 flex justify-center -mt-5 lg:mt-0 mb-5 lg:mb-0">
        <div className="relative w-full max-w-[600px]">
          {/* Loading State */}
          {isLoading && (
            <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="landscape"
              message="Imagem indisponível"
              icon="ImageOff"
              className="aspect-[3/2] rounded-lg shadow-lg"
              showMessage={true}
            />
          )}

          {/* Main Image */}
          {!hasError && (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              width={600}
              height={400}
              className={`
                rounded-lg shadow-lg object-cover w-full
                transition-opacity duration-500
                ${isLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
              `}
              style={{ aspectRatio: "3/2" }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={index === 0} // Prioriza primeira imagem
              quality={CONFIG.imageQuality}
              sizes={CONFIG.imageSizes}
            />
          )}
        </div>
      </div>

      {/* Lado direito: Benefícios */}
      <div className="lg:col-span-1 space-y-6">
        {sortedBenefits.map((benefit, benefitIndex) => (
          <div
            key={benefit.id}
            className="hover-lift" // Usando classe CSS existente
            style={{
              // Animação escalonada para os benefícios
              animationDelay: `${index * CONFIG.animationStagger + benefitIndex * 100}ms`,
            }}
          >
            <h3 className="text-xl font-semibold text-[var(--primary-color)] mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-justify">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
