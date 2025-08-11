"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { BannerItem } from "../types";
import { BannerCard } from "./BannerCard";

interface BannerSliderProps {
  banners: BannerItem[];
}

const AUTOPLAY_OPTIONS = { delay: 4000, stopOnInteraction: true };

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      dragFree: false,
    },
    [Autoplay(AUTOPLAY_OPTIONS)]
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
