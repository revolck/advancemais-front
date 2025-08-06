// src/theme/website/components/process-steps/components/ProcessStepItem.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { PROCESS_CONFIG } from "../constants";
import type { ProcessStepItemProps } from "../types";

export const ProcessStepItem: React.FC<ProcessStepItemProps> = ({
  step,
  index,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(!!step.imageUrl);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };

  return (
    <div
      className="text-center"
      style={{
        // Animação de entrada com stagger
        animationDelay: `${index * PROCESS_CONFIG.animation.staggerDelay}ms`,
      }}
    >
      {/* Número ou Imagem */}
      <div className="flex justify-center mb-4">
        {step.imageUrl && !hasImageError ? (
          // Renderiza imagem se fornecida
          <div className="relative w-16 h-16">
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {hasImageError ? (
              <ImageNotFound
                size="md"
                variant="muted"
                aspectRatio="square"
                message=""
                icon="ImageOff"
                className="w-16 h-16 rounded-full"
                showMessage={false}
              />
            ) : (
              <Image
                src={step.imageUrl}
                alt={step.imageAlt || step.title}
                width={64}
                height={64}
                className={`
                  w-16 h-16 rounded-full object-cover
                  transition-opacity duration-300
                  ${isImageLoading ? "opacity-0" : "opacity-100"}
                `}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority={index < 3}
              />
            )}
          </div>
        ) : (
          // Renderiza número com ícone se não tiver imagem
          <div className="w-12 h-12 bg-[var(--secondary-color)] text-white font-bold rounded-full flex items-center justify-center mx-auto relative overflow-hidden group">
            {/* Background com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Número */}
            <span className="relative z-10 text-lg font-bold">
              {step.number}
            </span>

            {/* Ícone pequeno no canto (se fornecido) */}
            {step.icon && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <Icon
                  name={step.icon as any}
                  size={12}
                  className="text-red-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Título */}
      <h4 className="text-xl font-semibold mb-2 text-white leading-tight">
        {step.title}
      </h4>

      {/* Descrição */}
      <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
        {step.description}
      </p>
    </div>
  );
};
