export interface SlideData {
  id: number;
  image: string;
  title?: string;
  subtitle?: string;
  cta?: {
    text: string;
    href: string;
  };
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
}

export interface SliderContainerProps {
  emblaRef: (node: HTMLElement | null) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onScrollPrev: () => void;
  onScrollNext: () => void;
  currentSlide: number;
  slideCount: number;
}

export interface SliderSlideProps {
  slide: SlideData;
  index: number;
  isMobile: boolean;
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
