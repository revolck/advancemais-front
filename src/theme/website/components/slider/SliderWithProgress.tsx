"use client";

import React from "react";
import { SliderContainer } from "./components/SliderContainer";
import { SliderProgress } from "./components/SliderProgress";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { SLIDER_CONFIG } from "./constants/config";
import { SLIDES } from "./constants/slides";
import { useIsMobile } from "@/hooks/use-mobile";

interface SliderWithProgressProps {
  showNumbers?: boolean;
  progressPosition?: "bottom" | "top";
  className?: string;
}

export const SliderWithProgress: React.FC<SliderWithProgressProps> = ({
  showNumbers = false,
  progressPosition = "bottom",
  className = "",
}) => {
  const isMobile = useIsMobile();
  const slides = isMobile ? SLIDES.mobile : SLIDES.desktop;

  const {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    currentSlide,
    slideCount,
  } = useSlider(SLIDER_CONFIG);

  useSliderAutoplay(emblaApi, SLIDER_CONFIG.autoplay);

  if (!slides || slides.length === 0) {
    return (
      <div
        className="w-full relative bg-gray-200 flex items-center justify-center"
        style={{ aspectRatio: 16 / 9 }}
      >
        <p className="text-gray-500">Nenhum slide disponível</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Barra de progresso no topo */}
      {progressPosition === "top" && SLIDER_CONFIG.autoplay?.enabled && (
        <SliderProgress
          emblaApi={emblaApi}
          autoplayDelay={SLIDER_CONFIG.autoplay.delay}
          className="top-0"
        />
      )}

      <SliderContainer
        emblaRef={emblaRef}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
        onScrollPrev={scrollPrev}
        onScrollNext={scrollNext}
        currentSlide={currentSlide}
        slideCount={slideCount}
      />

      {/* Barra de progresso na parte inferior */}
      {progressPosition === "bottom" && SLIDER_CONFIG.autoplay?.enabled && (
        <SliderProgress
          emblaApi={emblaApi}
          autoplayDelay={SLIDER_CONFIG.autoplay.delay}
          className="bottom-0"
        />
      )}

      {/* Contador de slides */}
      {showNumbers && (
        <div className="absolute bottom-4 right-4 z-30">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentSlide + 1} / {slideCount}
          </div>
        </div>
      )}
    </div>
  );
};
