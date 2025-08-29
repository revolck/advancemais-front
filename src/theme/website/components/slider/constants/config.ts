import type { SliderConfig } from "../types";

export const SLIDER_CONFIG: SliderConfig = {
  loop: true,
  align: "center",
  dragFree: false,
  autoplay: {
    enabled: true,
    delay: 10000,
  },
  ui: {
    height: 500,
  },
};
