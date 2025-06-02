import React from "react";
import { SliderSlide } from "./SliderSlide";
import { SliderControls } from "./SliderControls";
import { SLIDES } from "../constants/slides";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SliderContainerProps } from "../types";

export const SliderContainer: React.FC<SliderContainerProps> = ({
  emblaRef,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}) => {
  const isMobile = useIsMobile();
  const slides = isMobile ? SLIDES.mobile : SLIDES.desktop;

  return (
    <section className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      {/* Container do Embla */}
      <div ref={emblaRef} className="overflow-hidden w-full">
        <div className="flex">
          {slides.map((slide, index) => (
            <SliderSlide
              key={slide.id}
              slide={slide}
              index={index}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>

      {/* Controles de navegação */}
      <SliderControls
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
        onScrollPrev={onScrollPrev}
        onScrollNext={onScrollNext}
      />
    </section>
  );
};
