"use client";

import { AboutContentProps } from "@/api/websites/components";

const AboutContent = ({ title, description }: AboutContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h1 className="text-[var(--primary-color)] font-bold !leading-tight">
        {title}
      </h1>
      <p className="!leading-relaxed !text-justify">{description}</p>
    </div>
  );
};

export default AboutContent;
