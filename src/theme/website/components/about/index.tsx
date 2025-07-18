"use client";

import AboutImage from "./components/AboutImage";
import AboutContent from "./components/AboutContent";
import { ABOUT_IMAGE, ABOUT_CONTENT } from "./constants";

const AboutSection = () => {
  return (
    <section>
      <div className="container mx-auto py-16 px-4 flex flex-col lg:flex-row items-center gap-20 mt-5">
        <AboutImage {...ABOUT_IMAGE} />
        <AboutContent {...ABOUT_CONTENT} />
      </div>
    </section>
  );
};

export default AboutSection;
