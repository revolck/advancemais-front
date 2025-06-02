import { useState, useEffect, useRef } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export const useSliderProgress = (
  emblaApi: EmblaCarouselType | undefined,
  autoplayDelay: number = 5000
) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!emblaApi) return;

    let startTime: number;

    const startProgress = () => {
      startTime = Date.now();
      setProgress(0);

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / autoplayDelay) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 16); // ~60fps
    };

    const stopProgress = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(0);
    };

    const resetProgress = () => {
      stopProgress();
      startProgress();
    };

    startProgress();
    emblaApi.on("select", resetProgress);
    emblaApi.on("pointerDown", stopProgress);
    emblaApi.on("pointerUp", startProgress);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      emblaApi.off("select", resetProgress);
      emblaApi.off("pointerDown", stopProgress);
      emblaApi.off("pointerUp", startProgress);
    };
  }, [emblaApi, autoplayDelay]);

  return progress;
};
