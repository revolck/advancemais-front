"use client";

import * as React from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CourseCarouselProps {
  children: React.ReactNode[];
  itemsPerPage?: number;
  className?: string;
  title?: string;
  showIndicators?: boolean;
}

export function CourseCarousel({
  children,
  itemsPerPage = 4,
  className,
  title,
  showIndicators = false,
}: CourseCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  // Determina o tamanho base do item baseado em itemsPerPage
  const itemBasis = useMemo(() => {
    if (itemsPerPage === 1) return "basis-full";
    if (itemsPerPage === 2) return "basis-1/2";
    if (itemsPerPage === 3) return "basis-1/3";
    if (itemsPerPage === 4) return "basis-1/4";
    return "basis-full";
  }, [itemsPerPage]);

  // Agrupa os cursos em slides de itemsPerPage
  const groupedChildren = useMemo(() => {
    const groups: React.ReactNode[][] = [];
    for (let i = 0; i < children.length; i += itemsPerPage) {
      groups.push(children.slice(i, i + itemsPerPage));
    }
    return groups;
  }, [children, itemsPerPage]);

  // Calcula quantos slides são necessários (grupos de itemsPerPage)
  const totalSlides = groupedChildren.length;
  const needsCarousel = children.length > itemsPerPage;

  if (children.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full space-y-4", className)}>
      {/* Header com título e navegação */}
      <div className="flex items-center justify-between">
        {title && <h4 className="mb-0!">{title}</h4>}
        {needsCarousel && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md",
                canScrollPrev
                  ? "cursor-pointer text-gray-700 hover:text-gray-900"
                  : "opacity-40 cursor-not-allowed"
              )}
              disabled={!canScrollPrev}
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Slide anterior</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md",
                canScrollNext
                  ? "cursor-pointer text-gray-700 hover:text-gray-900"
                  : "opacity-40 cursor-not-allowed"
              )}
              disabled={!canScrollNext}
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Próximo slide</span>
            </Button>
          </div>
        )}
      </div>

      {/* Carousel ou Grid estático */}
      {needsCarousel ? (
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {groupedChildren.map((group, groupIndex) => (
              <CarouselItem
                key={groupIndex}
                className="pl-2 md:pl-4 basis-full"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.map((child, childIndex) => (
                    <React.Fragment key={childIndex}>{child}</React.Fragment>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        // Se não precisa de carousel, apenas mostra o grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {children}
        </div>
      )}

      {/* Indicadores de página */}
      {showIndicators && needsCarousel && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => {
            const isActive = current === index;

            return (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  isActive
                    ? "w-8 bg-gray-900"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Ir para grupo ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
