// src/theme/website/components/training-results/components/TrainingResultCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { TRAINING_RESULTS_CONFIG } from "../constants";
import type { TrainingResultCardProps } from "../types";

export const TrainingResultCard: React.FC<TrainingResultCardProps> = ({
  data,
  index,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(!!data.iconUrl);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  // Renderiza o ícone baseado no tipo disponível
  const renderIcon = () => {
    // Se tem URL de imagem customizada e não deu erro
    if (data.iconUrl && !imageError) {
      return (
        <div className="relative w-10 h-10 mb-4">
          {isImageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
          <Image
            src={data.iconUrl}
            alt={`Ícone ${data.title}`}
            width={40}
            height={40}
            className={`
              w-full h-full object-contain
              transition-opacity duration-300
              ${isImageLoading ? "opacity-0" : "opacity-100"}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      );
    }

    // Se tem nome de ícone Lucide
    if (data.iconName) {
      return (
        <div className="mb-3">
          <Icon
            name={data.iconName as any}
            size={40}
            className={data.color || "text-red-600"}
          />
        </div>
      );
    }

    // Fallback para ImageNotFound
    return (
      <div className="mb-4">
        <ImageNotFound
          size="xs"
          variant="muted"
          icon="Zap"
          showMessage={false}
          className="w-10 h-10 bg-gray-100 rounded"
        />
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-6 border-1 border-red-500/10 hover:border-red-500/40 cursor-pointer transition-all duration-300 hover:scale-105 min-h-[180px]"
      style={{
        animationDelay: `${
          index * TRAINING_RESULTS_CONFIG.animation.staggerDelay
        }ms`,
      }}
    >
      {/* Ícone */}
      {renderIcon()}

      {/* Título */}
      <p className="!text-base text-center text-gray-700 !leading-snug">
        {data.title}
      </p>
    </div>
  );
};
