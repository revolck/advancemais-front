// src/theme/website/components/testimonials-carousel/index.ts

// Componente principal
export { default } from "./TestimonialsCarousel";
export { default as TestimonialsCarousel } from "./TestimonialsCarousel";

// Componentes individuais
export { TestimonialItem } from "./components/TestimonialItem";

// Hook
export { useTestimonialsData } from "./hooks/useTestimonialsData";

// Tipos e constantes
export type {
  TestimonialData,
  TestimonialsCarouselProps,
  TestimonialItemProps,
} from "./types";
export { DEFAULT_TESTIMONIALS_DATA, TESTIMONIALS_CONFIG } from "./constants";
