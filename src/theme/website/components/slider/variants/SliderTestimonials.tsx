"use client";

import React from "react";
import { SliderWithProgress } from "../SliderWithProgress";

export const SliderTestimonials: React.FC = () => {
  return (
    <SliderWithProgress
      showNumbers={true}
      progressPosition="bottom"
      className="w-full bg-gray-50"
    />
  );
};
