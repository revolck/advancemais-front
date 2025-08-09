"use client";

import React, { useEffect, useState } from "react";
import { SliderContainer } from "./components/SliderContainer";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { SLIDER_CONFIG } from "./constants/config";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { getSliderDataClient } from "@/api/websites/components/slide";
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

  // Carrega slides da API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getSliderDataClient();
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
    return <div className="w-full" style={{ aspectRatio: 16 / 9 }} />;
  }

  // Se não há slides, renderiza um fallback elegante
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full relative" style={{ aspectRatio: 16 / 9 }}>
        <ImageNotFound
          size="full"
          variant="muted"
          aspectRatio="landscape"
          message="Nenhum slide disponível"
          icon="ImageOff"
          className="h-full"
          showMessage={true}
        />
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
