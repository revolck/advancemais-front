"use client";

import React from "react";
import { SliderContainer } from "./components/SliderContainer";
import { SLIDER_CONFIG } from "./constants/config";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { SLIDES } from "./constants/slides";
import { useIsMobile } from "@/hooks/use-mobile";

const SliderBasic: React.FC = () => {
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

  // Autoplay básico
  useSliderAutoplay(emblaApi, SLIDER_CONFIG.autoplay);

  // Se não há slides, renderiza um fallback
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[500px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum slide disponível
        </p>
      </div>
    );
  }

  return (
    <SliderContainer
      emblaRef={emblaRef}
      canScrollPrev={canScrollPrev}
      canScrollNext={canScrollNext}
      onScrollPrev={scrollPrev}
      onScrollNext={scrollNext}
      currentSlide={currentSlide}
      slideCount={slideCount}
    />
  );
};

export default SliderBasic;
