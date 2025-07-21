// src/theme/website/components/about-advantages/index.ts

export { default } from "./AboutAdvantages";
export { default as AboutAdvantages } from "./AboutAdvantages";

export { WhyChooseSection } from "./components/WhyChooseSection";
export { AboutSection } from "./components/AboutSection";
export { AdvantageCard } from "./components/AdvantageCard";

export { useAboutAdvantagesData } from "./hooks/useAboutAdvantagesData";

export type {
  AboutAdvantagesProps,
  AboutAdvantagesApiData,
  AdvantageCard as AdvantageCardType,
  WhyChooseData,
  AboutData,
} from "./types";
export {
  DEFAULT_ABOUT_ADVANTAGES_DATA,
  ABOUT_ADVANTAGES_CONFIG,
} from "./constants";
