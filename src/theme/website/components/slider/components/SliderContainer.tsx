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
  slides,
}) => {
  const isMobile = useIsMobile();
  const slideData = slides ?? (isMobile ? SLIDES.mobile : SLIDES.desktop);

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[800px] overflow-hidden">
      {/* Container do Embla */}
      <div ref={emblaRef} className="overflow-hidden w-full h-full">
        <div className="flex h-full">
          {slideData.map((slide, index) => (
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
