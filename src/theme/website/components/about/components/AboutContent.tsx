"use client";

import { AboutContentProps } from "@/api/websites/components";

const AboutContent = ({ title, description }: AboutContentProps) => {
  return (
    <div className="w-full text-center lg:w-1/2 lg:text-left">
      <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[var(--primary-color)] leading-tight">
        {title}
      </h2>
      <p className="text-gray-600 mb-6 leading-relaxed text-justify lg:text-left text-base lg:text-lg">
        {description}
      </p>
    </div>
  );
};

export default AboutContent;
