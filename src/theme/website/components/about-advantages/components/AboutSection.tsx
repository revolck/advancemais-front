// src/theme/website/components/about-advantages/components/AboutSection.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ABOUT_ADVANTAGES_CONFIG } from "../constants";
import type { AboutSectionProps } from "../types";

export const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
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
    <section className="aboutAdvantagesPx py-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lado esquerdo com texto */}
          <div className="w-full lg:w-1/2 flex flex-col gap-2">
            <h2 className="text-4xl font-bold text-[var(--primary-color)]">
              {data.title}
            </h2>
            <div className="aboutAdvantagesSection text-justify mr-0 lg:mr-10">
              {data.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Lado direito com imagem */}
          <div className="aboutAdvantagesSpaceMobile w-full lg:w-1/2 h-auto">
            <div className="relative rounded-lg overflow-hidden shadow-lg h-full">
              {/* Loading State */}
              {isLoading && (
                <div className="aspect-[530/360] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
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
                  className="aspect-[530/360] rounded-lg"
                  showMessage={true}
                />
              )}

              {/* Main Image */}
              {!hasError && (
                <Image
                  src={data.imageUrl}
                  alt={data.imageAlt}
                  width={530}
                  height={360}
                  className={`
                    w-full h-full object-cover rounded-lg
                    transition-opacity duration-500
                    ${isLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
                  `}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  priority={true}
                  quality={ABOUT_ADVANTAGES_CONFIG.image.quality}
                  sizes={ABOUT_ADVANTAGES_CONFIG.image.sizes}
                />
              )}

              {/* Overlay */}
              {!hasError && !isLoading && (
                <div className="aboutAdvantagesImagem aboutAdvantagesOverlay absolute inset-0 flex flex-col justify-between p-14">
                  <div className="self-end text-right">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {data.overlayTitle}
                    </h2>
                    <p className="text-sm text-gray-200 mb-6 ml-44 mt-5">
                      {data.overlayDescription}
                    </p>
                  </div>
                  <div className="self-end">
                    <Link href={data.overlayButtonUrl}>
                      <Button
                        className="mt-2 bg-[var(--secondary-color)] hover:bg-[var(--secondary-color)]/90 text-white"
                        size="lg"
                      >
                        {data.overlayButtonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
