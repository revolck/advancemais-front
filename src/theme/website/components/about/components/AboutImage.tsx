"use client";

import Image from "next/image";
import { AboutImageProps } from "../types";

const AboutImage = ({ src, alt, width, height }: AboutImageProps) => {
  return (
    <div className="w-full lg:w-1/2">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        layout="responsive"
        className="rounded-lg object-cover"
      />
    </div>
  );
};

export default AboutImage;
