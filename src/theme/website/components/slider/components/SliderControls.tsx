import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SliderControlsProps } from "../types";

export const SliderControls: React.FC<SliderControlsProps> = ({
  canScrollPrev,
  canScrollNext,
  onScrollPrev,
  onScrollNext,
}) => {
  return (
    <>
      {/* Botão Previous */}
      <button
        className={`
          absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 md:w-12 md:h-12 
          bg-black/50 hover:bg-black/70 
          text-white rounded-full
          flex items-center justify-center
          transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:scale-110 active:scale-95
        `}
        onClick={onScrollPrev}
        disabled={!canScrollPrev}
        aria-label="Slide anterior"
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Botão Next */}
      <button
        className={`
          absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 md:w-12 md:h-12 
          bg-black/50 hover:bg-black/70 
          text-white rounded-full
          flex items-center justify-center
          transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed
          hover:scale-110 active:scale-95
        `}
        onClick={onScrollNext}
        disabled={!canScrollNext}
        aria-label="Próximo slide"
      >
        <ChevronRight size={20} className="md:w-6 md:h-6" />
      </button>
    </>
  );
};
