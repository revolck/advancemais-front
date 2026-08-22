"use client";

import React, { useEffect, useState } from "react";
import { SliderContainer } from "./components/SliderContainer";
import { SLIDER_CONFIG } from "./constants/config";
import { useSlider } from "./hooks/useSlider";
import { useSliderAutoplay } from "./hooks/useSliderAutoplay";
import { getSliderDataClient } from "@/api/websites/components/slider";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SlideData } from "./types";

interface SliderBasicProps {
  fetchFromApi?: boolean;
  staticData?: SlideData[];
  staticDataMobile?: SlideData[];
}

const SliderBasic: React.FC<SliderBasicProps> = ({
  fetchFromApi = true,
  staticData,
  staticDataMobile,
}) => {
  const [slides, setSlides] = useState<SlideData[]>(() =>
    !fetchFromApi ? (staticData ?? []) : [],
  );
  const [isLoading, setIsLoading] = useState(fetchFromApi);

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

  const isMobile = useIsMobile();
  // Mobile: usa razão 1:1 (quadrado), não altura fixa

  // Carrega slides da API conforme orientação (DESKTOP / TABLET_MOBILE)
  useEffect(() => {
    if (!fetchFromApi) {
      if (isMobile) {
        setSlides(
          staticDataMobile && staticDataMobile.length > 0
            ? staticDataMobile
            : (staticData ?? []),
        );
      } else {
        setSlides(staticData ?? []);
      }
      setIsLoading(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const orientation = isMobile ? "TABLET_MOBILE" : "DESKTOP";
        let data = await getSliderDataClient(orientation);
        // Fallback: se não houver slides mobile/tablet, usa os de desktop
        if (orientation === "TABLET_MOBILE" && (!data || data.length === 0)) {
          try {
            data = await getSliderDataClient("DESKTOP");
          } catch (_) {
            /* ignore */
          }
        }
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
  }, [fetchFromApi, isMobile, staticData, staticDataMobile]);

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
    if (isMobile) {
      return <div className="w-full aspect-square bg-[var(--primary-color)]" />;
    }
    const h = SLIDER_CONFIG.ui.height;
    return <div className="w-full" style={{ height: h, minHeight: h, maxHeight: h }} />;
  }

  // Se não há slides, renderiza uma explicação do produto em vez de um placeholder vazio
  if (!slides || slides.length === 0) {
    const h = SLIDER_CONFIG.ui.height;
    return (
      <div
        className="w-full bg-[var(--primary-color)] flex items-center justify-center px-4"
        style={{ height: h, minHeight: h, maxHeight: h }}
      >
        <div className="flex flex-col items-center gap-2 text-center max-w-2xl">
          <h2 className="text-white text-2xl md:text-3xl font-bold">
            Advance+ | Inovação em Educação e Tecnologia
          </h2>
          <p className="text-white/90">
            Plataforma integrada de educação, cursos profissionalizantes e
            soluções tecnológicas para empresas e pessoas.
          </p>
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
      heightClass={
        isMobile
          ? "relative w-full overflow-hidden aspect-square bg-[var(--primary-color)]"
          : undefined
      }
      height={isMobile ? undefined : SLIDER_CONFIG.ui.height}
    />
  );
};

export default SliderBasic;
