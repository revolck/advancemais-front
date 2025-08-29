"use client";

import React from "react";
import { SliderAdvanced } from "../SliderAdvanced";
import type { SliderConfig } from "../types";
import { SLIDER_CONFIG as DEFAULT_CONFIG } from "../constants/config";

const GALLERY_CONFIG: SliderConfig = {
  loop: false,
  align: "start",
  dragFree: true,
  autoplay: {
    enabled: false,
    delay: 0,
  },
  ui: { height: DEFAULT_CONFIG.ui.height },
};

export const SliderGallery: React.FC = () => {
  return (
    <SliderAdvanced
      config={GALLERY_CONFIG}
      enableKeyboard={true}
      enableIntersectionPause={false}
      showPlayPause={false}
      className="w-full max-w-4xl mx-auto"
    />
  );
};
