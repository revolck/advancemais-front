"use client";

import React from "react";
import { BannerItem } from "../types";
import { BannerCard } from "./BannerCard";

interface BannerGridProps {
  banners: BannerItem[];
}

export const BannerGrid: React.FC<BannerGridProps> = ({ banners }) => {
  return (
    <div
      className="
      grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 
      gap-4 sm:gap-6 lg:gap-8
      px-4 sm:px-6 lg:px-8
    "
    >
      {banners.map((banner, index) => (
        <BannerCard key={banner.id} banner={banner} priority={index < 3} />
      ))}
    </div>
  );
};
