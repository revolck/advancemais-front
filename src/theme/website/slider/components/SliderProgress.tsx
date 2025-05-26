import React from "react";
import { useSliderProgress } from "../hooks/useSliderProgress";
import type { EmblaCarouselType } from "embla-carousel";

interface SliderProgressProps {
  emblaApi: EmblaCarouselType | undefined;
  autoplayDelay?: number;
  className?: string;
}

export const SliderProgress: React.FC<SliderProgressProps> = ({
  emblaApi,
  autoplayDelay = 5000,
  className = "",
}) => {
  const progress = useSliderProgress(emblaApi, autoplayDelay);

  return (
    <div
      className={`absolute left-0 right-0 h-1 bg-black/20 z-20 ${className}`}
    >
      <div
        className="h-full bg-blue-500 transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
