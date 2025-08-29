export interface SlideData {
  id: number;
  image: string;
  alt?: string;
  link?: string;
  overlay?: boolean;
}

export interface SliderConfig {
  loop: boolean;
  align: "start" | "center" | "end";
  dragFree: boolean;
  autoplay?: {
    enabled: boolean;
    delay: number;
  };
  ui: {
    height: number; // altura fixa em px (ex.: 600)
  };
}

export interface SliderContainerProps {
  emblaRef: (node: HTMLElement | null) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
  currentSlide: number;
  slideCount: number;
  slides?: SlideData[];
  heightClass?: string;
  height?: number;
}

export interface SliderSlideProps {
  slide: SlideData;
  index: number;
  isMobile: boolean;
  height?: number;
}

export interface SliderControlsProps {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
}

export interface SliderDotsProps {
  slideCount: number;
  currentSlide: number;
}
