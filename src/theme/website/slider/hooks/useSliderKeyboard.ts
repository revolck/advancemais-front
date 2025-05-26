import { useEffect } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export const useSliderKeyboard = (
  emblaApi: EmblaCarouselType | undefined,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!emblaApi || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Só funciona se o slider estiver focado ou visível
      const activeElement = document.activeElement;
      const sliderContainer = emblaApi.containerNode();

      if (!sliderContainer.contains(activeElement)) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          emblaApi.scrollPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          emblaApi.scrollNext();
          break;
        case "Home":
          event.preventDefault();
          emblaApi.scrollTo(0);
          break;
        case "End":
          event.preventDefault();
          emblaApi.scrollTo(emblaApi.slideNodes().length - 1);
          break;
        case " ": // Spacebar
          event.preventDefault();
          emblaApi.scrollNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi, enabled]);
};
