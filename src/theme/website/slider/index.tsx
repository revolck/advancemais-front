export { default as Slider } from "./SliderBasic";
export { default } from "./SliderBasic";

// Variações especializadas
export { SliderAdvanced } from "./SliderAdvanced";
export { SliderWithProgress } from "./SliderWithProgress";
export { SliderHero } from "./variants/SliderHero";
export { SliderGallery } from "./variants/SliderGallery";
export { SliderTestimonials } from "./variants/SliderTestimonials";

// Componentes individuais (para uso avançado)
export { SliderContainer } from "./components/SliderContainer";
export { SliderSlide } from "./components/SliderSlide";
export { SliderControls } from "./components/SliderControls";
export { SliderSkeleton } from "./components/SliderSkeleton";
export { SliderError } from "./components/SliderError";

// Hooks (para criar versões customizadas)
export { useSlider } from "./hooks/useSlider";
export { useSliderAutoplay } from "./hooks/useSliderAutoplay";
export { useSliderKeyboard } from "./hooks/useSliderKeyboard";
export { useSliderIntersection } from "./hooks/useSliderIntersection";

// Tipos (para TypeScript)
export type { SlideData, SliderConfig, SliderContainerProps } from "./types";
