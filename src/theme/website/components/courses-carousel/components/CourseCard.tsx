// src/theme/website/components/courses-carousel/components/CourseCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { COURSES_CONFIG, getTagConfig } from "../constants";
import type { CourseCardProps } from "../types";

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Obtém configuração da tag - ATUALIZADO
  const tagConfig = getTagConfig(course.tag);

  return (
    <>
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="portrait"
          message="Imagem do curso indisponível"
          icon="GraduationCap"
          className="absolute inset-0"
          showMessage={true}
        />
      )}

      {/* Main Image */}
      {!hasError && (
        <Image
          src={course.image}
          alt={course.title}
          fill
          className={`
            object-cover
            transition-opacity duration-500
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority
          quality={COURSES_CONFIG.image.quality}
          sizes={COURSES_CONFIG.image.sizes}
        />
      )}

      {/* Tag - ATUALIZADO COM NOVAS CONFIGURAÇÕES */}
      {!hasError && (
        <div
          className={`
            absolute top-2 left-2 z-20
            ${tagConfig.color} ${tagConfig.textColor}
            text-xs px-2 py-1 rounded-md
            font-medium shadow-lg
            ${course.tag === "gratuito" ? "uppercase" : ""}
            ${course.tag === "promocao" ? "uppercase" : ""}
          `}
        >
          {tagConfig.label}
        </div>
      )}

      {/* Título */}
      {!hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-800 to-transparent p-10 text-white text-center">
          <h3 className="carousel-item-title text-lg mb-2">{course.title}</h3>
        </div>
      )}
    </>
  );
};
