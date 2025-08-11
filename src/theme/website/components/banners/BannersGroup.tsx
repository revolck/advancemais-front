"use client";

import React, { useState, useEffect } from "react";
import { BannerSlider } from "./components/BannerSlider";
import { BannerGrid } from "./components/BannerGrid";
import { BannersGroupProps, BannerItem } from "./types";
import { getBannerDataClient } from "@/api/websites/components/banner";

const BannersGroup: React.FC<BannersGroupProps> = ({
  className = "",
  title = "Impulsione você e sua empresa",
}) => {
  // Hook para detectar mobile - versão simplificada
  const [isMobile, setIsMobile] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carrega banners da API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getBannerDataClient();
        if (active)
          setBanners(data.sort((a, b) => a.position - b.position));
      } catch (error) {
        console.error("Erro ao carregar banners:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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

        {!isLoading && banners.length > 0 && (
          isMobile ? (
            <BannerSlider banners={banners} />
          ) : (
            <BannerGrid banners={banners} />
          )
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-gray-50/20 to-transparent" />
    </section>
  );
};

export default BannersGroup;
