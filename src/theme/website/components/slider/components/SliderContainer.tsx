import React from "react";
import { SliderSlide } from "./SliderSlide";
import { SliderControls } from "./SliderControls";
import { SLIDES } from "../constants/slides";
import { SLIDER_CONFIG } from "../constants/config";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SliderContainerProps } from "../types";

export const SliderContainer: React.FC<SliderContainerProps> = ({
  emblaRef,
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
  slides,
  heightClass,
  height,
}) => {
  const isMobile = useIsMobile();
  const slideData = slides ?? (isMobile ? SLIDES.mobile : SLIDES.desktop);
  const containerHeight = height ?? SLIDER_CONFIG.ui.height;

  return (
    <section
      className={heightClass || "relative w-full overflow-hidden"}
      style={{ height: containerHeight, minHeight: containerHeight, maxHeight: containerHeight }}
    >
      {/* Container do Embla */}
      <div ref={emblaRef} className="overflow-hidden w-full h-full">
        <div className="flex h-full">
          {slideData.map((slide, index) => (
            <SliderSlide
              key={slide.id}
              slide={slide}
              index={index}
              isMobile={isMobile}
              height={containerHeight}
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
