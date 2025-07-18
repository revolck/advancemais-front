"use client";

import { AboutContentProps } from "../types";

const AboutContent = ({ title, description }: AboutContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h2 className="mb-4 !text-[var(--primary-color)]">{title}</h2>
      <p className="text-justify ">{description}</p>
    </div>
  );
};

export default AboutContent;
