// src/theme/website/components/communication-highlights/components/ImageGallery.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { COMMUNICATION_CONFIG } from "../constants";
import type { ImageGalleryProps } from "../types";

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    images.reduce((acc, img) => ({ ...acc, [img.id]: true }), {})
  );
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

  const handleImageLoad = (imageId: string) => {
    setLoadingStates((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId: string) => {
    setLoadingStates((prev) => ({ ...prev, [imageId]: false }));
    setErrorStates((prev) => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover-lift"
          style={{
            animationDelay: `${
              index * COMMUNICATION_CONFIG.animation.staggerDelay
            }ms`,
          }}
        >
          {/* Loading State */}
          {loadingStates[image.id] && (
            <div className="aspect-[4/3] bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {errorStates[image.id] && (
            <ImageNotFound
              size="full"
              variant="muted"
              aspectRatio="landscape"
              message="Imagem indisponível"
              icon="ImageOff"
              className="aspect-[4/3]"
              showMessage={true}
            />
          )}

          {/* Main Image */}
          {!errorStates[image.id] && (
            <Image
              src={image.imageUrl}
              alt={image.alt}
              width={400}
              height={300}
              className={`
                w-full h-full object-cover hover-scale
                transition-all duration-500
                ${
                  loadingStates[image.id] ? "opacity-0 absolute" : "opacity-100"
                }
              `}
              style={{ aspectRatio: COMMUNICATION_CONFIG.gallery.aspectRatio }}
              onLoad={() => handleImageLoad(image.id)}
              onError={() => handleImageError(image.id)}
              priority={index < 2} // Prioriza as duas primeiras imagens
              quality={COMMUNICATION_CONFIG.image.quality}
              sizes={COMMUNICATION_CONFIG.image.sizes}
            />
          )}
        </div>
      ))}
    </div>
  );
};
