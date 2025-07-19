"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { CourseCard } from "./components/CourseCard";
import { useCoursesData } from "./hooks/useCoursesData";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import { ButtonCustom } from "@/components/ui/custom/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CoursesCarouselProps } from "./types";

const CoursesCarousel: React.FC<CoursesCarouselProps> = ({
  title = "Cursos em destaque",
  buttonText = "Ver todos os cursos",
  buttonUrl = "/cursos",
  fetchFromApi = true,
  staticData,
  onDataLoaded,
  onError,
  onCourseClick,
}) => {
  const isMobile = useIsMobile();
  const { data, isLoading, error, refetch } = useCoursesData(
    fetchFromApi,
    staticData
  );

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

  // Estado de carregamento
  if (isLoading) {
    return (
      <section className="container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8 mt-5">
        <div className="w-full bg-white">
          <div className="container mx-auto lg:px-4">
            <div className="flex flex-col items-center justify-center mb-8 space-y-0 md:flex-row md:items-center md:space-y-0 md:justify-between">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
              {!isMobile && (
                <div className="h-12 bg-gray-200 rounded animate-pulse w-48" />
              )}
            </div>
            <div className="flex gap-5 overflow-hidden px-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[300px] h-[500px] bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Estado de erro
  if (error && (!data || data.length === 0)) {
    return (
      <section className="container mx-auto py-16">
        <div className="text-center">
          <ImageNotFound
            size="lg"
            variant="error"
            message="Erro ao carregar cursos"
            icon="GraduationCap"
            className="mx-auto mb-6"
          />
          <ButtonCustom onClick={refetch} icon="RefreshCw">
            Tentar Novamente
          </ButtonCustom>
        </div>
      </section>
    );
  }

  // Estado normal - LAYOUT IGUAL AO ORIGINAL
  return (
    <section className="container mx-auto py-16 flex flex-col lg:flex-row items-center gap-8 mt-5">
      <div className="w-full">
        <div className="container mx-auto lg:px-4">
          {/* Header - igual ao original */}
          <div className="flex flex-col items-center justify-center mb-8 space-y-0 md:flex-row md:items-center md:space-y-0 md:justify-between">
            <h2 className="text-3xl font-bold text-neutral-800 text-center md:text-left">
              {title}
            </h2>
            {!isMobile && (
              <Link href={buttonUrl}>
                <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-500 transition flex items-center">
                  {buttonText} <span className="ml-2">→</span>
                </button>
              </Link>
            )}
          </div>

          {/* Carousel Container - IGUAL AO ORIGINAL */}
          <div className="relative w-screen overflow-x-visible px-10 lg:px-5">
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                containScroll: "trimSnaps",
                loop: true,
              }}
            >
              <CarouselContent className="flex space-x-5 px-4 ml-0">
                {data.map((course) => (
                  <CarouselItem
                    key={course.id}
                    className="flex-shrink-0 basis-[300px] w-[300px] h-[500px] rounded-lg shadow-lg overflow-hidden relative"
                  >
                    <Link
                      href={course.url || `/cursos/${course.id}`}
                      onClick={() => onCourseClick?.(course)}
                    >
                      <CourseCard
                        course={course}
                        onCourseClick={onCourseClick}
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Botões de navegação - POSIÇÃO ORIGINAL */}
              <CarouselPrevious className="courses-carousel-button-previous">
                <ChevronLeft className="w-5 h-5" />
              </CarouselPrevious>

              <CarouselNext className="courses-carousel-button-next">
                <ChevronRight className="w-5 h-5" />
              </CarouselNext>
            </Carousel>
          </div>

          {/* Botão Mobile - igual ao original */}
          {isMobile && (
            <div className="mt-4 flex justify-center">
              <Link href={buttonUrl}>
                <button className="bg-red-600 text-white px-6 py-3 mt-5 rounded-md hover:bg-red-500 transition flex items-center">
                  {buttonText} <span className="ml-2">→</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CoursesCarousel;
