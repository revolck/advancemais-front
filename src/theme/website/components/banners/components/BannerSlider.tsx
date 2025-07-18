"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { BannerItem } from "../types";
import { useEffect } from "react";

interface Props {
  slides: BannerItem[];
  isMobile: boolean;
}

const BannerSlider = ({ slides, isMobile }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    isMobile ? [Autoplay({ delay: 3000, stopOnInteraction: false })] : []
  );

  useEffect(() => {
    if (!isMobile && emblaApi) {
      emblaApi.destroy();
    }
  }, [isMobile, emblaApi]);

  return (
    <div ref={emblaRef} className="overflow-hidden w-full px-4">
      <div className="flex touch-pan-x gap-4">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="min-w-[90%] sm:min-w-[300px] flex-shrink-0 flex justify-center"
          >
            <Link href={slide.linkUrl} className="block w-full">
              <Image
                src={slide.imagemUrl}
                alt={`Banner ${slide.id}`}
                width={600}
                height={400}
                className="rounded-xl object-cover w-full h-[220px] sm:h-[300px] shadow-lg"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
