"use client";

import React, { useMemo, useState, useEffect } from "react";
import { BannerSlider } from "./components/BannerSlider";
import { BannerGrid } from "./components/BannerGrid";
import { BANNERS } from "./constants";
import { BannersGroupProps } from "./types";

const BannersGroup: React.FC<BannersGroupProps> = ({
  className = "",
  title = "Impulsione você e sua empresa",
}) => {
  // Hook para detectar mobile - versão simplificada
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sortedBanners = useMemo(
    () => [...BANNERS].sort((a, b) => a.position - b.position),
    []
  );

  return (
    <section className={`relative py-12 mt-[-40px] mb-5 ${className}`}>
      <div className="relative max-w-[1560px] mx-auto z-10">
        <header className="text-center mb-8 sm:mb-12">
          <h2
            className="
            text-2xl sm:text-3xl lg:text-4xl font-bold
            text-[var(--primary-color)] 
            leading-snug sm:leading-tight
            max-w-4xl mx-auto
          "
          >
            {title.split(" ").reduce((acc, word, index, arr) => {
              if (index === Math.ceil(arr.length / 2)) {
                acc.push(<br key="break" className="sm:hidden" />);
              }
              acc.push(word + " ");
              return acc;
            }, [] as React.ReactNode[])}
          </h2>
        </header>

        {isMobile ? (
          <BannerSlider banners={sortedBanners} />
        ) : (
          <BannerGrid banners={sortedBanners} />
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-gray-50/20 to-transparent" />
    </section>
  );
};

export default BannersGroup;
