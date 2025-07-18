"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BannerSlider from "./components/BannerSlider";
import { BANNERS } from "./constants";
import { BannerItem } from "./types";

const BannersGroup = () => {
  const [isMobile, setIsMobile] = useState(false);
  const banners: BannerItem[] = [...BANNERS].sort(
    (a, b) => a.position - b.position
  );

  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
  }, []);

  return (
    <section className="relative py-12 px-4 mt-[-40px] mb-8">
      <div className="relative max-w-[1560px] mx-auto z-10">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10 leading-snug sm:leading-tight">
          Confira os destaques para você <br className="sm:hidden" /> e sua
          empresa decolarem
        </h2>

        {isMobile ? (
          <BannerSlider slides={banners} isMobile />
        ) : (
          <div className="grid grid-cols-5 gap-6 px-4">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.linkUrl}
                className="bg-blue-600 h-[300px] rounded-xl shadow-lg flex justify-center items-center text-white text-xl font-bold text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
              >
                <Image
                  src={banner.imagemUrl}
                  alt={`Banner ${banner.id}`}
                  width={400}
                  height={600}
                  className="w-full h-full object-cover rounded-xl"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BannersGroup;
