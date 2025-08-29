"use client";

import React from "react";
import { SliderAdvanced } from "../SliderAdvanced";
import type { SliderConfig } from "../types";
import { SLIDER_CONFIG as DEFAULT_CONFIG } from "../constants/config";

const HERO_CONFIG: SliderConfig = {
  loop: true,
  align: "center",
  dragFree: false,
  autoplay: {
    enabled: true,
    delay: 7000, // Mais lento para hero
  },
  ui: { height: DEFAULT_CONFIG.ui.height },
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
