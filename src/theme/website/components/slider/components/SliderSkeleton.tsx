"use client";

import React from "react";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";

interface SliderSkeletonProps {
  message?: string;
}

export const SliderSkeleton: React.FC<SliderSkeletonProps> = ({
  message = "Carregando slides...",
}) => {
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: 16 / 9 }}
    >
      <ImageNotFound
        size="full"
        variant="muted"
        aspectRatio="landscape"
        message={message}
        icon="Loader2"
        className="h-full [&_svg]:animate-spin"
        showMessage={true}
      />
    </div>
  );
};
