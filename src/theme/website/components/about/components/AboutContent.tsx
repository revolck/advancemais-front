"use client";

import { AboutContentProps } from "@/api/websites/components";

const AboutContent = ({ title, description }: AboutContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h1 className="text-3xl mb-4 text-neutral-600">
        <span className="font-bold">{title}</span>
      </h1>
      <p className="text-neutral-400 leading-relaxed text-justify lg:text-left text-base lg:text-lg">
        {description}
      </p>
    </div>
  );
};

export default AboutContent;
