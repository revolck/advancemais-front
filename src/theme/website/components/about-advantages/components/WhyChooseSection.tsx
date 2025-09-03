// src/theme/website/components/about-advantages/components/WhyChooseSection.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdvantageCard } from "./AdvantageCard";
import type { WhyChooseSectionProps } from "../types";

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({
  data,
  cards,
}) => {
  const activeCards = cards
    .filter((card) => card.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="aboutAdvantagesPx py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
          {activeCards.map((card, index) => (
            <AdvantageCard key={card.id} card={card} index={index} />
          ))}
        </div>

        {/* Lado direito com texto */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-6">
            {data.title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {data.description}
          </p>

          <Link href={data.buttonUrl}>
            <Button
              className="mt-2 bg-[var(--secondary-color)] hover:bg-[var(--secondary-color)]/90 text-white cursor-pointer"
              size="lg"
            >
              {data.buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
