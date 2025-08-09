import type { SlideData } from "@/theme/website/components/slider/types";
import { SLIDES } from "@/theme/website/components/slider/constants/slides";

export const sliderMockData: SlideData[] = SLIDES.desktop;

export async function getSliderDataMock(): Promise<SlideData[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return sliderMockData;
}
