// src/theme/website/components/testimonials-carousel/components/TestimonialItem.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import type { TestimonialItemProps } from "../types";

export const TestimonialItem: React.FC<TestimonialItemProps> = ({
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col hover:border-[var(--primary-color)] hover:shadow-lg transition-all duration-300">
      {/* Texto do depoimento */}
      <div className="flex-1 mb-6">
        <p className="text-gray-700 italic leading-relaxed text-[15px] line-clamp-4">
          "{data.testimonial}"
        </p>
      </div>

      {/* Informações do autor */}
      <div className="flex items-center gap-4 mt-auto">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {isLoading && (
            <div className="w-14 h-14 bg-gray-200 animate-pulse rounded-full" />
          )}

          {hasError && (
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">👤</span>
            </div>
          )}

          {!hasError && (
            <Image
              src={data.imageUrl}
              alt={data.name}
              width={56}
              height={56}
              className={`
                w-14 h-14 rounded-full object-cover
                transition-opacity duration-500
                ${isLoading ? "opacity-0 absolute" : "opacity-100"}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={index < 3}
            />
          )}
        </div>

        {/* Informações do autor - LAYOUT CORRIGIDO */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--primary-color)] text-lg leading-tight">
            {data.name}
          </h3>
          <p className="text-gray-500 text-sm leading-tight mt-1">
            {data.position}
          </p>
          {data.company && (
            <p className="text-gray-400 text-sm leading-tight">
              {data.company}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
