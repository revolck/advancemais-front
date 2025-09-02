// src/theme/website/components/header-pages/components/HeaderContent.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
// Link não é necessário; abriremos sempre em nova aba com <a>
import { Button } from "@/components/ui/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { useIsMobile } from "@/hooks/use-mobile";
import { HEADER_CONFIG } from "../constants";
import type { HeaderPageData } from "../types";

interface HeaderContentProps {
  data: HeaderPageData;
}

export const HeaderContent: React.FC<HeaderContentProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();
  // Botão sempre abre em nova aba

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Layout Mobile
  if (isMobile) {
    return (
      <section className="container mx-auto py-10 flex flex-col items-center text-center">
        <h5 className="!mb-1 text-red-500 uppercase font-semibold tracking-wider">
          {data.subtitle}
        </h5>

        <h3 className="text-[var(--primary-color)] mb-4">
          {data.title}
        </h3>

        <p className="text-gray-600 mb-6">
          {data.description}
        </p>

        <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white py-6 cursor-pointer"
          >
            {data.buttonText}
          </Button>
        </a>
      </section>
    );
  }

  // Layout Desktop
  return (
    <section className="container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8">
      <div className="w-full flex flex-col lg:flex-row items-start justify-between">
        {/* Texto principal (lado esquerdo) */}
        <div className="text-center lg:text-left flex-1 pr-6">
          <h6 className="!mb-0 text-red-500 uppercase font-semibold tracking-wider">
            {data.subtitle}
          </h6>

          <h2 className="text-[var(--primary-color)] mb-4">
            {data.title}
          </h2>

          <p className="text-gray-600 mb-6">
            {data.description}
          </p>

          <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white py-6 cursor-pointer"
            >
              {data.buttonText}
            </Button>
          </a>
        </div>

        {/* Imagem (lado direito) */}
        <div
          className="relative"
          style={{ width: "686px", height: "305px" }}
        >
          {/* Loading State - CORRIGIDO: Tamanho fixo */}
          {isLoading && (
            <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State - CORRIGIDO: Tamanho fixo */}
          {hasError && (
            <div className="w-full h-full">
              <ImageNotFound
                size="full"
                variant="muted"
                message="Imagem indisponível"
                icon="ImageOff"
                className="w-full h-full rounded-lg"
                showMessage={true}
              />
            </div>
          )}

          {/* Main Image - CORRIGIDO: Tamanho fixo 810x360 */}
          {!hasError && (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              width={HEADER_CONFIG.image.width}
              height={HEADER_CONFIG.image.height}
              className={`
                transition-opacity duration-500
                ${isLoading ? "opacity-0 absolute" : "opacity-100"}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={HEADER_CONFIG.image.priority}
              quality={HEADER_CONFIG.image.quality}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              sizes={HEADER_CONFIG.image.sizes}
            />
          )}
        </div>
      </div>
    </section>
  );
};
