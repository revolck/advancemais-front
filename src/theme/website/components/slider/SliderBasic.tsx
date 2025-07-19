"use client";

import React from "react";
import { SliderContainer } from "./components/SliderContainer";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
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

  // Se não há slides, renderiza um fallback elegante
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[500px]">
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="landscape"
          message="Nenhum slide disponível"
          icon="ImageOff"
          className="h-full"
          showMessage={true}
        />
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
