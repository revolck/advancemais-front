"use client";

import React from "react";
import { SliderAdvanced } from "../SliderAdvanced";
import type { SliderConfig } from "../types";

const GALLERY_CONFIG: SliderConfig = {
  loop: false,
  align: "start",
  dragFree: true,
  autoplay: {
    enabled: false,
    delay: 0,
  },
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
