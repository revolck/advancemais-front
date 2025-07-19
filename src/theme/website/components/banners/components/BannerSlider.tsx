"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { BannerItem } from "../types";
import { BannerCard } from "./BannerCard";
import { BANNER_CONFIG } from "../constants";

interface BannerSliderProps {
  banners: BannerItem[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: false,
    },
    [
      Autoplay({
        delay: BANNER_CONFIG.mobile.autoplay.delay,
        stopOnInteraction: BANNER_CONFIG.mobile.autoplay.stopOnInteraction,
      }),
    ]
  );

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 px-4">
          {banners.map((banner, index) => (
            <div key={banner.id} className="flex-none w-[85vw] max-w-[320px]">
              <BannerCard banner={banner} priority={index < 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
