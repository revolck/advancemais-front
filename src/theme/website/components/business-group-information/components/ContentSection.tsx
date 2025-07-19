"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { BUSINESS_CONFIG } from "../constants";
import type { ContentSectionProps } from "../types";

export const ContentSection: React.FC<ContentSectionProps> = ({
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

  return (
    <section
      className={`container mx-auto pt-16 lg:pb-6 px-4 flex flex-col lg:flex-row items-center lg:gap-20 gap-6 mt-5 ${
        data.reverse ? "lg:flex-row-reverse" : ""
      }`}
      style={{
        // Animação de entrada com stagger
        animationDelay: `${index * BUSINESS_CONFIG.animation.staggerDelay}ms`,
      }}
    >
      {/* Lado da imagem */}
      <div className="w-full lg:w-1/2 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
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
            priority={index < 2} // Prioriza as duas primeiras imagens
            quality={BUSINESS_CONFIG.image.quality}
            sizes={BUSINESS_CONFIG.image.sizes}
          />
        )}
      </div>

      {/* Lado do texto */}
      <div className="w-full text-center lg:w-1/2 lg:text-left">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[var(--primary-color)] leading-tight">
          {data.title}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed text-justify lg:text-left text-base lg:text-lg">
          {data.description}
        </p>

        <Link href={data.buttonUrl}>
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {data.buttonLabel}
          </Button>
        </Link>
      </div>
    </section>
  );
};
