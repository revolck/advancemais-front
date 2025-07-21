// src/theme/website/components/testimonials-carousel/TestimonialsCarousel.tsx

"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialItem } from "./components/TestimonialItem";
import { useTestimonialsData } from "./hooks/useTestimonialsData";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import type { TestimonialsCarouselProps } from "./types";

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  className,
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
}) => {
  const isMobile = useIsMobile();
  const { data, isLoading, error, refetch } = useTestimonialsData(
    fetchFromApi,
    staticData
  );
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      onDataLoaded?.(data);
    }
  }, [data, isLoading, onDataLoaded]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Atualiza estados dos botões quando a API do Embla muda
  useEffect(() => {
    if (!emblaApi) return;

    const updateButtonStates = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("init", updateButtonStates);
    emblaApi.on("select", updateButtonStates);
    emblaApi.on("reInit", updateButtonStates);

    return () => {
      emblaApi.off("init", updateButtonStates);
      emblaApi.off("select", updateButtonStates);
      emblaApi.off("reInit", updateButtonStates);
    };
  }, [emblaApi]);

  // Handlers para navegação
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar depoimentos"
            icon="AlertCircle"
            className="mx-auto mb-6"
          />
          <ButtonCustom onClick={refetch} variant="default" icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto mb-12">
        {/* Título da seção */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-4">
            Depoimentos
          </h2>
        </div>

        {/* Container do Carrossel com Navegação Externa */}
        <div className="relative mx-auto">
          {/* Botões de Navegação - POSICIONADOS FORA DO CARROSSEL */}
          {!isMobile && (
            <>
              {/* Botão Anterior */}
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 z-20",
                  "w-12 h-12 rounded-full",
                  "flex items-center justify-center",
                  "transition-all duration-300 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  canScrollPrev
                    ? [
                        "bg-[var(--primary-color)] text-white",
                        "hover:bg-[var(--primary-color)]/90",
                        "hover:scale-110 hover:shadow-lg",
                        "active:scale-95",
                        "shadow-md hover:shadow-xl",
                      ]
                    : ["bg-gray-200 text-gray-400 cursor-not-allowed"]
                )}
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Botão Próximo */}
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 z-20",
                  "w-12 h-12 rounded-full",
                  "flex items-center justify-center",
                  "transition-all duration-300 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  canScrollNext
                    ? [
                        "bg-[var(--primary-color)] text-white",
                        "hover:bg-[var(--primary-color)]/90",
                        "hover:scale-110 hover:shadow-lg",
                        "active:scale-95",
                        "shadow-md hover:shadow-xl",
                      ]
                    : ["bg-gray-200 text-gray-400 cursor-not-allowed"]
                )}
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Carrossel - COM PADDING PARA OS BOTÕES */}
          <div
            className={cn(
              "w-full",
              !isMobile && "px-16" // Padding apenas no desktop para acomodar os botões
            )}
          >
            <Carousel
              className="w-full"
              opts={{
                align: isMobile ? "center" : "start",
                containScroll: "trimSnaps",
                loop: true,
              }}
              setApi={setEmblaApi}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {data.map((testimonial, index) => (
                  <CarouselItem
                    key={testimonial.id}
                    className={cn(
                      "pl-2 md:pl-4",
                      isMobile ? "basis-full" : "basis-1/3"
                    )}
                  >
                    <div className="h-full">
                      <TestimonialItem data={testimonial} index={index} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Removemos os botões padrão do carousel */}
              <CarouselPrevious className="hidden" />
              <CarouselNext className="hidden" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
