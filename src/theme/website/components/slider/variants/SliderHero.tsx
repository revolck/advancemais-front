"use client";

import React from "react";
import { SliderAdvanced } from "../SliderAdvanced";
import type { SliderConfig } from "../types";

const HERO_CONFIG: SliderConfig = {
  loop: true,
  align: "center",
  dragFree: false,
  autoplay: {
    enabled: true,
    delay: 6000, // Mais lento para hero
  },
};

export const SliderHero: React.FC = () => {
  return (
    <SliderAdvanced
      config={HERO_CONFIG}
      enableKeyboard={true}
      enableIntersectionPause={true}
      showPlayPause={false}
      className="w-full"
    />
  );
};
