import { useEffect, useRef } from "react";

export const useSliderIntersection = (
  onVisibilityChange: (isVisible: boolean) => void,
  threshold: number = 0.5
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [onVisibilityChange, threshold]);

  return ref;
};
