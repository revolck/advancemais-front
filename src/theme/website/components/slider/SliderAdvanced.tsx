"use client";

import React, { useState } from "react";
import { SliderContainer } from "./components/SliderContainer";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { useSliderKeyboard } from "./hooks/useSliderKeyboard";
import { useSliderIntersection } from "./hooks/useSliderIntersection";
import { SLIDES } from "./constants/slides";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SliderConfig } from "./types";

interface SliderAdvancedProps {
  config?: Partial<SliderConfig>;
  enableKeyboard?: boolean;
  enableIntersectionPause?: boolean;
  showPlayPause?: boolean;
  className?: string;
}

export const SliderAdvanced: React.FC<SliderAdvancedProps> = ({
  config,
  enableKeyboard = true,
  enableIntersectionPause = true,
  showPlayPause = true,
  className = "",
}) => {
  const isMobile = useIsMobile();
  const slides = isMobile ? SLIDES.mobile : SLIDES.desktop;
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Configuração personalizada
  const sliderConfig: SliderConfig = {
    loop: true,
    align: "center",
    dragFree: false,
    autoplay: {
      enabled: true,
      delay: 5000,
    },
    ...config,
  };

  // Hooks do slider
  const {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    currentSlide,
    slideCount,
  } = useSlider(sliderConfig);

  // Autoplay com controle de pausa
  const { startAutoplay, stopAutoplay } = useSliderAutoplay(
    emblaApi,
    sliderConfig.autoplay && !isPaused && isVisible
      ? sliderConfig.autoplay
      : undefined
  );

  // Navegação por teclado
  useSliderKeyboard(emblaApi, enableKeyboard);

  // Intersection observer para pausar quando não visível
  const intersectionRef = useSliderIntersection((visible) => {
    if (enableIntersectionPause) {
      setIsVisible(visible);
    }
  }, 0.5);

  // Handlers para controle manual
  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[500px] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Nenhum slide disponível</p>
      </div>
    );
  }

  return (
    <div
      ref={intersectionRef as React.RefObject<HTMLDivElement>}
      className={`relative ${className}`}
    >
      <SliderContainer
        emblaRef={emblaRef}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
        onScrollPrev={scrollPrev}
        onScrollNext={scrollNext}
        currentSlide={currentSlide}
        slideCount={slideCount}
      />

      {/* Controle de Play/Pause */}
      {showPlayPause && sliderConfig.autoplay?.enabled && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={handlePlayPause}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
            aria-label={isPaused ? "Reproduzir" : "Pausar"}
          >
            {isPaused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l7-5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Indicador de status */}
      {enableIntersectionPause && (
        <div className="absolute top-4 left-4 z-30">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isVisible
                ? isPaused
                  ? "bg-yellow-500/80 text-yellow-900"
                  : "bg-green-500/80 text-green-900"
                : "bg-gray-500/80 text-gray-900"
            }`}
          >
            {!isVisible ? "Pausado" : isPaused ? "Pausado" : "Ativo"}
          </div>
        </div>
      )}
    </div>
  );
};
