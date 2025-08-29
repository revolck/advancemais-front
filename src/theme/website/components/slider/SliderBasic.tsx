"use client";

import React, { useEffect, useState } from "react";
import { SliderContainer } from "./components/SliderContainer";
import { Icon } from "@/components/ui/custom/Icons";
import { SLIDER_CONFIG } from "./constants/config";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { getSliderDataClient } from "@/api/websites/components/slider";
import type { SlideData } from "./types";

const SliderBasic: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    emblaRef,
    emblaApi,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    currentSlide,
    slideCount,
  } = useSlider(SLIDER_CONFIG);

  // Carrega slides da API (orientação DESKTOP por padrão)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getSliderDataClient("DESKTOP");
        if (active) setSlides(data);
      } catch (error) {
        console.error("Erro ao carregar slides:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Re-inicializa o Embla quando os slides mudam
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, slides]);

  // Autoplay básico
  useSliderAutoplay(emblaApi, SLIDER_CONFIG.autoplay);

  // Enquanto carrega, mostra apenas um espaço reservado
  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[600px]" />
    );
  }

  // Se não há slides, renderiza um fallback com cor primária
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[600px] bg-[var(--primary-color)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon name="ImageOff" className="w-8 h-8 text-white opacity-90" />
          <span className="text-white/90">Nenhum slider disponível</span>
        </div>
      </div>
    );
  }

  return (
    <SliderContainer
      emblaRef={emblaRef}
      canScrollPrev={canScrollPrev}
      canScrollNext={canScrollNext}
      onScrollPrev={scrollPrev}
      onScrollNext={scrollNext}
      currentSlide={currentSlide}
      slideCount={slideCount}
      slides={slides}
    />
  );
};

export default SliderBasic;
