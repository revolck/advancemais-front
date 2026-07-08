"use client";

import Link from "next/link";
import { ButtonCustom } from "@/components/ui/custom";
import type { RecrutamentoContentProps } from "@/api/websites/components";

const RecrutamentoContent = ({ title, description, buttonUrl, buttonLabel }: RecrutamentoContentProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:text-left">
      <h1 className="text-[var(--primary-color)] font-bold !leading-tight">{title}</h1>
      <p className="!leading-relaxed !text-justify">{description}</p>
      <Link href={buttonUrl}>
        <ButtonCustom
          size="lg"
          variant="secondary"
          withAnimation
          data-popup-target="website-recrutamento-cta"
        >
          {buttonLabel}
        </ButtonCustom>
      </Link>
    </div>
  );
};

export default RecrutamentoContent;
