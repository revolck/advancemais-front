"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { AboutImageProps } from "@/api/websites/components";

const AboutImage = ({ src, alt, width, height }: AboutImageProps) => {
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
    <div className="w-full lg:w-1/2 relative">
      {/* Loading State */}
      {isLoading && (
        <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State usando ImageNotFound */}
      {hasError && (
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="landscape"
          message="Imagem indisponível"
          icon="ImageOff"
          className="aspect-[3/2] rounded-lg"
          showMessage={true}
        />
      )}

      {/* Main Image */}
      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`
            rounded-lg object-cover w-full
            transition-opacity duration-500
            ${isLoading ? "opacity-0 absolute inset-0" : "opacity-100"}
          `}
          style={{ aspectRatio: `${width}/${height}` }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={true}
          quality={90}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      )}
    </div>
  );
};

export default AboutImage;
