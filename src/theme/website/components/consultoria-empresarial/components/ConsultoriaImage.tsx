"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { ConsultoriaImageProps } from "@/api/websites/components";

const ConsultoriaImage = ({ src, alt, width, height }: ConsultoriaImageProps) => {
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
      {isLoading && (
        <div className="aspect-[3/2] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

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

      {!hasError && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`
            rounded-lg shadow-lg object-cover w-full
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

export default ConsultoriaImage;
