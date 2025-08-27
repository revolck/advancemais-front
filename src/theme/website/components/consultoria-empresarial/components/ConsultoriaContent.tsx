"use client";

import Link from "next/link";
import { ButtonCustom } from "@/components/ui/custom";
import type { ConsultoriaContentProps } from "@/api/websites/components";

const ConsultoriaContent = ({ title, description, buttonUrl, buttonLabel }: ConsultoriaContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h1 className="text-[var(--primary-color)] font-bold !leading-tight">{title}</h1>
      <p className="!leading-relaxed !text-justify">{description}</p>
      <Link href={buttonUrl}>
        <ButtonCustom size="lg" variant="secondary" withAnimation>
          {buttonLabel}
        </ButtonCustom>
      </Link>
    </div>
  );
};

export default ConsultoriaContent;
