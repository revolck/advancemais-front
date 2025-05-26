import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { SliderSkeleton } from "./SliderSkeleton";

// Import dinâmico do slider para code splitting
const SliderComponent = dynamic(() => import("../index"), {
  loading: () => <SliderSkeleton />,
  ssr: false, // Desabilita SSR se necessário
});

export const LazySlider: React.FC = () => {
  return (
    <Suspense fallback={<SliderSkeleton />}>
      <SliderComponent />
    </Suspense>
  );
};
