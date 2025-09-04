"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { useIsMobile } from "@/hooks/use-mobile";
import { SERVICE_BENEFITS_CONFIG } from "../constants";
import type { ServiceBenefitsItemProps } from "../types";

export const ServiceBenefitsItem: React.FC<ServiceBenefitsItemProps> = ({
  data,
  index,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Filtra e ordena benefícios ativos
  const activeBenefits = data.benefits
    .filter((benefit) => benefit.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <section
      className={`pxResponsive container mx-auto py-14 flex flex-col ${
        isMobile ? "items-center gap-6" : "lg:flex-row items-center gap-8"
      }`}
    >
      {/* Image Section */}
      <div
        className={`${
          isMobile
            ? "w-full flex justify-center"
            : "lg:w-1/2 w-full flex flex-col lg:flex-row items-start justify-between"
        }`}
      >
        {/* Loading State */}
        {isLoading && (
          <div
            className={`rounded-lg shadow-${
              isMobile ? "md" : "lg"
            } bg-gray-200 animate-pulse flex items-center justify-center`}
            style={{
              width: isMobile ? 300 : 600,
              height: isMobile ? 200 : 400,
            }}
          >
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
            className={`rounded-lg shadow-${isMobile ? "md" : "lg"}`}
            style={{
              width: isMobile ? 300 : 600,
              height: isMobile ? 200 : 400,
            }}
          />
        )}

        {/* Main Image */}
        {!hasError && (
          <Image
            src={data.imageUrl}
            alt={data.imageAlt}
            className={`
              rounded-lg shadow-${isMobile ? "md" : "lg"}
              transition-opacity duration-500
              ${isLoading ? "opacity-0 absolute" : "opacity-100"}
            `}
            width={isMobile ? 300 : 600}
            height={isMobile ? 200 : 400}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={index < 2}
            quality={SERVICE_BENEFITS_CONFIG.image.quality}
            sizes={SERVICE_BENEFITS_CONFIG.image.sizes}
          />
        )}
      </div>

      {/* Text Section */}
      <div className={isMobile ? "w-full px-4 text-center" : "lg:w-1/2"}>
        {/* Title */}
        <h2
          className={`${
            isMobile
              ? "text-3xl font-semibold leading-tight text-[var(--primary-color)] mb-4"
              : "text-4xl font-bold leading-tight text-[var(--primary-color)] mb-6"
          }`}
        >
          {data.title}
        </h2>

        {/* Subtitle se existir */}
        {data.subtitle && (
          <h3
            className={`${
              isMobile
                ? "text-lg font-medium text-gray-700 mb-3"
                : "text-xl font-medium text-gray-700 mb-4"
            }`}
          >
            {data.subtitle}
          </h3>
        )}

        {/* Description */}
        <p
          className={`${
            isMobile
              ? "text-gray-600 text-base mb-6"
              : "text-gray-600 text-lg mb-6"
          }`}
        >
          {data.description}
        </p>

        {/* Benefits List */}
        <ul className={isMobile ? "space-y-4" : "space-y-3"}>
          {activeBenefits.map((benefit, benefitIndex) => {
            const gradientConfig =
              SERVICE_BENEFITS_CONFIG.gradients[benefit.gradientType];

            return (
              <li
                key={benefit.id}
                className={`flex items-center gap-3 ${
                  isMobile ? "py-2 px-4 rounded-md" : ""
                } rounded-full h-10 px-4 mb-4 w-fit`}
                style={{
                  background: gradientConfig.background,
                  color: gradientConfig.color,
                  // Animação de entrada com stagger
                  animationDelay: `${
                    benefitIndex *
                    SERVICE_BENEFITS_CONFIG.animation.staggerDelay
                  }ms`,
                }}
              >
                <span
                  className={`${
                    isMobile ? "w-8 h-8" : "w-6 h-6"
                  } flex items-center justify-center text-white rounded-full ${
                    gradientConfig.circleColor
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`${
                    isMobile ? "text-base" : "text-lg"
                  } font-medium`}
                >
                  {benefit.text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
