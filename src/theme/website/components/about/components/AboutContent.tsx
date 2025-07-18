"use client";

import { AboutContentProps } from "../types";

const AboutContent = ({ title, highlight, description }: AboutContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h1 className="text-3xl mb-4 text-neutral-600">
        <span className="font-bold">{title}</span> {highlight}
      </h1>
      <p className="text-neutral-400 leading-relaxed text-justify">
        {description}
      </p>
    </div>
  );
};

export default AboutContent;
