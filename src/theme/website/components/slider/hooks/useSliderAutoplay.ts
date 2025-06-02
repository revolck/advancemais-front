import { useCallback, useEffect, useRef } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export const useSliderAutoplay = (
  emblaApi: EmblaCarouselType | undefined,
  autoplayConfig?: { enabled: boolean; delay: number }
) => {
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (!emblaApi || !autoplayConfig?.enabled) return;

    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoplayConfig.delay);
  }, [emblaApi, autoplayConfig, stopAutoplay]);

  useEffect(() => {
    if (!emblaApi || !autoplayConfig?.enabled) return;

    startAutoplay();

    emblaApi.on("pointerDown", stopAutoplay);
    emblaApi.on("pointerUp", startAutoplay);

    return () => {
      stopAutoplay();
      emblaApi.off("pointerDown", stopAutoplay);
      emblaApi.off("pointerUp", startAutoplay);
    };
  }, [emblaApi, startAutoplay, stopAutoplay, autoplayConfig]);

  return { startAutoplay, stopAutoplay };
};
